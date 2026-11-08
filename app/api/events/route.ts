import { NextResponse } from "next/server";
import { logAction } from "@/lib/logger";
import { requireUser } from "@/lib/auth";
import { createEvent, deleteEvent, getEvents, updateEvent } from "@/lib/store";

export async function GET() {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  return NextResponse.json({ events: await getEvents(user.id) });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  if (!body?.title || !body?.calendarId || !body?.startDate || !body?.endDate) {
    return NextResponse.json({ error: "Title, calendar, start date and end date are required." }, { status: 400 });
  }
  const event = await createEvent(user.id, {
    title: String(body.title).trim(), description: String(body.description || ""), priority: ["low", "medium", "high"].includes(body.priority) ? body.priority : "medium",
    startDate: String(body.startDate), endDate: String(body.endDate), calendarId: String(body.calendarId), color: String(body.color || "#ff6b4a"),
  });
  logAction("event.created", { id: event.id, title: event.title, calendarId: event.calendarId });
  return NextResponse.json({ event }, { status: 201 });
}

export async function PATCH(request: Request) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const body = await request.json().catch(() => null);
  if (!body?.id) return NextResponse.json({ error: "Event id is required." }, { status: 400 });
  const event = await updateEvent(user.id, String(body.id), body);
  return event ? NextResponse.json({ event }) : NextResponse.json({ error: "Event not found." }, { status: 404 });
}

export async function DELETE(request: Request) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const id = new URL(request.url).searchParams.get("id");
  if (!id || !(await deleteEvent(user.id, id))) return NextResponse.json({ error: "Event not found." }, { status: 404 });
  return NextResponse.json({ ok: true });
}