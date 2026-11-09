import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { searchUsers } from "@/lib/store";

export async function GET(request: Request) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const query = new URL(request.url).searchParams.get("query") || "";
  return NextResponse.json({ users: await searchUsers(query, user.id) });
}