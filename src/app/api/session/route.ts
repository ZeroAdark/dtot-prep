import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, signIn, clearSessionCookie } from "@/lib/auth";

// GET /api/session → current candidate (or null)
export async function GET() {
  const user = await getCurrentUser();
  return NextResponse.json({ user });
}

// POST /api/session  { name, email? } → create + sign in candidate
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const name = typeof body.name === "string" ? body.name : "";
  if (!name.trim()) {
    return NextResponse.json({ error: "Name is required." }, { status: 400 });
  }
  const user = await signIn(name, body.email);
  return NextResponse.json({ user });
}

// DELETE /api/session → sign out
export async function DELETE() {
  clearSessionCookie();
  return NextResponse.json({ ok: true });
}
