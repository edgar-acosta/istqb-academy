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
