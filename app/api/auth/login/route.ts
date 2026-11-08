import { NextResponse } from "next/server";
import { logAction } from "@/lib/logger";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body?.email || !body?.password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }
  logAction("login", { email: body.email });
  return NextResponse.json({ user: { email: body.email } });
}
