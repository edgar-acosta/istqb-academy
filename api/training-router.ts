import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { and, eq, desc } from "drizzle-orm";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { courseProgress, quizAttempts } from "../db/schema";
import { COURSE_VERSION } from "@contracts/course";
import { QUIZ_QUESTIONS, QUIZ_TOTAL } from "@contracts/quiz";

export const trainingRouter = createRouter({
  // Progreso de módulos del usuario autenticado
  progress: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const rows = await db
      .select()
      .from(courseProgress)
      .where(and(eq(courseProgress.userId, ctx.user.id), eq(courseProgress.courseVersion, COURSE_VERSION)));
    return rows.map((r) => ({ moduleId: r.moduleId, completedAt: r.completedAt }));
  }),

  setModuleCompleted: authedQuery
    .input(z.object({ moduleId: z.number().int().min(1).max(10), completed: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      if (input.completed) {
        await db
          .insert(courseProgress)
          .values({ userId: ctx.user.id, courseVersion: COURSE_VERSION, moduleId: input.moduleId })
          .onConflictDoUpdate({
            target: [courseProgress.userId, courseProgress.courseVersion, courseProgress.moduleId],
            set: { completedAt: new Date() },
          });
        return { completed: true };
      }
      await db
        .delete(courseProgress)
        .where(
          and(
            eq(courseProgress.userId, ctx.user.id),
            eq(courseProgress.courseVersion, COURSE_VERSION),
            eq(courseProgress.moduleId, input.moduleId),
          ),
        );
      return { completed: false };
    }),

  // Evaluación final
  myAttempts: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const rows = await db
      .select()
      .from(quizAttempts)
      .where(eq(quizAttempts.userId, ctx.user.id))
      .orderBy(desc(quizAttempts.createdAt))
      .limit(20);
    return rows.map((r) => ({
      id: Number(r.id),
      score: r.score,
      total: r.total,
      answers: JSON.parse(r.answers) as Record<string, number>,
      createdAt: r.createdAt,
    }));
  }),

  submitQuiz: authedQuery
    .input(
      z.object({
        answers: z.record(z.string(), z.number().int().min(0)),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const answers = input.answers;
      // Validar que responde exactamente las 10 preguntas
      const questionIds = QUIZ_QUESTIONS.map((q) => q.id);
      const providedIds = Object.keys(answers);
      if (
        providedIds.length !== QUIZ_QUESTIONS.length ||
        !questionIds.every((id) => id in answers)
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Debe responder las 10 preguntas antes de enviar.",
        });
      }

      // Calificación en el servidor contra la clave oficial
      let score = 0;
      const detail = QUIZ_QUESTIONS.map((q) => {
        const chosen = answers[q.id];
        const correct = chosen === q.correctIndex;
        if (correct) score += 1;
        return { questionId: q.id, chosen, correct };
      });

      const db = getDb();
      await db.insert(quizAttempts).values({
        userId: ctx.user.id,
        score,
        total: QUIZ_TOTAL,
        answers: JSON.stringify(answers),
      });

      return { score, total: QUIZ_TOTAL, detail };
    }),
});
