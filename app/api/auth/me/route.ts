import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";

export async function GET() {
  const user = await requireUser();
  return user ? NextResponse.json({ user: { id: user.id, name: user.name, email: user.email } }) : NextResponse.json({ user: null }, { status: 401 });
}
