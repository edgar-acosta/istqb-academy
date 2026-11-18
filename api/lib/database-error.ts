import { DrizzleQueryError } from "drizzle-orm";

export function databaseErrorDetails(error: unknown): { code?: string } | undefined {
  let current = error;
  for (let depth = 0; depth < 5; depth++) {
    if (current instanceof DrizzleQueryError) {
      const cause = current.cause;
      const code = cause && "code" in cause && typeof cause.code === "string" && /^[A-Z0-9]{5}$/.test(cause.code)
        ? cause.code : undefined;
      return { code };
    }
    if (!(current instanceof Error)) break;
    current = current.cause;
  }
  return undefined;
}
