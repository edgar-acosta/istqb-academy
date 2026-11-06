import "dotenv/config";

// Configuración local: ya no hay Kimi OAuth ni MySQL de plataforma.
// - SESSION_SECRET: firma los JWT de sesión (HS256). Cámbialo en .env si
//   quieres invalidar todas las sesiones.
// - DATABASE_URL: ruta del archivo SQLite, p. ej. file:./data/istqb.db
//   (relativa a la carpeta del proyecto).

function required(name: string): string {
  const value = process.env[name];
  if (!value && process.env.NODE_ENV === "production") {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value ?? "";
}

const sessionSecret = process.env.SESSION_SECRET ?? "";
if (!sessionSecret && process.env.NODE_ENV !== "production") {
  console.warn(
    "[env] SESSION_SECRET no está definido; se usa un secreto solo para desarrollo. Defínelo en .env para sesiones persistentes.",
  );
}

export const env = {
  sessionSecret: sessionSecret || "dev-only-secret-change-me-in-env",
  isProduction: process.env.NODE_ENV === "production",
  databaseUrl: required("DATABASE_URL") || "file:./data/istqb.db",
};
