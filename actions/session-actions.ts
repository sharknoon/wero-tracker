import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function requireSession() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function requireAdmin() {
  const session = await requireSession();
  if (session.user.role !== "admin") {
    throw new Error("Unauthorized");
  }
  return session;
}
