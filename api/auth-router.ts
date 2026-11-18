import * as cookie from "cookie";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { Session } from "@contracts/constants";
import { getSessionCookieOptions } from "./lib/cookies";
import { createRouter, authedQuery, publicQuery } from "./middleware";
import { signSessionToken } from "./auth/session";
import { hashPassword, verifyPassword } from "./auth/password";
import { usePostgres } from "./queries/postgres";
import {
  countUsers,
  createUser,
  findUserByUsername,
  toPublicUser,
  updateLastSignIn,
} from "./queries/users";

const usernameInput = z
  .string()
  .trim()
  .min(3, "El usuario debe tener al menos 3 caracteres.")
  .max(50, "El usuario debe tener como máximo 50 caracteres.")
  .regex(
    /^[a-zA-Z0-9._-]+$/,
    "El usuario solo puede tener letras, números, punto, guion y guion bajo.",
  );

function setSessionCookie(ctx: { resHeaders: Headers; req: Request }, token: string) {
  const opts = getSessionCookieOptions(ctx.req.headers);
  ctx.resHeaders.append(
    "set-cookie",
    cookie.serialize(Session.cookieName, token, {
      httpOnly: opts.httpOnly,
      path: opts.path,
      sameSite: opts.sameSite?.toLowerCase() as "lax" | "none",
      secure: opts.secure,
      maxAge: Session.maxAgeMs / 1000,
    }),
  );
}

export const authRouter = createRouter({
  // Solo SQLite local conserva la promoción de la primera cuenta.
  register: publicQuery
    .input(
      z.object({
        username: usernameInput,
        password: z
          .string()
          .min(8, "La contraseña debe tener al menos 8 caracteres."),
        name: z.string().trim().max(100).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const username = input.username.toLowerCase();
      const existing = await findUserByUsername(username);
      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Ese usuario ya existe. Elige otro nombre de usuario.",
        });
      }
      const isFirstUser = !usePostgres && (await countUsers()) === 0;
      const user = await createUser({
        username,
        passwordHash: hashPassword(input.password),
        name: input.name?.trim() || username,
        role: isFirstUser ? "admin" : "user",
      });
      if (!user) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "No se pudo crear la cuenta.",
        });
      }
      const token = await signSessionToken({
        userId: user.id,
        username: user.username,
      });
      setSessionCookie(ctx, token);
      return toPublicUser(user);
    }),

  login: publicQuery
    .input(
      z.object({
        username: z.string().trim().min(1, "Escribe tu usuario."),
        password: z.string().min(1, "Escribe tu contraseña."),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = await findUserByUsername(input.username);
      if (!user || !verifyPassword(input.password, user.passwordHash)) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Usuario o contraseña incorrectos.",
        });
      }
      await updateLastSignIn(user.id);
      const token = await signSessionToken({
        userId: user.id,
        username: user.username,
      });
      setSessionCookie(ctx, token);
      return toPublicUser(user);
    }),

  me: authedQuery.query((opts) => toPublicUser(opts.ctx.user)),

  logout: authedQuery.mutation(async ({ ctx }) => {
    const opts = getSessionCookieOptions(ctx.req.headers);
    ctx.resHeaders.append(
      "set-cookie",
      cookie.serialize(Session.cookieName, "", {
        httpOnly: opts.httpOnly,
        path: opts.path,
        sameSite: opts.sameSite?.toLowerCase() as "lax" | "none",
        secure: opts.secure,
        maxAge: 0,
      }),
    );
    return { success: true };
  }),
});
