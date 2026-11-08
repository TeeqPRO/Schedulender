import { NextResponse } from "next/server";
import { logAction } from "@/lib/logger";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body?.email || !body?.calendarId || !["EDITOR", "VIEWER"].includes(body.role)) {
    return NextResponse.json({ error: "Email, calendar and a valid role are required." }, { status: 400 });
  }
  logAction("calendar.invitation.created", { email: body.email, calendarId: body.calendarId, role: body.role });
  return NextResponse.json({ invitation: { email: body.email, role: body.role, status: "PENDING" } }, { status: 201 });
}
