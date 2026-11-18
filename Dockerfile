# syntax=docker/dockerfile:1

# Imagen de la app (Vite + Hono). El resultado es un único proceso Node que
# sirve /api/* y los archivos estáticos de dist/public en el puerto 3000.
#
# better-sqlite3 es una dependencia nativa y queda como `external` en el bundle
# (ver el script `build` de package.json), así que debe existir en node_modules
# en tiempo de ejecución aunque el despliegue use PostgreSQL.
# Se usa Debian (glibc) y no Alpine: así prebuild-install descarga el binario ya
# compilado en vez de compilar desde código fuente.

FROM node:22-bookworm-slim AS build
WORKDIR /app

# Toolchain por si better-sqlite3 no encuentra binario precompilado para la
# arquitectura de destino. Queda solo en esta etapa.
RUN apt-get update \
 && apt-get install -y --no-install-recommends python3 make g++ \
 && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build && npm prune --omit=dev

FROM node:22-bookworm-slim AS runtime
ENV NODE_ENV=production \
    PORT=3000
WORKDIR /app

COPY --from=build --chown=node:node /app/package.json /app/package-lock.json ./
COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/dist ./dist
# Scripts operativos (migración SQLite->PostgreSQL) ejecutables dentro de la
# imagen, para que no dependan de tener Node instalado en el host.
COPY --from=build --chown=node:node /app/scripts ./scripts

# El logger escribe logs/app.log; debe existir y ser escribible por el usuario
# sin privilegios con el que corre el proceso.
RUN mkdir -p /app/logs && chown -R node:node /app/logs

USER node
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "dist/boot.js"]
