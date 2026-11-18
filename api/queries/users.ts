import { eq } from "drizzle-orm";
import * as schema from "@db/schema";
import type { InsertUser, User } from "@db/schema";
import { getDb } from "./connection";
import { createPostgresUserQueries } from "./postgres-users";
import { getPostgresDb, usePostgres } from "./postgres";

export type PublicUser = Omit<User, "passwordHash">;

export function toPublicUser(user: User): PublicUser {
  const { passwordHash: _passwordHash, ...rest } = user;
  return rest;
}

export async function findUserById(id: number) {
  if (usePostgres) return createPostgresUserQueries(getPostgresDb()).findById(id);
  const rows = await getDb()
    .select()
    .from(schema.users)
    .where(eq(schema.users.id, id))
    .limit(1);
  return rows.at(0);
}

export async function findUserByUsername(username: string) {
  if (usePostgres) return createPostgresUserQueries(getPostgresDb()).findByUsername(username);
  const rows = await getDb()
    .select()
    .from(schema.users)
    .where(eq(schema.users.username, username.toLowerCase()))
    .limit(1);
  return rows.at(0);
}

export async function countUsers(): Promise<number> {
  const rows = await getDb().select({ id: schema.users.id }).from(schema.users);
  return rows.length;
}

export async function createUser(data: InsertUser) {
  if (usePostgres) return createPostgresUserQueries(getPostgresDb()).createUser(data);
  const rows = await getDb()
    .insert(schema.users)
    .values(data)
    .returning();
  return rows.at(0);
}

export async function updateLastSignIn(id: number) {
  if (usePostgres) return createPostgresUserQueries(getPostgresDb()).updateLastSignIn(id);
  await getDb()
    .update(schema.users)
    .set({ lastSignInAt: new Date() })
    .where(eq(schema.users.id, id));
}
