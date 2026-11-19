import { afterEach, describe, expect, it, vi } from "vitest";
import Database from "better-sqlite3";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

describe("inicialización sobre una base existente", () => {
  const originalDatabaseUrl = process.env.DATABASE_URL;

  afterEach(() => {
    if (originalDatabaseUrl === undefined) delete process.env.DATABASE_URL;
    else process.env.DATABASE_URL = originalDatabaseUrl;
    vi.resetModules();
  });

  it("preserva datos anteriores y crea las tablas de seguimiento", async () => {
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), "istqb-migration-test-"));
    const file = path.join(directory, "test.db");
    const legacy = new Database(file);
    legacy.exec(`
      CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT NOT NULL UNIQUE,
        passwordHash TEXT NOT NULL, name TEXT, email TEXT, avatar TEXT,
        role TEXT NOT NULL DEFAULT 'user', createdAt INTEGER NOT NULL,
        updatedAt INTEGER NOT NULL, lastSignInAt INTEGER NOT NULL
      );
      CREATE TABLE module_progress (
        id INTEGER PRIMARY KEY AUTOINCREMENT, userId INTEGER NOT NULL REFERENCES users(id),
        moduleId INTEGER NOT NULL, completedAt INTEGER NOT NULL, UNIQUE(userId, moduleId)
      );
      CREATE TABLE quiz_attempts (
        id INTEGER PRIMARY KEY AUTOINCREMENT, userId INTEGER NOT NULL REFERENCES users(id),
        score INTEGER NOT NULL, total INTEGER NOT NULL, answers TEXT NOT NULL, createdAt INTEGER NOT NULL
      );
      INSERT INTO users VALUES (1, 'test', 'hash', NULL, NULL, NULL, 'user', 1, 1, 1);
      INSERT INTO module_progress VALUES (1, 1, 2, 1);
      INSERT INTO quiz_attempts VALUES (1, 1, 8, 10, '{"q1":1}', 1);
    `);
    legacy.close();
    process.env.DATABASE_URL = `file:${file}`;
    let client: Database.Database | undefined;
    try {
      const { getDb } = await import("./queries/connection.js");
      client = getDb().$client;
      expect(client.prepare("SELECT moduleId FROM module_progress").all()).toEqual([{ moduleId: 2 }]);
      expect(client.prepare("SELECT score, answers FROM quiz_attempts").get()).toEqual({ score: 8, answers: '{"q1":1}' });
      expect(client.prepare("SELECT COUNT(*) AS count FROM course_progress").get()).toEqual({ count: 0 });
      expect(client.prepare("SELECT COUNT(*) AS count FROM evaluation_attempts").get()).toEqual({ count: 0 });
      expect(client.prepare("SELECT COUNT(*) AS count FROM recognitions").get()).toEqual({ count: 0 });
    } finally {
      client?.close();
      for (const suffix of ["", "-wal", "-shm"]) {
        const target = file + suffix;
        if (fs.existsSync(target)) fs.unlinkSync(target);
      }
      fs.rmdirSync(directory);
    }
  });
});
