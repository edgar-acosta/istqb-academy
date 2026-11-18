import type { CookieOptions } from "hono/utils/cookie";

function hostnameOf(headers: Headers): string {
  const host = (headers.get("host") ?? "").toLowerCase();
  // "[::1]:3000" -> "::1"; "localhost:3000" -> "localhost"; "example.com" -> "example.com"
  if (host.startsWith("[")) {
    const end = host.indexOf("]");
    return end === -1 ? host.slice(1) : host.slice(1, end);
  }
  return host.split(":")[0];
}

function isLoopbackHost(host: string): boolean {
  return host === "localhost" || host === "127.0.0.1" || host === "::1";
}

// El esquema real de la petición lo decide el proxy (Caddy, Vercel): la app
// siempre habla HTTP con el proxy, así que sin X-Forwarded-Proto no hay forma
// de saberlo. Sin ese header se asume TLS salvo en loopback, que es el único
// lugar donde la app se sirve por HTTP a propósito (npm run dev).
function isHttps(headers: Headers, loopback: boolean): boolean {
  const forwarded = headers.get("x-forwarded-proto");
  if (forwarded) return forwarded.split(",")[0].trim().toLowerCase() === "https";
  return !loopback;
}

export function getSessionCookieOptions(headers: Headers): CookieOptions {
  const loopback = isLoopbackHost(hostnameOf(headers));
  // SameSite=None exige Secure: el navegador descarta la cookie si se envía por
  // HTTP plano. Publicar por IP en la red local no tiene TLS, así que ahí se usa
  // Lax, que basta porque la app es same-origin.
  const strict = !loopback && isHttps(headers, loopback);

  return {
    httpOnly: true,
    path: "/",
    sameSite: strict ? "None" : "Lax",
    secure: strict,
  };
}
