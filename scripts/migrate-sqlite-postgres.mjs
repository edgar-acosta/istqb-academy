import { existsSync } from "node:fs";
import { resolve } from "node:path";
import Database from "better-sqlite3";
import pg from "pg";

const tables = [
  { name: "users", fields: ["id", "username", "passwordHash", "name", "email", "avatar", "role", "createdAt", "updatedAt", "lastSignInAt"], dates: ["createdAt", "updatedAt", "lastSignInAt"] },
  { name: "module_progress", fields: ["id", "userId", "moduleId", "completedAt"], dates: ["completedAt"] },
  { name: "quiz_attempts", fields: ["id", "userId", "score", "total", "answers", "createdAt"], dates: ["createdAt"] },
  { name: "course_progress", fields: ["id", "userId", "courseVersion", "moduleId", "completedAt"], dates: ["completedAt"] },
  { name: "evaluation_attempts", fields: ["id", "userId", "courseVersion", "status", "questions", "answers", "revision", "score", "total", "passingPercent", "createdAt", "submittedAt"], dates: ["createdAt", "submittedAt"] },
  { name: "recognitions", fields: ["id", "userId", "courseVersion", "attemptId", "folio", "recipientName", "issuer", "courseTitle", "score", "total", "passingPercent", "issuedAt"], dates: ["issuedAt"] },
];

function fail(message) {
  throw new Error(message);
}

async function main() {
  const [command, ...args] = process.argv.slice(2);
  if (command === "backup" && args.length === 2) {
    const [source, target] = args.map((arg) => resolve(arg));
    if (!existsSync(source)) fail("No existe la base SQLite de origen.");
    if (existsSync(target)) fail("El destino del respaldo ya existe.");
    const db = new Database(source, { readonly: true, fileMustExist: true });
    try {
      await db.backup(target);
      console.log("Respaldo SQLite creado. Consérvalo en una ubicación protegida.");
    } finally {
      db.close();
    }
    return;
  }
  if (command !== "import" || args.length !== 1 || !process.env.MIGRATION_DATABASE_URL) {
    fail("Uso: node scripts/migrate-sqlite-postgres.mjs backup <origen> <respaldo> | import <respaldo>; import requiere MIGRATION_DATABASE_URL.");
  }

  const source = resolve(args[0]);
  if (!existsSync(source)) fail("No existe el respaldo SQLite de origen.");
  const sqlite = new Database(source, { readonly: true, fileMustExist: true });
  const client = new pg.Client({ connectionString: process.env.MIGRATION_DATABASE_URL });
  let connected = false;
  try {
    sqlite.pragma("query_only = ON");
    sqlite.exec("BEGIN");
    if (sqlite.pragma("integrity_check", { simple: true }) !== "ok") fail("La integridad SQLite no es correcta.");
    if (sqlite.pragma("foreign_key_check").length > 0) fail("El respaldo contiene referencias SQLite inválidas.");
    await client.connect();
    connected = true;
    await client.query("BEGIN");
    await client.query(`LOCK TABLE ${tables.map((table) => `academy."${table.name}"`).join(", ")} IN ACCESS EXCLUSIVE MODE`);
    for (const table of tables) {
      const { rows } = await client.query(`SELECT count(*)::integer AS count FROM academy."${table.name}"`);
      if (rows[0].count !== 0) fail(`El destino no está vacío: ${table.name}.`);
    }
    for (const table of tables) {
      const columns = table.fields.map((field) => `"${field}"`).join(", ");
      const placeholders = table.fields.map((_, index) => `$${index + 1}`).join(", ");
      const insert = `INSERT INTO academy."${table.name}" (${columns}) VALUES (${placeholders})`;
      let count = 0;
      for (const row of sqlite.prepare(`SELECT ${columns} FROM "${table.name}" ORDER BY id`).iterate()) {
        const values = table.fields.map((field) => {
          const value = row[field];
          if (!table.dates.includes(field) || value === null) return value;
          if (!Number.isSafeInteger(value)) fail(`Fecha SQLite inválida en ${table.name}.${field}.`);
          const date = new Date(value * 1000);
          if (Number.isNaN(date.getTime())) fail(`Fecha fuera de rango en ${table.name}.${field}.`);
          return date;
        });
        await client.query(insert, values);
        count++;
      }
      const result = await client.query(`SELECT count(*)::integer AS count, COALESCE(max(id), 0)::integer AS max FROM academy."${table.name}"`);
      if (result.rows[0].count !== count) fail(`El conteo no coincide: ${table.name}.`);
      const next = result.rows[0].max + 1;
      await client.query(`ALTER SEQUENCE academy."${table.name}_id_seq" RESTART WITH ${next}`);
      console.log(`${table.name}: ${count} registros verificados.`);
    }
    await client.query("COMMIT");
    console.log("Importación confirmada. Valida inicio de sesión, integridad y permisos antes del cambio de servicio.");
  } catch (error) {
    if (connected) await client.query("ROLLBACK");
    throw error;
  } finally {
    if (sqlite.inTransaction) sqlite.exec("ROLLBACK");
    sqlite.close();
    if (connected) await client.end();
  }
}

main().catch((error) => {
  const safeErrors = [
    "No existe", "El destino", "Uso:", "La integridad", "El respaldo",
    "Fecha SQLite", "Fecha fuera", "El conteo",
  ];
  console.error(safeErrors.some((prefix) => error.message?.startsWith(prefix))
    ? error.message
    : `La operación falló; no se confirmaron los cambios (código: ${error.code ?? "desconocido"}).`);
  process.exitCode = 1;
});
