# ISTQB Academy — Guía ISTQB y Shift-Left Testing (versión local)

Portal fullstack de capacitación corporativa en español: 10 módulos,
glosario con buscador, evaluación de 10 preguntas (umbral 7/10) y
progreso guardado por usuario.

Versión local: login con usuario + contraseña y base SQLite.
No usa Kimi ni MySQL. Detalle de los cambios en `CAMBIOS_LOCAL.md`.

Los ejemplos y la evaluación usan un caso ficticio de telemetría de
tractocamiones para múltiples flotas. Sus datos, umbrales y reglas son
didácticos y deben validarse antes de aplicarlos a una plataforma real.
La evaluación sigue siendo fija: diez preguntas, una por módulo, con
umbral sugerido de 7/10. Las actividades son de reflexión y no guardan
respuestas.

La adaptación conserva los identificadores de módulo y el progreso previo.
Los nuevos intentos utilizan identificadores de pregunta `v2-m1` a
`v2-m10`; las preguntas originales `q1` a `q10` se conservan para
interpretar respuestas históricas. Las puntuaciones anteriores no se
recalculan. El detalle histórico se muestra solo si sus respuestas coinciden
exactamente con una versión conservada; de lo contrario se indica que no
está disponible.

## Mi aprendizaje y reconocimiento

Inicia sesión y entra a **Mi aprendizaje** desde el menú. Puedes consultar
el avance de la versión 2.0, reanudar la evaluación con respuestas guardadas
y revisar el historial. El progreso anterior, sin versión verificable, se
conserva por separado: debes volver a marcar los módulos de la versión
vigente para el reconocimiento. Las marcas son una declaración del usuario.

La evaluación tiene intentos ilimitados y sin límite de tiempo. Al finalizar,
un modal muestra el resultado y, si no apruebas, los módulos sugeridos para
repasar. Puedes cerrar el modal y consultar cada respuesta y explicación en
el historial. Para emitir el reconocimiento
interno debes marcar los diez módulos de la versión vigente y aprobar un
intento de esa misma versión con al menos 70 %. Confirma el nombre antes de
emitirlo: por ahora no existe corrección o revocación en la interfaz.
El nombre debe utilizar caracteres latinos admitidos por la fuente del PDF.
Si aún faltan módulos, puedes completarlos y obtener el reconocimiento desde
Mi aprendizaje sin repetir el intento aprobado. Si ya cumples los requisitos,
puedes confirmar tu nombre y descargarlo directamente al finalizar.

El documento lo emite ISTQB and Shiftleft Academy y **no es una certificación
ni aval oficial ISTQB**. Puedes descargarlo desde Mi aprendizaje. Un
administrador autenticado puede consultar el folio internamente; la
verificación pública, la revocación y sustitución quedan para una fase
posterior. El PDF se genera con Noto Sans, distribuida bajo SIL OFL 1.1 por
el paquete `@fontsource/noto-sans`.

La aplicación crea las tablas adicionales automáticamente. Antes de
actualizar o respaldar una instalación existente, utiliza una copia
consistente de SQLite que incluya las transacciones en WAL, por ejemplo
mediante la función de backup de SQLite; no basta con copiar solo
`istqb.db` mientras el servidor está activo.

## Requisitos

- Node.js 20.19+ o 22.12+ (recomendado: Node 22 LTS o superior)
- npm

## Arranque en Windows

En PowerShell, dentro de esta carpeta `app`:

```powershell
npm install
npm run dev
```

Abre http://localhost:3000/

1. Ve a **Iniciar sesión** y pulsa **¿No tienes cuenta? Crea una**.
2. Crea tu usuario (mínimo 3 caracteres) y contraseña (mínimo 8).
   La primera cuenta creada es administradora.
3. Entra y usa la guía. Tu progreso y tus intentos de evaluación se
   guardan en `data/istqb.db` en esta misma carpeta.

Para parar el servidor: `Ctrl + C` en la terminal.

## Producción local

```powershell
npm run build
npm run start
```

También abre en http://localhost:3000/ (o el puerto de `PORT`).

## Datos y archivos importantes

- `.env` — `SESSION_SECRET` (firma las sesiones) y
  `DATABASE_URL=file:./data/istqb.db`. No lo compartas.
- `data/istqb.db` — la base SQLite con usuarios, progreso e intentos.
  Haz copia de este archivo si te importa el progreso; si lo borras,
  la app crea una base vacía y hay que registrarse de nuevo.
- `logs/app.log` — log del servidor.
- `CAMBIOS_LOCAL.md` — qué cambió respecto a la versión de Kimi.

## Comandos útiles

```powershell
npm run check    # revisión de tipos (tsc)
npm run lint     # ESLint
npm run test     # Vitest
npm run db:push  # sincronizar el esquema con la base (opcional,
                 # las tablas ya se crean solas en el primer arranque)
```

## Publicar el portal para otros usuarios

El login guarda la sesión en una cookie; el código la marca `Secure` cuando la
petición llega por HTTPS y usa `SameSite=Lax` sobre HTTP plano. Por eso el portal
funciona publicado por HTTPS (recomendado) o, si no hay TLS, solo por HTTP en
`localhost`.

### Opción recomendada: Vercel + PostgreSQL gestionado (sin servidor propio)

No requiere IP pública, ni dominio, ni una máquina encendida. Vercel da una URL
fija `https://<proyecto>.vercel.app` con certificado, y la base de datos vive en
un PostgreSQL gestionado (Neon o Supabase, ambos con plan gratuito).

1. **Crear la base de datos.** En Neon o Supabase, crea un proyecto y copia la
   cadena de conexión (*connection string*).

2. **Ajustar el `sslmode`.** Las cadenas de Neon y Supabase traen
   `sslmode=require` por defecto, y la app solo acepta TLS verificado para hosts
   remotos. Cambia ese parámetro a `verify-full`:

   ```
   postgresql://usuario:clave@ep-xxx-pooler.region.aws.neon.tech/neondb?sslmode=verify-full
   ```

   Con Neon conviene la cadena *pooled* (`-pooler`): las funciones serverless
   abren muchas conexiones cortas.

3. **Crear el esquema.** Ejecuta `db/supabase/001_schema.sql` en el editor SQL
   del proveedor. Crea el esquema `academy` con las seis tablas.

4. **Desplegar en Vercel.** Importa el repositorio, y si el proyecto está en una
   subcarpeta, define *Root Directory* = `app`. Configura las variables de
   entorno de producción:

   | Variable | Valor |
   |---|---|
   | `DATABASE_URL` | la cadena del paso 2 |
   | `SESSION_SECRET` | 32 bytes aleatorios en hex |

   Genera el secreto con:

   ```powershell
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

5. **Primera cuenta y administradores.** Con PostgreSQL el registro **no**
   promueve automáticamente a la primera cuenta (esa comodidad solo existe en la
   versión local con SQLite). Regístrate y luego eleva tu usuario:

   ```sql
   UPDATE academy.users SET role='admin' WHERE username='tu-usuario';
   ```

   La app crea las tablas por sí sola en SQLite, pero en PostgreSQL el esquema se
   aplica solo con el paso 3.

Dos detalles que fallan si se pasan por alto:

- **La región del host debe coincidir con la del proyecto.** En Supabase, el
  host del pooler incluye la región (`aws-0-us-west-2.pooler.supabase.com`) y
  Supavisor solo conoce los tenants de esa región. Si la región no coincide, la
  conexión falla con `tenant/user ... not found` aunque el usuario y la
  contraseña sean correctos. Copia la cadena desde el panel en vez de escribir
  el host a mano.
- **Supabase firma con su propia CA.** Sus endpoints no usan una CA pública, así
  que `sslmode=verify-full` falla con `SELF_SIGNED_CERT_IN_CHAIN` si el cliente
  solo confía en el almacén del sistema. La app fija esa CA automáticamente para
  hosts `*.supabase.co` y `*.pooler.supabase.com` (ver `api/lib/database-ca.ts`),
  sin desactivar la verificación. Para otro proveedor con CA privada, define
  `DATABASE_CA_CERT` con el PEM completo.

Puntos a tener en cuenta:

- `vercel.json` enruta `/api/*` al servidor Hono de `server/vercel.ts`.
- La app arranca sin `better-sqlite3` instalado (se carga de forma diferida), así
  que una función serverless no depende de ese módulo nativo.
- Los logs se escriben en stdout porque el sistema de archivos de Vercel es de
  solo lectura; el archivo `logs/app.log` solo existe en local y en Docker.
- `npm run test` fuerza un SQLite temporal si `DATABASE_URL` no es un archivo
  local, para que la suite nunca escriba en una base real.

### Despliegue automático desde GitLab autoalojado

Vercel no conecta de forma nativa con GitLab Self-Managed: hay que desplegar
desde un pipeline de GitLab con la CLI de Vercel. Los archivos están en
`deploy/runner`:

- `.gitlab-ci.yml` (raíz del repo) — job `deploy_production` que ejecuta
  `vercel deploy --prod` al hacer push a `main`.
- `deploy/runner/config.toml.example` — configuración del runner (executor
  Docker, imagen `node:22`).
- `deploy/runner/start-runner.ps1` — crea el contenedor del runner con el token.
- `deploy/runner/set-gitlab-variables.ps1` — carga `VERCEL_TOKEN`,
  `VERCEL_ORG_ID` y `VERCEL_PROJECT_ID` en GitLab vía API.

Pasos:

```powershell
# 1. Crear el runner en GitLab (Settings > CI/CD > Runners > Create project runner)
#    Marcas: vacías, "Run untagged jobs" activado, sin "Protected".
#    Copiar el token glrt-... que se muestra una sola vez.

# 2. Levantar el runner en esta máquina
cd deploy\runner
.\start-runner.ps1 -Token "glrt-..."

# 3. Cargar las variables del pipeline
.\set-gitlab-variables.ps1 -GitLabToken "glpat-..." -VercelToken "..."

# 4. Publicar el pipeline
git add .gitlab-ci.yml vercel.json
git commit -m "ci: desplegar a Vercel desde GitLab"
git push origin main
```

El runner necesita acceso saliente a `gitlab.tecnomotum.com`,
`registry.npmjs.org` y `api.vercel.com`. Monta el socket de Docker para crear
los contenedores de cada job, lo que equivale a acceso root en el host: úsalo
solo en una máquina de confianza.

### Opción alternativa: Docker (máquina propia o VPS)

Útil si ya tienes un equipo encendido, o para levantar el entorno completo en tu
máquina. La app y la base de datos corren en contenedores y el acceso pasa por
Caddy, que obtiene el certificado TLS automáticamente si hay dominio.

Archivos:

- `Dockerfile` — imagen de la app (build de Vite + bundle de la API).
- `deploy/docker-compose.yml` — servicios `db` (PostgreSQL 17), `app` y `caddy`,
  más los perfiles `quick` y `tunnel` para publicar sin IP ni dominio.
- `deploy/Caddyfile` — proxy inverso con HTTPS y cabeceras de seguridad.
- `deploy/.env.example` — plantilla de secretos y dirección de publicación.
- `deploy/istqb.ps1` (Windows) y `deploy/Makefile` (Linux/macOS) — automatizan
  las tareas de operación.

### Primer arranque

```powershell
cd deploy
.\istqb.ps1 init     # crea .env con SESSION_SECRET y POSTGRES_PASSWORD aleatorios
.\istqb.ps1 up       # construye y arranca
```

Sin dominio, `SITE_ADDRESS=http://:80` publica el portal por HTTP. Con un
dominio que resuelva a la máquina, cambia esa variable a `academy.tudominio.com`
y Caddy obtendrá el certificado TLS.

Si el portal corre en tu equipo y quieres compartirlo sin IP pública ni dominio:

```powershell
.\istqb.ps1 tunnel   # URL https://<aleatorio>.trycloudflare.com
```

Esa URL es temporal y cambia al reiniciar el contenedor; requiere que el equipo
quede encendido. Para una URL fija con túnel, usa el perfil `tunnel` y define
`CLOUDFLARE_TUNNEL_TOKEN` con una cuenta gratuita de Cloudflare.

Comandos disponibles: `.\istqb.ps1 help`.

### Administradores

Con PostgreSQL, el registro **no** promueve automáticamente a la primera cuenta
(esa comodidad solo existe en SQLite local). Para poder verificar folios, eleva
tu usuario:

```powershell
.\istqb.ps1 admin tu-usuario
```

### Operación

```powershell
.\istqb.ps1 status     # estado y healthchecks
.\istqb.ps1 logs       # logs de la aplicación
.\istqb.ps1 backup     # respaldo en deploy\backups\istqb-<fecha>.sql.gz
.\istqb.ps1 restore deploy\backups\archivo.sql.gz
.\istqb.ps1 update     # reconstruir imagen y actualizar
.\istqb.ps1 down       # detener (los datos quedan en los volúmenes)
```

En Linux o macOS los equivalentes son `make init`, `make up`, `make tunnel`,
`make backup`, etc.

### Conservar el progreso de la versión local en SQLite

El esquema de PostgreSQL se aplica solo cuando el volumen `pgdata` está vacío
(`db/supabase/001_schema.sql`). Si ya tienes usuarios y avances en
`data/istqb.db`, impórtalos antes de dar de alta cuentas nuevas. La importación
corre dentro de un contenedor, así que no hace falta instalar Node en el host:

```powershell
cd deploy
.\istqb.ps1 migrate ..\data\istqb.db
```

El script respalda la base SQLite con la API de backup (consistente aunque haya
WAL pendiente), verifica integridad y referencias, y rechaza un destino que no
esté vacío.

### Notas

- La contraseña de PostgreSQL se inserta en `DATABASE_URL`; usa solo caracteres
  URL-safe (`A-Z a-z 0-9 . _ ~ -`).
- El tráfico entre `app` y `db` no abandona la red privada de Compose, por eso la
  cadena usa `sslmode=disable` explícito.
- Sobre HTTP plano la cookie de sesión usa `SameSite=Lax` sin `Secure`, así que el
  login funciona por HTTP; publicado por HTTPS se marca `Secure` con
  `SameSite=None`.
