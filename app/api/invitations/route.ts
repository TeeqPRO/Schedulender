import { NextResponse } from "next/server";
import { logAction } from "@/lib/logger";
import { requireUser } from "@/lib/auth";
import { createInvitation, getInvitations, respondToInvitation } from "@/lib/store";

export async function GET() {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  return NextResponse.json({ invitations: await getInvitations(user.id) });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  if (!body?.userId || !body?.calendarId || !["EDITOR", "VIEWER"].includes(body.role)) {
    return NextResponse.json({ error: "User, calendar and a valid role are required." }, { status: 400 });
  }
  try {
    const invitation = await createInvitation(user.id, { inviteeId: String(body.userId), calendarId: String(body.calendarId), role: body.role });
    logAction("calendar.invitation.created", invitation);
    return NextResponse.json({ invitation }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "USER_NOT_FOUND") return NextResponse.json({ error: "User not found." }, { status: 404 });
    return NextResponse.json({ error: "Calendar not found." }, { status: 404 });
  }
}

export async function PATCH(request: Request) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const body = await request.json().catch(() => null);
  if (!body?.id || !["ACCEPTED", "DECLINED"].includes(body.status)) {
    return NextResponse.json({ error: "Invitation id and a valid response are required." }, { status: 400 });
  }
  const invitation = await respondToInvitation(user.id, String(body.id), body.status);
  if (!invitation) return NextResponse.json({ error: "Invitation not found." }, { status: 404 });
  logAction(`calendar.invitation.${String(body.status).toLowerCase()}`, { id: invitation.id, calendarId: invitation.calendarId });
  return NextResponse.json({ invitation });
}
