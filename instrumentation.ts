import { db } from "@/db";
import { users } from "./db/schema/auth";

export async function register() {
  await db
    .insert(users)
    .values({
      id: "system",
      name: "System",
      email: "system@example.com",
    })
    .onConflictDoNothing();
}
