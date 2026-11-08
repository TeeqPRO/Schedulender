import { NextResponse } from "next/server";
import { logAction } from "@/lib/logger";
import { requireUser } from "@/lib/auth";
import { createCalendar, getCalendars } from "@/lib/store";

export async function GET() {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  return NextResponse.json({ calendars: await getCalendars(user.id) });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  if (!body?.name) return NextResponse.json({ error: "Calendar name is required." }, { status: 400 });
  const calendar = await createCalendar(user.id, String(body.name).trim(), String(body.color || "#3B82F6"));
  logAction("calendar.created", calendar);
  return NextResponse.json({ calendar }, { status: 201 });
}
