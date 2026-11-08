import { cookies } from "next/headers";
import { randomUUID } from "node:crypto";
import { getUser } from "@/lib/store";

const sessions = new Map<string, { userId: string; expiresAt: number }>();
const cookieName = "schedulender_session";

export async function createSession(userId: string) {
  const token = randomUUID();
  sessions.set(token, { userId, expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 30 });
  (await cookies()).set(cookieName, token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 30 });
}

export async function destroySession() {
  const token = (await cookies()).get(cookieName)?.value;
  if (token) sessions.delete(token);
  (await cookies()).delete(cookieName);
}

export async function requireUser() {
  const token = (await cookies()).get(cookieName)?.value;
  const session = token ? sessions.get(token) : undefined;
  if (!session || session.expiresAt < Date.now()) return null;
  return getUser(session.userId);
}
