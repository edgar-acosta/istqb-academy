import { describe, expect, it } from "vitest";
import { DrizzleQueryError } from "drizzle-orm";
import { databaseErrorDetails } from "./database-error";

describe("diagnósticos seguros de base de datos", () => {
  it("identifica errores anidados sin divulgar SQL ni parámetros", () => {
    const cause = Object.assign(new Error("detalle sensible"), { code: "23505" });
    const query = new DrizzleQueryError("SQL sensible", ["hash sensible"], cause);
    const details = databaseErrorDetails(new Error("falló", { cause: query }));
    expect(details).toEqual({ code: "23505" });
    expect(JSON.stringify(details)).not.toContain("sensible");
  });

  it("no incluye códigos arbitrarios ni confunde errores ajenos", () => {
    const cause = Object.assign(new Error("detalle"), { code: "dato sensible" });
    expect(databaseErrorDetails(new DrizzleQueryError("SQL", [], cause))).toEqual({ code: undefined });
    expect(databaseErrorDetails(new Error("otro"))).toBeUndefined();
  });
});
