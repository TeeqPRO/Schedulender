import { NextResponse } from "next/server";
import { logAction } from "@/lib/logger";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body?.title || !body?.calendarId || !body?.startDate || !body?.endDate) {
    return NextResponse.json({ error: "Title, calendar, start date and end date are required." }, { status: 400 });
  }
  const event = { id: crypto.randomUUID(), ...body };
  logAction("event.created", { id: event.id, title: event.title, calendarId: event.calendarId });
  return NextResponse.json({ event }, { status: 201 });
}