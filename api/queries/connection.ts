import fs from "node:fs";
import path from "node:path";
import { createRequire as makeRequire } from "node:module";
import { env } from "../lib/env";
import * as schema from "@db/schema";
import * as relations from "@db/relations";

const fullSchema = { ...schema, ...relations };
const nodeRequire = makeRequire(import.meta.url);

// better-sqlite3 es un módulo nativo y en un despliegue con PostgreSQL nunca se
// usa. Cargarlo de forma diferida permite arrancar donde el binario nativo no
// está disponible (por ejemplo una función serverless), siempre que
// DATABASE_URL apunte a PostgreSQL.
function loadSqliteDriver() {
  return {
    Database: nodeRequire("better-sqlite3") as typeof import("better-sqlite3"),
    drizzle: (nodeRequire("drizzle-orm/better-sqlite3") as typeof import("drizzle-orm/better-sqlite3")).drizzle,
  };
}

function withSchema(sqlite: ReturnType<typeof loadSqliteDriver>["Database"]["prototype"]) {
  return loadSqliteDriver().drizzle(sqlite, { schema: fullSchema });
}

export function getDbFilePath(): string {
  const url = env.databaseUrl;
  const file = url.startsWith("file:") ? url.slice("file:".length) : url;
  return path.isAbsolute(file)
    ? file
    : path.resolve(process.cwd(), file);
}

let instance: ReturnType<typeof withSchema> | undefined;

export function getDb() {
  if (!instance) {
    const filePath = getDbFilePath();
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    const sqlite = new (loadSqliteDriver().Database)(filePath);
    sqlite.pragma("journal_mode = WAL");
    sqlite.pragma("foreign_keys = ON");
    // Las tablas se crean solas en el primer arranque: no hace falta
    // correr drizzle-kit migrate a mano para usar la app en local.
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        passwordHash TEXT NOT NULL,
        name TEXT,
        email TEXT,
        avatar TEXT,
        role TEXT NOT NULL DEFAULT 'user',
        createdAt INTEGER NOT NULL,
        updatedAt INTEGER NOT NULL,
        lastSignInAt INTEGER NOT NULL
      );
      CREATE TABLE IF NOT EXISTS module_progress (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        moduleId INTEGER NOT NULL,
        completedAt INTEGER NOT NULL,
        UNIQUE(userId, moduleId)
      );
      CREATE TABLE IF NOT EXISTS quiz_attempts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        score INTEGER NOT NULL,
        total INTEGER NOT NULL,
        answers TEXT NOT NULL,
        createdAt INTEGER NOT NULL
      );
      CREATE UNIQUE INDEX IF NOT EXISTS user_module_idx
        ON module_progress(userId, moduleId);
      CREATE TABLE IF NOT EXISTS course_progress (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        courseVersion TEXT NOT NULL,
        moduleId INTEGER NOT NULL,
        completedAt INTEGER NOT NULL,
        UNIQUE(userId, courseVersion, moduleId)
      );
      CREATE UNIQUE INDEX IF NOT EXISTS course_progress_user_version_module_idx
        ON course_progress(userId, courseVersion, moduleId);
      CREATE TABLE IF NOT EXISTS evaluation_attempts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        courseVersion TEXT NOT NULL,
        status TEXT NOT NULL CHECK(status IN ('draft', 'submitted', 'abandoned')),
        questions TEXT NOT NULL,
        answers TEXT NOT NULL,
        revision INTEGER NOT NULL DEFAULT 0,
        score INTEGER,
        total INTEGER NOT NULL,
        passingPercent INTEGER NOT NULL,
        createdAt INTEGER NOT NULL,
        submittedAt INTEGER
      );
      CREATE UNIQUE INDEX IF NOT EXISTS evaluation_one_draft_idx
        ON evaluation_attempts(userId, courseVersion) WHERE status = 'draft';
      CREATE TABLE IF NOT EXISTS recognitions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        courseVersion TEXT NOT NULL,
        attemptId INTEGER NOT NULL REFERENCES evaluation_attempts(id),
        folio TEXT NOT NULL UNIQUE,
        recipientName TEXT NOT NULL,
        issuer TEXT NOT NULL,
        courseTitle TEXT NOT NULL,
        score INTEGER NOT NULL,
        total INTEGER NOT NULL,
        passingPercent INTEGER NOT NULL,
        issuedAt INTEGER NOT NULL,
        UNIQUE(userId, courseVersion)
      );
      CREATE UNIQUE INDEX IF NOT EXISTS recognitions_user_version_idx
        ON recognitions(userId, courseVersion);
    `);
    instance = withSchema(sqlite);
  }
  return instance;
}
