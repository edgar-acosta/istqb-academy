import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { randomUUID } from "node:crypto";
import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import { eq } from "drizzle-orm";
import { PDFDocument } from "pdf-lib";
import { QUIZ_QUESTIONS } from "@contracts/quiz";
import { users } from "../db/postgres-schema";

const testUrl = process.env.TEST_POSTGRES_URL;
describe.skipIf(!testUrl)("flujos PostgreSQL aislados", () => {
  let db: ReturnType<typeof import("./queries/postgres").getPostgresDb>;
  let close: typeof import("./queries/postgres").closePostgresDb;
  let app: typeof import("./boot").default;
  let training: typeof import("./training-router").trainingRouter;
  let learning: typeof import("./postgres-learning-router").postgresLearningRouter;
  let auth: typeof import("./auth-router").authRouter;
  let handler: typeof import("../server/vercel").default;
  let user: typeof users.$inferSelect;
  let other: typeof users.$inferSelect;
  let cookie: string;

  beforeAll(async () => {
    if (!testUrl) throw new Error("Falta TEST_POSTGRES_URL.");
    process.env.DATABASE_URL = testUrl;
    const postgres = await import("./queries/postgres");
    db = postgres.getPostgresDb();
    close = postgres.closePostgresDb;
    ({ trainingRouter: training } = await import("./training-router"));
    ({ postgresLearningRouter: learning } = await import("./postgres-learning-router"));
    ({ authRouter: auth } = await import("./auth-router"));
    ({ default: app } = await import("./boot"));
    ({ default: handler } = await import("../server/vercel"));
    const registrationContext = { req: new Request("http://localhost"), resHeaders: new Headers() };
    const registered = await auth.createCaller(registrationContext).register({
      username: `test-${randomUUID()}`, password: "synthetic-password", name: "Prueba",
    });
    expect(registered.role).toBe("user");
    const [found] = await db.select().from(users).where(eq(users.id, registered.id));
    user = found;
    const [inserted] = await db.insert(users).values({ username: `test-${randomUUID()}`, passwordHash: "synthetic", role: "user" }).returning();
    other = inserted;
    cookie = registrationContext.resHeaders.get("set-cookie") ?? "";
    expect(cookie).not.toBe("");
    await expect(auth.createCaller({ req: new Request("http://localhost"), resHeaders: new Headers() }).login({
      username: user.username, password: "incorrect-password",
    })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    expect((await auth.createCaller({ req: new Request("http://localhost"), resHeaders: new Headers() }).login({
      username: user.username, password: "synthetic-password",
    })).id).toBe(user.id);
  });

  afterAll(async () => {
    if (db && user) await db.delete(users).where(eq(users.id, user.id));
    if (db && other) await db.delete(users).where(eq(users.id, other.id));
    if (close) await close();
  });

  it("preserva autenticación, concurrencia, elegibilidad, reconocimiento y PDF", async () => {
    const context = { req: new Request("http://localhost"), resHeaders: new Headers(), user };
    const learner = learning.createCaller(context);
    const progress = training.createCaller(context);
    const outsider = learning.createCaller({ ...context, user: other });
    const [first, second] = await Promise.all([learner.start(), learner.start()]);
    expect(first.id).toBe(second.id);
    expect(first.questions[0]).not.toHaveProperty("correctIndex");
    const saves = await Promise.allSettled([0, 1].map((choice) =>
      learner.save({ id: first.id, revision: first.revision, questionId: first.questions[0].id, choice })));
    expect(saves.filter((result) => result.status === "fulfilled")).toHaveLength(1);
    expect(saves.filter((result) => result.status === "rejected")).toHaveLength(1);
    await expect(outsider.draft({ id: first.id })).rejects.toMatchObject({ code: "NOT_FOUND" });
    let draft = await learner.draft({ id: first.id });
    for (const [index, q] of QUIZ_QUESTIONS.entries()) {
      draft = await learner.save({ id: draft.id, revision: draft.revision, questionId: q.id,
        choice: index < 6 ? q.correctIndex : (q.correctIndex + 1) % q.options.length });
    }
    expect((await learner.submit({ id: draft.id, revision: draft.revision })).score).toBe(6);
    for (let id = 1; id <= 10; id++) await progress.setModuleCompleted({ moduleId: id, completed: true });
    await expect(learner.issue({ name: "María López" })).rejects.toMatchObject({ code: "FORBIDDEN" });
    draft = await learner.start();
    for (const [index, q] of QUIZ_QUESTIONS.entries()) {
      draft = await learner.save({ id: draft.id, revision: draft.revision, questionId: q.id,
        choice: index < 7 ? q.correctIndex : (q.correctIndex + 1) % q.options.length });
    }
    const submissions = await Promise.all([
      learner.submit({ id: draft.id, revision: draft.revision }),
      learner.submit({ id: draft.id, revision: draft.revision }),
    ]);
    expect(submissions.map((result) => result.score)).toEqual([7, 7]);
    expect((await learner.overview()).eligible).toBe(true);
    const issued = await Promise.all([learner.issue({ name: "María López" }), learner.issue({ name: "María López" })]);
    expect(issued[0].folio).toBe(issued[1].folio);
    await expect(learner.issue({ name: "Otro Nombre" })).rejects.toMatchObject({ code: "CONFLICT" });
    await expect(outsider.verify({ folio: issued[0].folio })).rejects.toMatchObject({ code: "FORBIDDEN" });
    const url = `/api/recognitions/${issued[0].folio}/pdf`;
    expect((await app.request(url)).status).toBe(401);
    // El handler de Vercel es un listener de Node: se ejercita igual que en el
    // despliegue, sobre un servidor efímero.
    const server = createServer(handler);
    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
    try {
      const { port } = server.address() as AddressInfo;
      const response = await fetch(`http://127.0.0.1:${port}${url}`, { headers: { cookie } });
      expect(response.status).toBe(200);
      const bytes = await response.arrayBuffer();
      expect(Buffer.from(bytes).subarray(0, 5).toString()).toBe("%PDF-");
      expect((await PDFDocument.load(bytes)).getPageCount()).toBe(1);
    } finally {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
    expect((await learner.attempts({ page: 0 })).items).toHaveLength(2);
  }, 30000);
});
