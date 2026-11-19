import { randomBytes } from "node:crypto";
import { and, desc, eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { COURSE_MODULE_TOTAL, COURSE_TITLE, COURSE_VERSION, PASSING_PERCENT, RECOGNITION_ISSUER } from "../contracts/course.js";
import { LEGACY_QUIZ_QUESTIONS, QUIZ_QUESTIONS, type QuizQuestion } from "../contracts/quiz.js";
import { courseProgress, evaluationAttempts, moduleProgress, quizAttempts, recognitions, users } from "../db/postgres-schema.js";
import { getPostgresDb } from "./queries/postgres.js";
import { adminQuery, authedQuery, createRouter } from "./middleware.js";
import { supportsRecognitionName } from "./lib/recognition-pdf.js";

type Attempt = typeof evaluationAttempts.$inferSelect;
type Db = ReturnType<typeof getPostgresDb>;
type Tx = Parameters<Parameters<Db["transaction"]>[0]>[0];
type Reader = Db | Tx;

function decode(attempt: Attempt) {
  return { questions: JSON.parse(attempt.questions) as QuizQuestion[], answers: JSON.parse(attempt.answers) as Record<string, number> };
}
function draftView(attempt: Attempt) {
  const { questions, answers } = decode(attempt);
  return { id: attempt.id, revision: attempt.revision, courseVersion: attempt.courseVersion,
    questions: questions.map(({ id, module, question, options }) => ({ id, module, question, options })), answers };
}
function detailView(attempt: Attempt) {
  if (attempt.status !== "submitted" || attempt.score === null)
    throw new TRPCError({ code: "BAD_REQUEST", message: "El intento aún no se ha enviado." });
  const { questions, answers } = decode(attempt);
  return { id: attempt.id, courseVersion: attempt.courseVersion, score: attempt.score, total: attempt.total,
    passingPercent: attempt.passingPercent, submittedAt: attempt.submittedAt,
    questions: questions.map((q) => ({ ...q, chosen: answers[q.id], correct: answers[q.id] === q.correctIndex })) };
}
async function findAttempt(db: Reader, id: number, userId: number) {
  const [attempt] = await db.select().from(evaluationAttempts)
    .where(and(eq(evaluationAttempts.id, id), eq(evaluationAttempts.userId, userId))).limit(1);
  if (!attempt) throw new TRPCError({ code: "NOT_FOUND", message: "Intento no encontrado." });
  return attempt;
}
async function eligibility(db: Reader, userId: number) {
  const completedRows = await db.select().from(courseProgress).where(and(
    eq(courseProgress.userId, userId), eq(courseProgress.courseVersion, COURSE_VERSION)));
  const completedModuleIds = completedRows.map((p) => p.moduleId).filter((id) => id >= 1 && id <= COURSE_MODULE_TOTAL);
  const attempts = await db.select().from(evaluationAttempts).where(and(
    eq(evaluationAttempts.userId, userId), eq(evaluationAttempts.courseVersion, COURSE_VERSION),
    eq(evaluationAttempts.status, "submitted"))).orderBy(desc(evaluationAttempts.submittedAt));
  const passed = attempts.find((a) => a.score !== null && a.score * 100 >= a.total * a.passingPercent);
  return { completed: completedModuleIds.length, completedModuleIds, passed };
}
async function lockUser(tx: Tx, userId: number) {
  const [user] = await tx.select({ id: users.id }).from(users).where(eq(users.id, userId)).for("update");
  if (!user) throw new TRPCError({ code: "UNAUTHORIZED", message: "Usuario no encontrado." });
}

export const postgresLearningRouter = createRouter({
  overview: authedQuery.query(async ({ ctx }) => {
    const db = getPostgresDb();
    const { completed, completedModuleIds, passed } = await eligibility(db, ctx.user.id);
    const [draft] = await db.select().from(evaluationAttempts).where(and(
      eq(evaluationAttempts.userId, ctx.user.id), eq(evaluationAttempts.courseVersion, COURSE_VERSION),
      eq(evaluationAttempts.status, "draft"))).limit(1);
    const [recognition] = await db.select().from(recognitions).where(and(
      eq(recognitions.userId, ctx.user.id), eq(recognitions.courseVersion, COURSE_VERSION))).limit(1);
    const historicalProgress = (await db.select().from(moduleProgress).where(eq(moduleProgress.userId, ctx.user.id))).length;
    return { courseVersion: COURSE_VERSION, completed, completedModuleIds, moduleTotal: COURSE_MODULE_TOTAL,
      passed: !!passed, eligible: completed === COURSE_MODULE_TOTAL && !!passed,
      draft: draft ? { id: draft.id, answered: Object.keys(decode(draft).answers).length, total: draft.total } : null,
      recognition: recognition ?? null, historicalProgress };
  }),
  attempts: authedQuery.input(z.object({ page: z.number().int().min(0).max(10000) })).query(async ({ ctx, input }) => {
    const db = getPostgresDb(), pageSize = 20, count = (input.page + 1) * pageSize + 1;
    const currentRows = await db.select().from(evaluationAttempts).where(and(
      eq(evaluationAttempts.userId, ctx.user.id), eq(evaluationAttempts.status, "submitted")))
      .orderBy(desc(evaluationAttempts.submittedAt), desc(evaluationAttempts.id)).limit(count);
    const legacyRows = await db.select().from(quizAttempts).where(eq(quizAttempts.userId, ctx.user.id))
      .orderBy(desc(quizAttempts.createdAt), desc(quizAttempts.id)).limit(count);
    const current = currentRows.map((a) => ({ id: a.id, legacy: false as const, score: a.score, total: a.total, date: a.submittedAt, courseVersion: a.courseVersion }));
    const legacy = legacyRows.map((a) => ({ id: a.id, legacy: true as const, score: a.score, total: a.total, date: a.createdAt, courseVersion: null }));
    const ordered = [...current, ...legacy].sort((a, b) => (b.date?.getTime() ?? 0) - (a.date?.getTime() ?? 0) || Number(a.legacy) - Number(b.legacy) || b.id - a.id);
    return { items: ordered.slice(input.page * pageSize, (input.page + 1) * pageSize), hasMore: ordered.length > (input.page + 1) * pageSize };
  }),
  start: authedQuery.mutation(async ({ ctx }) => getPostgresDb().transaction(async (tx) => {
    await lockUser(tx, ctx.user.id);
    let [attempt] = await tx.select().from(evaluationAttempts).where(and(
      eq(evaluationAttempts.userId, ctx.user.id), eq(evaluationAttempts.courseVersion, COURSE_VERSION),
      eq(evaluationAttempts.status, "draft"))).limit(1);
    if (!attempt) [attempt] = await tx.insert(evaluationAttempts).values({
      userId: ctx.user.id, courseVersion: COURSE_VERSION, status: "draft", questions: JSON.stringify(QUIZ_QUESTIONS),
      answers: "{}", total: QUIZ_QUESTIONS.length, passingPercent: PASSING_PERCENT }).returning();
    return draftView(attempt);
  })),
  draft: authedQuery.input(z.object({ id: z.number().int().positive() })).query(async ({ ctx, input }) => {
    const attempt = await findAttempt(getPostgresDb(), input.id, ctx.user.id);
    if (attempt.status !== "draft") throw new TRPCError({ code: "BAD_REQUEST", message: "El intento ya no está en curso." });
    return draftView(attempt);
  }),
  save: authedQuery.input(z.object({ id: z.number().int().positive(), revision: z.number().int().nonnegative(),
    questionId: z.string(), choice: z.number().int().nonnegative() })).mutation(async ({ ctx, input }) => getPostgresDb().transaction(async (tx) => {
      const attempt = await findAttempt(tx, input.id, ctx.user.id);
      if (attempt.status !== "draft" || attempt.revision !== input.revision)
        throw new TRPCError({ code: "CONFLICT", message: "El intento cambió en otra sesión. Recarga el estado antes de continuar." });
      const { questions, answers } = decode(attempt);
      const question = questions.find((q) => q.id === input.questionId);
      if (!question || input.choice >= question.options.length)
        throw new TRPCError({ code: "BAD_REQUEST", message: "La respuesta no corresponde a una opción válida." });
      answers[input.questionId] = input.choice;
      const [updated] = await tx.update(evaluationAttempts).set({ answers: JSON.stringify(answers), revision: attempt.revision + 1 })
        .where(and(eq(evaluationAttempts.id, attempt.id), eq(evaluationAttempts.revision, input.revision), eq(evaluationAttempts.status, "draft"))).returning();
      if (!updated) throw new TRPCError({ code: "CONFLICT", message: "El intento cambió en otra sesión." });
      return draftView(updated);
    })),
  abandon: authedQuery.input(z.object({ id: z.number().int().positive(), revision: z.number().int().nonnegative() })).mutation(async ({ ctx, input }) => {
    const [updated] = await getPostgresDb().update(evaluationAttempts).set({ status: "abandoned", revision: input.revision + 1 })
      .where(and(eq(evaluationAttempts.id, input.id), eq(evaluationAttempts.userId, ctx.user.id),
        eq(evaluationAttempts.status, "draft"), eq(evaluationAttempts.revision, input.revision))).returning();
    if (!updated) throw new TRPCError({ code: "CONFLICT", message: "No se pudo abandonar: el intento cambió o no está disponible." });
    return { abandoned: true };
  }),
  submit: authedQuery.input(z.object({ id: z.number().int().positive(), revision: z.number().int().nonnegative() })).mutation(async ({ ctx, input }) => getPostgresDb().transaction(async (tx) => {
    const [attempt] = await tx.select().from(evaluationAttempts).where(and(eq(evaluationAttempts.id, input.id),
      eq(evaluationAttempts.userId, ctx.user.id))).for("update");
    if (!attempt) throw new TRPCError({ code: "NOT_FOUND", message: "Intento no encontrado." });
    if (attempt.status === "submitted") return detailView(attempt);
    if (attempt.status !== "draft" || attempt.revision !== input.revision)
      throw new TRPCError({ code: "CONFLICT", message: "El intento cambió. Recarga antes de enviarlo." });
    const { questions, answers } = decode(attempt);
    if (Object.keys(answers).length !== questions.length || questions.some((q) =>
      !Number.isInteger(answers[q.id]) || answers[q.id] < 0 || answers[q.id] >= q.options.length))
      throw new TRPCError({ code: "BAD_REQUEST", message: "Responde todas las preguntas con opciones válidas." });
    const [updated] = await tx.update(evaluationAttempts).set({ score: questions.filter((q) => answers[q.id] === q.correctIndex).length,
      status: "submitted", submittedAt: new Date(), revision: attempt.revision + 1 }).where(eq(evaluationAttempts.id, attempt.id)).returning();
    return detailView(updated);
  })),
  detail: authedQuery.input(z.object({ id: z.number().int().positive() })).query(async ({ ctx, input }) =>
    detailView(await findAttempt(getPostgresDb(), input.id, ctx.user.id))),
  legacyDetail: authedQuery.input(z.object({ id: z.number().int().positive() })).query(async ({ ctx, input }) => {
    const [row] = await getPostgresDb().select().from(quizAttempts).where(and(eq(quizAttempts.id, input.id), eq(quizAttempts.userId, ctx.user.id))).limit(1);
    if (!row) throw new TRPCError({ code: "NOT_FOUND", message: "Intento no encontrado." });
    const answers = JSON.parse(row.answers) as Record<string, number>, keys = Object.keys(answers);
    const bank = [LEGACY_QUIZ_QUESTIONS, QUIZ_QUESTIONS].find((questions) =>
      keys.length === questions.length && questions.every((q) => Number.isInteger(answers[q.id]) && answers[q.id] >= 0 && answers[q.id] < q.options.length));
    if (!bank || row.total !== bank.length || bank.filter((q) => answers[q.id] === q.correctIndex).length !== row.score) return null;
    return { score: row.score, total: row.total, submittedAt: row.createdAt, questions: bank.map((q) => ({ ...q, chosen: answers[q.id], correct: answers[q.id] === q.correctIndex })) };
  }),
  issue: authedQuery.input(z.object({ name: z.string().trim().min(2).max(100)
    .regex(/^[\p{Script=Latin}\p{M} .'’-]+$/u, "Usa letras latinas y signos de nombre habituales, sin saltos de línea.")
    .refine((value) => /\p{Script=Latin}/u.test(value), "El nombre debe contener al menos una letra.") })).mutation(async ({ ctx, input }) => {
      const name = input.name.normalize("NFC");
      if (!supportsRecognitionName(name)) throw new TRPCError({ code: "BAD_REQUEST", message: "El nombre contiene caracteres no admitidos por la fuente del PDF." });
      return getPostgresDb().transaction(async (tx) => {
        await lockUser(tx, ctx.user.id);
        const [existing] = await tx.select().from(recognitions).where(and(
          eq(recognitions.userId, ctx.user.id), eq(recognitions.courseVersion, COURSE_VERSION))).limit(1);
        if (existing) {
          if (existing.recipientName !== name) throw new TRPCError({ code: "CONFLICT", message: "Ya existe un reconocimiento con otro nombre; la corrección estará disponible en una fase posterior." });
          return existing;
        }
        const { completed, passed } = await eligibility(tx, ctx.user.id);
        if (completed !== COURSE_MODULE_TOTAL || !passed || passed.score === null)
          throw new TRPCError({ code: "FORBIDDEN", message: "Aún no cumples los requisitos del reconocimiento." });
        const [recognition] = await tx.insert(recognitions).values({ userId: ctx.user.id, courseVersion: COURSE_VERSION,
          attemptId: passed.id, folio: randomBytes(20).toString("hex"), recipientName: name, issuer: RECOGNITION_ISSUER,
          courseTitle: COURSE_TITLE, score: passed.score, total: passed.total, passingPercent: passed.passingPercent }).returning();
        return recognition;
      });
    }),
  verify: adminQuery.input(z.object({ folio: z.string().length(40) })).query(async ({ input }) => {
    const [recognition] = await getPostgresDb().select().from(recognitions).where(eq(recognitions.folio, input.folio)).limit(1);
    if (!recognition) return null;
    return { folio: recognition.folio, recipientName: recognition.recipientName, issuer: recognition.issuer,
      courseTitle: recognition.courseTitle, courseVersion: recognition.courseVersion, issuedAt: recognition.issuedAt, status: "emitido" as const };
  }),
});
