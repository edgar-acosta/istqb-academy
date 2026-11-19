import { describe, expect, it } from "vitest";
import { getSessionCookieOptions } from "./cookies.js";

function headers(host: string, forwardedProto?: string): Headers {
  const result = new Headers({ host });
  if (forwardedProto) result.set("x-forwarded-proto", forwardedProto);
  return result;
}

describe("opciones de la cookie de sesión", () => {
  it("usa Lax sin Secure en loopback, incluso por http", () => {
    expect(getSessionCookieOptions(headers("localhost:3000"))).toMatchObject({ sameSite: "Lax", secure: false });
    expect(getSessionCookieOptions(headers("[::1]:3000"))).toMatchObject({ sameSite: "Lax", secure: false });
    expect(getSessionCookieOptions(headers("localhost", "http"))).toMatchObject({ sameSite: "Lax", secure: false });
  });

  it("usa None con Secure detrás de un proxy HTTPS", () => {
    expect(getSessionCookieOptions(headers("academy.example.com", "https")))
      .toMatchObject({ sameSite: "None", secure: true });
  });

  it("usa Lax sin Secure al publicar por IP en HTTP plano", () => {
    expect(getSessionCookieOptions(headers("192.168.1.50", "http")))
      .toMatchObject({ sameSite: "Lax", secure: false });
  });

  it("asume TLS cuando no hay proxy que declare el esquema", () => {
    expect(getSessionCookieOptions(headers("academy.example.com")))
      .toMatchObject({ sameSite: "None", secure: true });
  });
});
