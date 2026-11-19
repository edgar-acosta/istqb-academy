import { drizzle } from "drizzle-orm/node-postgres";
import { Pool, type PoolConfig } from "pg";
import * as schema from "../../db/postgres-schema.js";
import { env } from "../lib/env.js";
import { trustedCaFor } from "../lib/database-ca.js";

export function postgresPoolConfig(connectionString: string): PoolConfig {
  const parsed = new URL(connectionString);
  if (parsed.protocol !== "postgres:" && parsed.protocol !== "postgresql:") {
    throw new Error("Se requiere una cadena de conexión PostgreSQL.");
  }
  const loopback = ["localhost", "127.0.0.1", "[::1]"].includes(parsed.hostname);
  const sslmode = parsed.searchParams.get("sslmode");
  // Un host no local solo se acepta con TLS verificado, o con sslmode=disable
  // declarado explícitamente por el operador para una red privada (por ejemplo
  // la red interna de docker compose, donde el tráfico no sale del host).
  if (!loopback && sslmode !== "verify-full" && sslmode !== "disable") {
    throw new Error(
      "Las conexiones PostgreSQL remotas requieren sslmode=verify-full " +
      "(o sslmode=disable explícito en una red privada).",
    );
  }

  const ca = sslmode === "disable" ? undefined : trustedCaFor(parsed.hostname);
  if (!ca) return { connectionString };

  // pg fusiona la cadena sobre las opciones que recibe, y el sslmode del texto
  // reemplaza cualquier `ssl` propio (con verify-full lo deja en {}). Por eso se
  // quita el parámetro cuando la CA se pasa explícitamente: el cifrado y la
  // verificación quedan garantizados por ssl.rejectUnauthorized.
  parsed.searchParams.delete("sslmode");
  return {
    connectionString: parsed.toString(),
    ssl: { ca, rejectUnauthorized: true },
  };
}

export function createPostgresDatabase(connectionString: string) {
  const pool = new Pool({
    ...postgresPoolConfig(connectionString),
    max: 2,
    connectionTimeoutMillis: 10000,
    idleTimeoutMillis: 10000,
  });
  return { db: drizzle(pool, { schema }), close: () => pool.end() };
}

export const usePostgres = /^postgres(?:ql)?:\/\//i.test(env.databaseUrl);
let instance: ReturnType<typeof createPostgresDatabase> | undefined;

export function getPostgresDb() {
  if (!usePostgres) throw new Error("PostgreSQL no está configurado.");
  instance ??= createPostgresDatabase(env.databaseUrl);
  return instance.db;
}

export async function closePostgresDb() {
  if (instance) {
    await instance.close();
    instance = undefined;
  }
}
