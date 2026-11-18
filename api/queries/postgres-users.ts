import { eq } from "drizzle-orm";
import { users, type InsertUser, type User } from "../../db/postgres-schema";
import { createPostgresDatabase } from "./postgres";

type PostgresDatabase = ReturnType<typeof createPostgresDatabase>["db"];

export function createPostgresUserQueries(db: PostgresDatabase) {
  return {
    async findById(id: number): Promise<User | undefined> {
      const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
      return user;
    },
    async findByUsername(username: string): Promise<User | undefined> {
      const [user] = await db.select().from(users).where(eq(users.username, username.toLowerCase())).limit(1);
      return user;
    },
    async createUser(data: InsertUser): Promise<User> {
      const [user] = await db.insert(users).values(data).returning();
      if (!user) throw new Error("No se pudo crear el usuario en PostgreSQL.");
      return user;
    },
    async updateLastSignIn(id: number): Promise<void> {
      await db.update(users).set({ lastSignInAt: new Date() }).where(eq(users.id, id));
    },
  };
}
