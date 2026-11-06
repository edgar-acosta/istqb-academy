# Cambios de la versión local (SQLite + login local)

Fecha: 2026-11-06. Contenido intacto: 10 módulos, glosario, evaluación
de 10 preguntas con umbral 7/10, diseño y PWA. Solo cambió la
infraestructura de autenticación y base de datos.

## Lo que se quitó
- Login con Kimi (OAuth): `api/kimi/*`, la ruta `/api/oauth/callback`,
  `VITE_KIMI_AUTH_URL`, `VITE_APP_ID`, `APP_ID`, `APP_SECRET`,
  `KIMI_AUTH_URL`, `KIMI_OPEN_URL`, `OWNER_UNION_ID`.
  Por eso ya no aparece el error `invalid_client`.
- MySQL de la plataforma (`mysql2`, `drizzle-orm/mysql2`, dialecto
  `mysql`, `DATABASE_URL` con URL de MySQL, `onDuplicateKeyUpdate`).
- Metadatos de la plataforma Kimi: `.backend-features.json` y la
  migración MySQL antigua en `db/migrations/`.

## Lo que se puso
- **SQLite local con better-sqlite3 + Drizzle** (`db/schema.ts`,
  `api/queries/connection.ts`). La base es el archivo
  `data/istqb.db`, que se crea solo en el primer arranque
  (`CREATE TABLE IF NOT EXISTS`). No hay que instalar MySQL.
  Tablas: `users`, `module_progress`, `quiz_attempts`.
- **Login local** (`api/auth/*`, `api/auth-router.ts`):
  - Registro en `/login` (pestaña "Crear cuenta") y login con
    usuario + contraseña. La primera cuenta creada es administradora.
  - Contraseñas con hash scrypt (`api/auth/password.ts`, solo Node,
    sin dependencias nativas). Nunca se guardan en claro.
  - Sesión con JWT HS256 firmado con `SESSION_SECRET` (30 días),
    cookie `istqb_sid` httpOnly.
- **Variables de entorno nuevas** (`.env`):
  `SESSION_SECRET` y `DATABASE_URL=file:./data/istqb.db`.
- Logs del servidor ahora en `logs/app.log` en vez de
  `/tmp/kimi-logs/app.log`.
- El script `build` marca `better-sqlite3` como externo en esbuild
  (`--external:better-sqlite3`): es un módulo nativo y si se
  empaquetaba dentro de `dist/boot.js`, `npm run start` fallaba
  con 500 al tocar la base. En desarrollo (`npm run dev`) no
  afectaba, pero en producción sí; ya está probado.

## Archivos tocados
`package.json`, `vite.config.ts`, `drizzle.config.ts`, `db/schema.ts`,
`db/seed.ts`, `api/lib/env.ts`, `api/lib/logger.ts`,
`api/queries/connection.ts`, `api/queries/users.ts`,
`api/auth-router.ts`, `api/training-router.ts`, `api/context.ts`,
`api/boot.ts`, `contracts/constants.ts`, `src/pages/Login.tsx`.
Archivos nuevos: `api/auth/password.ts`, `api/auth/session.ts`,
`api/auth/local.ts`, `.env`, `.env.example`, `CAMBIOS_LOCAL.md`.

## Notas
- El progreso y los intentos de evaluación anteriores, que vivían
  en la base MySQL de Kimi, no migran: en local cada usuario
  empieza con su progreso en cero. El contenido y la clave de la
  evaluación no cambiaron.
- Si borras `data/istqb.db`, se crea una base vacía nueva y tendrás
  que registrarte de nuevo. Haz copia de ese archivo si te importa
  el progreso.
