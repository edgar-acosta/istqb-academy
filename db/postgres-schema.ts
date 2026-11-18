import { pgSchema, integer, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

const academy = pgSchema("academy");
const id = () => integer("id").primaryKey().generatedByDefaultAsIdentity();
const date = (name: string) => timestamp(name, { withTimezone: true, mode: "date" });

export const users = academy.table("users", {
  id: id(),
  username: text("username").notNull().unique(),
  passwordHash: text("passwordHash").notNull(),
  name: text("name"),
  email: text("email"),
  avatar: text("avatar"),
  role: text("role", { enum: ["user", "admin"] }).default("user").notNull(),
  createdAt: date("createdAt").notNull().$defaultFn(() => new Date()),
  updatedAt: date("updatedAt").notNull().$defaultFn(() => new Date()).$onUpdate(() => new Date()),
  lastSignInAt: date("lastSignInAt").notNull().$defaultFn(() => new Date()),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const moduleProgress = academy.table("module_progress", {
  id: id(),
  userId: integer("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  moduleId: integer("moduleId").notNull(),
  completedAt: date("completedAt").notNull().$defaultFn(() => new Date()),
}, (table) => [uniqueIndex("user_module_idx").on(table.userId, table.moduleId)]);

export const quizAttempts = academy.table("quiz_attempts", {
  id: id(),
  userId: integer("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  score: integer("score").notNull(),
  total: integer("total").notNull(),
  answers: text("answers").notNull(),
  createdAt: date("createdAt").notNull().$defaultFn(() => new Date()),
});

export const courseProgress = academy.table("course_progress", {
  id: id(),
  userId: integer("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  courseVersion: text("courseVersion").notNull(),
  moduleId: integer("moduleId").notNull(),
  completedAt: date("completedAt").notNull().$defaultFn(() => new Date()),
}, (table) => [uniqueIndex("course_progress_user_version_module_idx").on(table.userId, table.courseVersion, table.moduleId)]);

export const evaluationAttempts = academy.table("evaluation_attempts", {
  id: id(),
  userId: integer("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  courseVersion: text("courseVersion").notNull(),
  status: text("status", { enum: ["draft", "submitted", "abandoned"] }).notNull(),
  questions: text("questions").notNull(),
  answers: text("answers").notNull(),
  revision: integer("revision").notNull().default(0),
  score: integer("score"),
  total: integer("total").notNull(),
  passingPercent: integer("passingPercent").notNull(),
  createdAt: date("createdAt").notNull().$defaultFn(() => new Date()),
  submittedAt: date("submittedAt"),
}, (table) => [uniqueIndex("evaluation_one_draft_idx").on(table.userId, table.courseVersion).where(sql`${table.status} = 'draft'`)]);

export const recognitions = academy.table("recognitions", {
  id: id(),
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
  issuedAt: date("issuedAt").notNull().$defaultFn(() => new Date()),
}, (table) => [uniqueIndex("recognitions_user_version_idx").on(table.userId, table.courseVersion)]);
