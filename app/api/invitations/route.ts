import { NextResponse } from "next/server";
import { logAction } from "@/lib/logger";
import { requireUser } from "@/lib/auth";
import { createInvitation } from "@/lib/store";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  if (!body?.email || !body?.calendarId || !["EDITOR", "VIEWER"].includes(body.role)) {
    return NextResponse.json({ error: "Email, calendar and a valid role are required." }, { status: 400 });
  }
  try {
    const invitation = await createInvitation(user.id, { email: String(body.email), calendarId: String(body.calendarId), role: body.role });
    logAction("calendar.invitation.created", invitation);
    return NextResponse.json({ invitation }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Calendar not found." }, { status: 404 });
  }
}
