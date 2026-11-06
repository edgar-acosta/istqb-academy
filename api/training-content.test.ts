import { beforeEach, describe, expect, it, vi } from "vitest";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { QUIZ_QUESTIONS, QUIZ_TOTAL, LEGACY_QUIZ_QUESTIONS } from "@contracts/quiz";
import { MODULES } from "../src/content";
import * as schema from "../db/schema";
import * as relations from "../db/relations";
import { trainingRouter } from "./training-router";
import { learningRouter } from "./learning-router";
import { PDFDocument } from "pdf-lib";
import app from "./boot";

vi.mock("./queries/connection", () => ({ getDb: () => testDb }));
vi.mock("./auth/local", () => ({
  authenticateRequest: async (headers: Headers) => {
    const userId = headers.get("x-test-user");
    if (!userId) throw { tag: "app_error", status: 403, message: "No autenticado" };
    return { id: Number(userId) };
  },
}));

const sqlite = new Database(":memory:");
const testDb = drizzle(sqlite, { schema: { ...schema, ...relations } });
sqlite.exec(`
  CREATE TABLE module_progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT, userId INTEGER NOT NULL,
    moduleId INTEGER NOT NULL, completedAt INTEGER NOT NULL,
    UNIQUE(userId, moduleId)
  );
  CREATE TABLE quiz_attempts (
    id INTEGER PRIMARY KEY AUTOINCREMENT, userId INTEGER NOT NULL,
    score INTEGER NOT NULL, total INTEGER NOT NULL, answers TEXT NOT NULL,
    createdAt INTEGER NOT NULL
  );
  CREATE TABLE course_progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT, userId INTEGER NOT NULL,
    courseVersion TEXT NOT NULL, moduleId INTEGER NOT NULL, completedAt INTEGER NOT NULL,
    UNIQUE(userId, courseVersion, moduleId)
  );
  CREATE TABLE evaluation_attempts (
    id INTEGER PRIMARY KEY AUTOINCREMENT, userId INTEGER NOT NULL,
    courseVersion TEXT NOT NULL, status TEXT NOT NULL, questions TEXT NOT NULL,
    answers TEXT NOT NULL, revision INTEGER NOT NULL DEFAULT 0, score INTEGER,
    total INTEGER NOT NULL, passingPercent INTEGER NOT NULL, createdAt INTEGER NOT NULL,
    submittedAt INTEGER
  );
  CREATE UNIQUE INDEX evaluation_one_draft_idx ON evaluation_attempts(userId, courseVersion) WHERE status = 'draft';
  CREATE TABLE recognitions (
    id INTEGER PRIMARY KEY AUTOINCREMENT, userId INTEGER NOT NULL,
    courseVersion TEXT NOT NULL, attemptId INTEGER NOT NULL, folio TEXT NOT NULL UNIQUE,
    recipientName TEXT NOT NULL, issuer TEXT NOT NULL, courseTitle TEXT NOT NULL,
    score INTEGER NOT NULL, total INTEGER NOT NULL, passingPercent INTEGER NOT NULL,
    issuedAt INTEGER NOT NULL, UNIQUE(userId, courseVersion)
  );
`);

const context = {
  req: new Request("http://localhost"),
  resHeaders: new Headers(),
  user: {
    id: 1,
    username: "test",
    passwordHash: "test",
    name: null,
    email: null,
    avatar: null,
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignInAt: new Date(),
  },
} satisfies Parameters<typeof trainingRouter.createCaller>[0];
const caller = trainingRouter.createCaller(context);
const learner = learningRouter.createCaller(context);
const otherLearner = learningRouter.createCaller({ ...context, user: { ...context.user, id: 2 } });
const administrator = learningRouter.createCaller({ ...context, user: { ...context.user, role: "admin" } });

function answersWithCorrectCount(count: number) {
  return Object.fromEntries(
    QUIZ_QUESTIONS.map((q, index) => [
      q.id,
      index < count ? q.correctIndex : (q.correctIndex + 1) % q.options.length,
    ]),
  );
}

describe("contenido y evaluación de telemetría", () => {
  beforeEach(() => {
    sqlite.prepare("DELETE FROM quiz_attempts").run();
    sqlite.prepare("DELETE FROM module_progress").run();
    sqlite.prepare("DELETE FROM course_progress").run();
    sqlite.prepare("DELETE FROM recognitions").run();
    sqlite.prepare("DELETE FROM evaluation_attempts").run();
  });

  describe("seguimiento y reconocimiento", () => {
    beforeEach(() => {
      sqlite.prepare("DELETE FROM recognitions").run();
      sqlite.prepare("DELETE FROM evaluation_attempts").run();
      sqlite.prepare("DELETE FROM course_progress").run();
      sqlite.prepare("DELETE FROM quiz_attempts").run();
      sqlite.prepare("DELETE FROM module_progress").run();
    });

    it("recupera borradores, detecta conflictos y protege datos entre usuarios", async () => {
      const draft = await learner.start();
      expect(draft.questions[0]).not.toHaveProperty("correctIndex");
      const saved = await learner.save({ id: draft.id, revision: 0, questionId: draft.questions[0].id, choice: 0 });
      expect((await learner.start()).answers).toEqual(saved.answers);
      await expect(learner.save({ id: draft.id, revision: 0, questionId: draft.questions[0].id, choice: 1 })).rejects.toMatchObject({ code: "CONFLICT" });
      await expect(otherLearner.draft({ id: draft.id })).rejects.toMatchObject({ code: "NOT_FOUND" });
      await expect(learner.submit({ id: draft.id, revision: 1 })).rejects.toMatchObject({ code: "BAD_REQUEST" });
      await expect(learner.save({ id: draft.id, revision: 1, questionId: draft.questions[1].id, choice: 4 })).rejects.toMatchObject({ code: "BAD_REQUEST" });
    });

    it("exige progreso vigente y 70 %, emite una sola constancia y produce un PDF válido", async () => {
      let draft = await learner.start();
      for (const [index, q] of QUIZ_QUESTIONS.entries()) {
        draft = await learner.save({ id: draft.id, revision: draft.revision, questionId: q.id, choice: index < 7 ? q.correctIndex : (q.correctIndex + 1) % 4 });
      }
      const result = await learner.submit({ id: draft.id, revision: draft.revision });
      expect(result.score).toBe(7);
      expect((await learner.submit({ id: draft.id, revision: draft.revision })).id).toBe(result.id);
      expect((await learner.overview()).completedModuleIds).toEqual([]);
      await expect(learner.issue({ name: "María López" })).rejects.toMatchObject({ code: "FORBIDDEN" });
      for (let id = 1; id <= 10; id++) await caller.setModuleCompleted({ moduleId: id, completed: true });
      expect((await learner.overview()).completedModuleIds.sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
      expect((await learner.overview()).eligible).toBe(true);
      const recognition = await learner.issue({ name: "María López" });
      expect((await learner.issue({ name: "María López" })).folio).toBe(recognition.folio);
      await expect(learner.issue({ name: "Otro Nombre" })).rejects.toMatchObject({ code: "CONFLICT" });
      expect((await administrator.verify({ folio: recognition.folio }))?.recipientName).toBe("María López");
      await expect(otherLearner.verify({ folio: recognition.folio })).rejects.toMatchObject({ code: "FORBIDDEN" });
      const url = `/api/recognitions/${recognition.folio}/pdf`;
      expect((await app.request(url)).status).toBe(401);
      expect((await app.request(url, { headers: { "x-test-user": "2" } })).status).toBe(404);
      const response = await app.request(url, { headers: { "x-test-user": "1" } });
      expect(response.status).toBe(200);
      expect(response.headers.get("content-type")).toBe("application/pdf");
      const pdf = await response.arrayBuffer();
      expect(Buffer.from(pdf).subarray(0, 5).toString()).toBe("%PDF-");
      expect((await PDFDocument.load(pdf)).getPageCount()).toBe(1);
    }, 15000);

    it("no emite con 6/10 ni usa progreso histórico para elegibilidad", async () => {
      let draft = await learner.start();
      for (const [index, q] of QUIZ_QUESTIONS.entries()) {
        draft = await learner.save({ id: draft.id, revision: draft.revision, questionId: q.id, choice: index < 6 ? q.correctIndex : (q.correctIndex + 1) % 4 });
      }
      expect((await learner.submit({ id: draft.id, revision: draft.revision })).score).toBe(6);
      for (let id = 1; id <= 10; id++) sqlite.prepare("INSERT INTO module_progress (userId, moduleId, completedAt) VALUES (1, ?, 1)").run(id);
      const overview = await learner.overview();
      expect(overview.completed).toBe(0);
      expect(overview.completedModuleIds).toEqual([]);
      expect(overview.historicalProgress).toBe(10);
      expect(overview.eligible).toBe(false);
      await expect(learner.issue({ name: "María López" })).rejects.toMatchObject({ code: "FORBIDDEN" });
      for (let id = 1; id <= 10; id++) await caller.setModuleCompleted({ moduleId: id, completed: true });
      expect((await learner.overview()).eligible).toBe(false);
      await expect(learner.issue({ name: "María López" })).rejects.toMatchObject({ code: "FORBIDDEN" });
    });
  });

  it("mantiene diez módulos y una pregunta válida por módulo", () => {
    expect(MODULES.map((m) => m.id)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    expect(QUIZ_QUESTIONS).toHaveLength(QUIZ_TOTAL);
    expect(QUIZ_QUESTIONS.map((q) => q.module)).toEqual(MODULES.map((m) => m.id));
    expect(new Set(QUIZ_QUESTIONS.map((q) => q.id)).size).toBe(QUIZ_TOTAL);
    for (const module of MODULES) {
      expect(module.objectives.length).toBeGreaterThan(0);
      expect(module.blocks.length).toBeGreaterThan(0);
      expect(module.example.body.trim()).not.toBe("");
      expect(module.activity.scenario.trim()).not.toBe("");
      expect(module.activity.questions.length).toBeGreaterThan(0);
      expect(module.keyPoints).toHaveLength(3);
    }
    for (const q of QUIZ_QUESTIONS) {
      expect(q.id).toBe(`v2-m${q.module}`);
      expect(q.options).toHaveLength(4);
      expect(new Set(q.options).size).toBe(4);
      expect(q.correctIndex).toBeGreaterThanOrEqual(0);
      expect(q.correctIndex).toBeLessThan(q.options.length);
      expect(q.question.trim()).not.toBe("");
      expect(q.justification.trim()).not.toBe("");
    }
    expect(QUIZ_QUESTIONS[6].options[QUIZ_QUESTIONS[6].correctIndex]).toBe("29, 30, 120 y 121.");
  });

  it("califica 6/10 y 7/10 y conserva el progreso e intentos anteriores", async () => {
    const oldAnswers = JSON.stringify({ q1: 1 });
    sqlite.prepare("INSERT INTO quiz_attempts (userId, score, total, answers, createdAt) VALUES (1, 8, 10, ?, 1)").run(oldAnswers);
    sqlite.prepare("INSERT INTO module_progress (userId, moduleId, completedAt) VALUES (1, 2, 1)").run();

    expect((await caller.submitQuiz({ answers: answersWithCorrectCount(6) })).score).toBe(6);
    expect((await caller.submitQuiz({ answers: answersWithCorrectCount(7) })).score).toBe(7);
    expect(await caller.progress()).toEqual([]);
    expect(sqlite.prepare("SELECT COUNT(*) AS count FROM module_progress").get()).toEqual({ count: 1 });
    const attempts = await caller.myAttempts();
    expect(attempts).toHaveLength(3);
    expect(attempts.find((a) => a.score === 8)?.answers).toEqual({ q1: 1 });
    expect(LEGACY_QUIZ_QUESTIONS.find((q) => q.id === "q1")?.correctIndex).toBe(1);
    expect(QUIZ_QUESTIONS.some((q) => q.id === "q1")).toBe(false);
  });

  it("rechaza respuestas incompletas o de la evaluación anterior", async () => {
    await expect(caller.submitQuiz({ answers: { "v2-m1": 0 } })).rejects.toMatchObject({ code: "BAD_REQUEST" });
    const oldAnswers = Object.fromEntries(LEGACY_QUIZ_QUESTIONS.map((q) => [q.id, q.correctIndex]));
    await expect(caller.submitQuiz({ answers: oldAnswers })).rejects.toMatchObject({ code: "BAD_REQUEST" });
    expect(await caller.myAttempts()).toHaveLength(0);
  });
});
