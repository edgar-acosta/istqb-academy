import * as jose from "jose";
import { env } from "../lib/env.js";

const JWT_ALG = "HS256";

export type SessionPayload = {
  userId: number;
  username: string;
};

export async function signSessionToken(
  payload: SessionPayload,
): Promise<string> {
  const secret = new TextEncoder().encode(env.sessionSecret);
  return new jose.SignJWT(payload)
    .setProtectedHeader({ alg: JWT_ALG })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret);
}

export async function verifySessionToken(
  token: string,
): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const secret = new TextEncoder().encode(env.sessionSecret);
    const { payload } = await jose.jwtVerify(token, secret, {
      algorithms: [JWT_ALG],
    });
    const { userId, username } = payload as unknown as SessionPayload;
    if (typeof userId !== "number" || !username) return null;
    return { userId, username };
  } catch {
    return null;
  }
}
