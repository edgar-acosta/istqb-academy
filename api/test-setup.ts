import os from "node:os";
import path from "node:path";

// La suite no debe tocar la base configurada en .env: si DATABASE_URL apunta a
// un PostgreSQL real (por ejemplo Supabase), correr los tests escribiría en
// datos de producción. Con cualquier valor que no sea un archivo local se fuerza
// un SQLite temporal y aislado por proceso.
const configured = process.env.DATABASE_URL ?? "";

if (!configured.startsWith("file:")) {
  const directory = path.join(os.tmpdir(), "istqb-tests");
  process.env.DATABASE_URL = `file:${path.join(directory, `vitest-${process.pid}.db`)}`;
}
