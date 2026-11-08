import { NextResponse } from "next/server";
import { logAction } from "@/lib/logger";
import { createSession } from "@/lib/auth";
import { findUser } from "@/lib/store";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body?.email || !body?.password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }
  const user = await findUser(String(body.email), String(body.password));
  if (!user) return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  await createSession(user.id);
  logAction("login", { email: user.email });
  return NextResponse.json({ user: { id: user.id, name: user.name, email: user.email } });
}
