import { NextResponse } from "next/server";
import { logAction } from "@/lib/logger";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body?.name) return NextResponse.json({ error: "Calendar name is required." }, { status: 400 });
  const calendar = { id: crypto.randomUUID(), name: body.name, color: body.color || "#3B82F6" };
  logAction("calendar.created", calendar);
  return NextResponse.json({ calendar }, { status: 201 });
}
