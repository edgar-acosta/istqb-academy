import {
  sqliteTable,
  integer,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

// Usuarios locales (login con usuario + contraseña, sin Kimi).
// La contraseña NUNCA se guarda en claro: solo su hash scrypt en passwordHash.
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  passwordHash: text("passwordHash").notNull(),
  name: text("name"),
  email: text("email"),
  avatar: text("avatar"),
  role: text("role", { enum: ["user", "admin"] })
    .default("user")
    .notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date()),
  lastSignInAt: integer("lastSignInAt", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Módulos completados por usuario (progreso de la guía)
export const moduleProgress = sqliteTable(
  "module_progress",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: integer("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    moduleId: integer("moduleId").notNull(), // 1..10
    completedAt: integer("completedAt", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => ({
    userModule: uniqueIndex("user_module_idx").on(table.userId, table.moduleId),
  }),
);

// Intentos de la evaluación final (10 preguntas)
export const quizAttempts = sqliteTable("quiz_attempts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  score: integer("score").notNull(), // aciertos 0..10
  total: integer("total").notNull(), // 10
  answers: text("answers").notNull(), // JSON: { questionId: chosenIndex }
  createdAt: integer("createdAt", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export type ModuleProgress = typeof moduleProgress.$inferSelect;
export type QuizAttempt = typeof quizAttempts.$inferSelect;

export const courseProgress = sqliteTable(
  "course_progress",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: integer("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
    courseVersion: text("courseVersion").notNull(),
    moduleId: integer("moduleId").notNull(),
    completedAt: integer("completedAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  },
  (table) => ({
    userVersionModule: uniqueIndex("course_progress_user_version_module_idx").on(
      table.userId, table.courseVersion, table.moduleId,
    ),
  }),
);

export const evaluationAttempts = sqliteTable("evaluation_attempts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  courseVersion: text("courseVersion").notNull(),
  status: text("status", { enum: ["draft", "submitted", "abandoned"] }).notNull(),
  questions: text("questions").notNull(),
  answers: text("answers").notNull(),
  revision: integer("revision").notNull().default(0),
  score: integer("score"),
  total: integer("total").notNull(),
  passingPercent: integer("passingPercent").notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  submittedAt: integer("submittedAt", { mode: "timestamp" }),
});

export const recognitions = sqliteTable("recognitions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  courseVersion: text("courseVersion").notNull(),
  attemptId: integer("attemptId").notNull().references(() => evaluationAttempts.id),
  folio: text("folio").notNull().unique(),
  recipientName: text("recipientName").notNull(),
  issuer: text("issuer").notNull(),
  courseTitle: text("courseTitle").notNull(),
  score: integer("score").notNull(),
  total: integer("total").notNull(),
  passingPercent: integer("passingPercent").notNull(),
  issuedAt: integer("issuedAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
}, (table) => ({
  userVersion: uniqueIndex("recognitions_user_version_idx").on(table.userId, table.courseVersion),
}));
