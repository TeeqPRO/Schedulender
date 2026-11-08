import { NextResponse } from "next/server";
import { logAction } from "@/lib/logger";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body?.email || !body?.password || !body?.name) {
    return NextResponse.json({ error: "Name, email and password are required." }, { status: 400 });
  }
  logAction("register", { email: body.email });
  return NextResponse.json({ user: { name: body.name, email: body.email } }, { status: 201 });
}
