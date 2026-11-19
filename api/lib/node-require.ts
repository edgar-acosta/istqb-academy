import { createRequire as makeRequire } from "node:module";

// El mismo código se compila de dos formas: ESM en el bundle de Docker y en el
// build local (donde existe import.meta.url) y CommonJS en las funciones de
// Vercel (donde import.meta queda vacío y solo existe __filename). Se elige la
// base disponible para que createRequire nunca reciba undefined.
//
// El alias makeRequire evita colisión con el `createRequire` que el script de
// build inyecta como banner en el bundle.
export function createNodeRequire(): ReturnType<typeof makeRequire> {
  const base = typeof __filename !== "undefined" ? __filename : import.meta.url;
  return makeRequire(base);
}
