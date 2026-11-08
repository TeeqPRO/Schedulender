import { NextResponse } from "next/server";
import { logAction } from "@/lib/logger";
import { createSession } from "@/lib/auth";
import { createUser } from "@/lib/store";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body?.email || !body?.password || !body?.name || String(body.password).length < 8) {
    return NextResponse.json({ error: "Name, email and password are required." }, { status: 400 });
  }
  try {
    const user = await createUser(String(body.name).trim(), String(body.email).trim(), String(body.password));
    await createSession(user.id);
    logAction("register", { email: user.email });
    return NextResponse.json({ user: { id: user.id, name: user.name, email: user.email } }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "EMAIL_EXISTS") return NextResponse.json({ error: "This email is already registered." }, { status: 409 });
    throw error;
  }
}
