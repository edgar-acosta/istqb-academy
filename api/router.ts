import { authRouter } from "./auth-router.js";
import { trainingRouter } from "./training-router.js";
import { learningRouter } from "./learning-router.js";
import { postgresLearningRouter } from "./postgres-learning-router.js";
import { usePostgres } from "./queries/postgres.js";
import { createRouter, publicQuery } from "./middleware.js";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  training: trainingRouter,
  learning: usePostgres ? postgresLearningRouter : learningRouter,

  // TODO: add feature routers here, e.g.
  // todo: createRouter({
  //   list: publicQuery.query(() => findTodos()),
  // }),
});

export type AppRouter = typeof appRouter;
