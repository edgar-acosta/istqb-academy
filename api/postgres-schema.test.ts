import { describe, expect, it } from "vitest";
import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { Client } from "pg";
import { createPostgresDatabase, postgresPoolConfig } from "./queries/postgres.js";
import { users, courseProgress, evaluationAttempts, recognitions } from "../db/postgres-schema.js";
import { createPostgresUserQueries } from "./queries/postgres-users.js";
import { hashPassword, verifyPassword } from "./auth/password.js";

const testUrl = process.env.TEST_POSTGRES_URL;

describe("opciones de conexión PostgreSQL", () => {
  it("rechaza un host no local sin TLS verificado ni disable explícito", () => {
    expect(() => postgresPoolConfig("postgresql://u:p@db.example.com:5432/istqb"))
      .toThrow(/sslmode=verify-full/);
    expect(() => postgresPoolConfig("postgresql://u:p@db.example.com:5432/istqb?sslmode=require"))
      .toThrow(/sslmode=verify-full/);
  });

  it("acepta sslmode=disable explícito en una red privada de contenedores", () => {
    const config = postgresPoolConfig("postgresql://u:p@db:5432/istqb?sslmode=disable");
    expect(config.ssl).toBeUndefined();
    expect(config.connectionString).toContain("sslmode=disable");
  });

  it("acepta loopback sin sslmode", async () => {
    const { close } = createPostgresDatabase("postgresql://u:p@127.0.0.1:5432/istqb");
    await close();
  });

  it("fija la CA de Supabase porque su TLS no está en el almacén de Node", () => {
    const config = postgresPoolConfig(
      "postgresql://postgres.abc:p@aws-0-us-west-2.pooler.supabase.com:6543/postgres?sslmode=verify-full",
    );
    expect(config.ssl).toMatchObject({ rejectUnauthorized: true });
    expect((config.ssl as { ca: string }).ca).toContain("BEGIN CERTIFICATE");
    // El sslmode se elimina: si quedara, pg lo fusionaría y descartaría la CA.
    expect(config.connectionString).not.toContain("sslmode");
    const client = new Client(config);
    // connectionParameters no está en los tipos públicos de pg, pero es donde
    // se comprueba que la CA sobrevive a la fusión de la cadena de conexión.
    const effective = (client as unknown as { connectionParameters: { ssl?: { ca?: string } } })
      .connectionParameters;
    expect(effective.ssl?.ca).toContain("BEGIN CERTIFICATE");
  });

  it("no toca la cadena de un proveedor ajeno", () => {
    const url = "postgresql://u:p@db.example.com:5432/istqb?sslmode=verify-full";
    expect(postgresPoolConfig(url)).toEqual({ connectionString: url });
  });
});

describe.skipIf(!testUrl)("esquema PostgreSQL aislado", () => {
  it("persiste relaciones y revierte toda la transacción", async () => {
    if (!testUrl) throw new Error("Falta TEST_POSTGRES_URL.");
    const { db, close } = createPostgresDatabase(testUrl);
    const username = `test-${randomUUID()}`;
    const rollback = new Error("rollback intencional");
    try {
      await expect(db.transaction(async (tx) => {
        const [user] = await tx.insert(users).values({ username, passwordHash: "synthetic-hash", role: "admin" }).returning();
        await tx.insert(courseProgress).values({ userId: user.id, courseVersion: "2.0", moduleId: 1 });
        const [attempt] = await tx.insert(evaluationAttempts).values({
          userId: user.id, courseVersion: "2.0", status: "submitted", questions: "[]",
          answers: "{}", total: 10, score: 7, passingPercent: 70, submittedAt: new Date(),
        }).returning();
        const [recognition] = await tx.insert(recognitions).values({
          userId: user.id, attemptId: attempt.id, courseVersion: "2.0", folio: randomUUID(),
          recipientName: "Prueba", issuer: "Prueba", courseTitle: "Prueba", score: 7, total: 10, passingPercent: 70,
        }).returning();
        expect(recognition.attemptId).toBe(attempt.id);
        expect(user.createdAt).toBeInstanceOf(Date);
        expect(user.role).toBe("admin");
        throw rollback;
      })).rejects.toBe(rollback);
      expect(await db.select().from(users).where(eq(users.username, username))).toEqual([]);
    } finally {
      await close();
    }
  });

  it("consulta usuarios migrados sin alterar sus roles ni contraseñas", async () => {
    if (!testUrl) throw new Error("Falta TEST_POSTGRES_URL.");
    const { db, close } = createPostgresDatabase(testUrl);
    const repository = createPostgresUserQueries(db);
    const username = `test-${randomUUID()}`;
    let userId: number | undefined;
    try {
      const user = await repository.createUser({
        username, passwordHash: hashPassword("synthetic-test-password"), role: "admin",
      });
      userId = user.id;
      const found = await repository.findByUsername(username.toUpperCase());
      expect(found?.id).toBe(user.id);
      expect(found?.role).toBe("admin");
      expect(found && verifyPassword("synthetic-test-password", found.passwordHash)).toBe(true);
      expect(found && verifyPassword("incorrect-test-password", found.passwordHash)).toBe(false);
      expect((await repository.findById(user.id))?.id).toBe(user.id);
      await repository.updateLastSignIn(user.id);
      expect((await repository.findById(user.id))?.lastSignInAt).toBeInstanceOf(Date);
      expect(await repository.findByUsername(`missing-${username}`)).toBeUndefined();
    } finally {
      if (userId !== undefined) await db.delete(users).where(eq(users.id, userId));
      await close();
    }
  });
});
