import { Hono } from "hono";
import type { MiddlewareHandler } from "hono";
import type { HttpBindings } from "@hono/node-server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./router.js";
import { createContext } from "./context.js";
import { env } from "./lib/env.js";
import { log } from "./lib/logger.js";
import { handleClientLog } from "./lib/clientlog.js";
import { REQUEST_ID_HEADER, runWithRequestId } from "./lib/requestcontext.js";
import { authenticateRequest } from "./auth/local.js";
import { getDb } from "./queries/connection.js";
import { recognitions } from "../db/schema.js";
import { recognitions as pgRecognitions } from "../db/postgres-schema.js";
import { getPostgresDb, usePostgres } from "./queries/postgres.js";
import { and, eq } from "drizzle-orm";
import { makeRecognitionPdf } from "./lib/recognition-pdf.js";
import { databaseErrorDetails } from "./lib/database-error.js";

const app = new Hono<{ Bindings: HttpBindings }>();

// One middleware for both halves of request observability, because they need the
// same scope and the same id:
//   - G3 correlation: mint a request id, echo it on the response header (what the
//     browser logger reads), and run the rest of the request inside it so every
//     server log line carries it.
//   - G4 access log: one line per request with method/path/status/duration, so
//     "who called what and how long did it take" is answerable. Until now only
//     failures were logged at all, and success left no trace.
// /api/log is skipped: it is the browser's log sink, and an access line per
// POSTed batch would be self-amplifying noise in the very file it writes.
app.use("*", async (c, next) => {
  const requestId = crypto.randomUUID();
  if (c.req.path === "/api/log") {
    await next();
    return;
  }
  const start = Date.now();
  await runWithRequestId(requestId, async () => {
    await next();
    // Set the header AFTER next(): the tRPC route hands Hono a raw Response
    // built by fetchRequestHandler, which carries its own headers, so a
    // c.header() called before dispatch is dropped on that path. Setting it on
    // the resolved c.res covers every route, including the tRPC one.
    c.res.headers.set(REQUEST_ID_HEADER, requestId);
    // Only /api/* is logged. In production serveStaticFiles() registers a
    // catch-all AFTER this middleware, so a page load pulls in every asset as
    // its own request — logging those would bury the API calls the agent reads
    // this file for, and inflate the log for no diagnostic gain.
    if (!c.req.path.startsWith("/api/")) return;
    log.info("request", {
      method: c.req.method,
      path: c.req.path.startsWith("/api/recognitions/") ? "/api/recognitions/:folio/pdf" : c.req.path,
      status: c.res.status,
      durationMs: Date.now() - start,
    });
  });
});

// Hono's bodyLimit cannot be used here: it only trusts a Content-Length header
// and otherwise reads the request stream to the end and rebuilds the Request
// with `new Request(raw, { body, duplex: "half" })`. Vercel forwards requests to
// the function with `transfer-encoding: chunked` (no Content-Length), so that
// path runs on every POST and the rebuild never resolves — every mutation hung
// until the platform timeout. This guard only inspects the header, so it never
// consumes the body. Platform limits still cap an unchunked oversized upload
// (4.5 MB on Vercel), and lib/clientlog.ts caps its own payload.
function contentLengthLimit(maxSize: number): MiddlewareHandler {
  return async (c, next) => {
    const declared = c.req.header("content-length");
    if (declared && Number(declared) > maxSize) return c.body(null, 413);
    return next();
  };
}

app.use("/api/trpc/*", contentLengthLimit(50 * 1024 * 1024));
app.use("/api/trpc/*", async (c) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: c.req.raw,
    router: appRouter,
    createContext,
  });
});
// Browser-side log sink (see lib/clientlog.ts). Must be registered before the
// /api/* 404 catch-all below.
app.post("/api/log", contentLengthLimit(64 * 1024), handleClientLog);
app.get("/api/recognitions/:folio/pdf", async (c) => {
  let user;
  try {
    user = await authenticateRequest(c.req.raw.headers);
  } catch (error) {
    if (typeof error === "object" && error !== null && "tag" in error && error.tag === "app_error" &&
        "status" in error && (error.status === 401 || error.status === 403)) {
      return c.json({ error: "No autenticado." }, 401);
    }
    throw error;
  }
  const row = usePostgres
    ? (await getPostgresDb().select().from(pgRecognitions).where(and(
        eq(pgRecognitions.folio, c.req.param("folio")), eq(pgRecognitions.userId, user.id),
      )).limit(1))[0]
    : getDb().select().from(recognitions).where(and(
        eq(recognitions.folio, c.req.param("folio")), eq(recognitions.userId, user.id),
      )).get();
  if (!row) return c.json({ error: "Reconocimiento no encontrado." }, 404);
  const bytes = await makeRecognitionPdf(row);
  return new Response(bytes, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="reconocimiento-${row.folio}.pdf"`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
});
app.all("/api/*", (c) => c.json({ error: "Not Found" }, 404));

// Unhandled request errors must reach logs/app.log, not just stdout.
// that file is what the building agent reads when a preview 500s, and without
// this the log looks clean while the request actually failed. Response stays a
// generic 500 (no stack leaked to the caller); the detail goes to the log only.
app.onError((err, c) => {
  const databaseError = databaseErrorDetails(err);
  if (databaseError) {
    log.error("unhandled database error", { method: c.req.method, path: c.req.path, databaseCode: databaseError.code });
  } else {
    log.error("unhandled request error", {
      method: c.req.method, path: c.req.path, error: err.message, stack: err.stack,
    });
  }
  return c.json({ error: "Internal Server Error" }, 500);
});

export default app;

if (env.isProduction && process.env.VERCEL !== "1") {
  // @vercel/node compila a CommonJS y rechaza el await de nivel superior, así
  // que el arranque del servidor HTTP queda dentro de una función. En Vercel no
  // se ejecuta: allí el handler exportado es el que atiende las peticiones.
  startNodeServer().catch((error: unknown) => {
    log.error("failed to start server", {
      error: error instanceof Error ? error.message : String(error),
    });
    process.exitCode = 1;
  });
}

async function startNodeServer() {
  const { serve } = await import("@hono/node-server");
  const { serveStaticFiles } = await import("./lib/vite.js");
  serveStaticFiles(app);

  const port = parseInt(process.env.PORT || "3000");
  serve({ fetch: app.fetch, port }, () => {
    log.info(`Server running on http://localhost:${port}/`);
  });
}
