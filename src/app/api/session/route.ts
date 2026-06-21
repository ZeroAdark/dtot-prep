import { NextRequest, NextResponse } from "next/server";
import {
  getCurrentUser,
  signIn,
  loginAs,
  listProfiles,
  clearSessionCookie,
} from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET /api/session → { user, profiles }
// Current candidate (or null) plus all local profiles for the picker.
export async function GET() {
  const [user, profiles] = await Promise.all([getCurrentUser(), listProfiles()]);
  return NextResponse.json({ user, profiles });
}

// POST /api/session  { name, email? } → create a NEW profile and sign in.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const name = typeof body.name === "string" ? body.name : "";
  if (!name.trim()) {
    return NextResponse.json({ error: "Name is required." }, { status: 400 });
  }
  const user = await signIn(name, body.email);
  return NextResponse.json({ user });
}

// PUT /api/session  { userId } → sign in as an EXISTING profile (switch).
export async function PUT(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const userId = typeof body.userId === "string" ? body.userId : "";
  if (!userId) {
    return NextResponse.json({ error: "userId is required." }, { status: 400 });
  }
  const user = await loginAs(userId);
  if (!user) {
    return NextResponse.json({ error: "Profile not found." }, { status: 404 });
  }
  return NextResponse.json({ user });
}

// DELETE /api/session → sign out (clear cookie only; profiles are untouched).
export async function DELETE() {
  clearSessionCookie();
  return NextResponse.json({ ok: true });
}
