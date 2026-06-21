import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, register, login, logout } from "@/lib/auth";

export const dynamic = "force-dynamic";

// Set the Secure cookie flag only when the request actually arrived over HTTPS
// (so LAN http:// access still works, while Cloudflare/LAN https get Secure).
function isSecure(req: NextRequest): boolean {
  if (req.headers.get("x-forwarded-proto")?.split(",")[0].trim() === "https") {
    return true;
  }
  try {
    return new URL(req.url).protocol === "https:";
  } catch {
    return false;
  }
}

// GET /api/session → { user } (current candidate, or null)
export async function GET() {
  const user = await getCurrentUser();
  return NextResponse.json({ user });
}

// POST /api/session  { name, password } → register a new account + sign in
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const name = typeof body.name === "string" ? body.name : "";
  const password = typeof body.password === "string" ? body.password : "";
  const result = await register(name, password, isSecure(req));
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json({ user: result.user });
}

// PUT /api/session  { name, password } → sign in to an existing account
export async function PUT(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const name = typeof body.name === "string" ? body.name : "";
  const password = typeof body.password === "string" ? body.password : "";
  const result = await login(name, password, isSecure(req));
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 401 });
  }
  return NextResponse.json({ user: result.user, claimed: result.claimed });
}

// DELETE /api/session → sign out (revoke session)
export async function DELETE() {
  await logout();
  return NextResponse.json({ ok: true });
}
