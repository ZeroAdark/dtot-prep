import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, register, login, logout } from "@/lib/auth";
import {
  checkRateLimit,
  registerFailure,
  clearRateLimit,
  clientIp,
} from "@/lib/rate-limit";
import { sameOrigin } from "@/lib/request-guard";

export const dynamic = "force-dynamic";

// In production the origin is always reached over HTTPS (Cloudflare/Caddy edge),
// so set the Secure cookie flag unconditionally rather than trusting a
// client-suppliable X-Forwarded-Proto header. In dev, allow plain-http LAN use.
function isSecure(req: NextRequest): boolean {
  if (process.env.NODE_ENV === "production") return true;
  if (req.headers.get("x-forwarded-proto")?.split(",")[0].trim() === "https") {
    return true;
  }
  try {
    return new URL(req.url).protocol === "https:";
  } catch {
    return false;
  }
}

const FORBIDDEN = NextResponse.json({ error: "Forbidden" }, { status: 403 });

function tooMany(retryAfterSec: number) {
  return NextResponse.json(
    { error: "Too many attempts. Please try again later." },
    { status: 429, headers: { "Retry-After": String(retryAfterSec) } },
  );
}

// GET /api/session → { user } (current candidate, or null)
export async function GET() {
  const user = await getCurrentUser();
  return NextResponse.json({ user });
}

// POST /api/session  { name, password } → register a new account + sign in
export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return FORBIDDEN;
  const key = `register:${clientIp(req)}`;
  const rl = checkRateLimit(key);
  if (!rl.allowed) return tooMany(rl.retryAfterSec);

  const body = await req.json().catch(() => ({}));
  const name = typeof body.name === "string" ? body.name : "";
  const password = typeof body.password === "string" ? body.password : "";
  const result = await register(name, password, isSecure(req));
  if (!result.ok) {
    registerFailure(key);
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  clearRateLimit(key);
  return NextResponse.json({ user: result.user });
}

// PUT /api/session  { name, password } → sign in to an existing account
export async function PUT(req: NextRequest) {
  if (!sameOrigin(req)) return FORBIDDEN;
  const key = `login:${clientIp(req)}`;
  const rl = checkRateLimit(key);
  if (!rl.allowed) return tooMany(rl.retryAfterSec);

  const body = await req.json().catch(() => ({}));
  const name = typeof body.name === "string" ? body.name : "";
  const password = typeof body.password === "string" ? body.password : "";
  const result = await login(name, password, isSecure(req));
  if (!result.ok) {
    registerFailure(key);
    return NextResponse.json({ error: result.error }, { status: 401 });
  }
  clearRateLimit(key);
  return NextResponse.json({ user: result.user });
}

// DELETE /api/session → sign out (revoke session)
export async function DELETE(req: NextRequest) {
  if (!sameOrigin(req)) return FORBIDDEN;
  await logout();
  return NextResponse.json({ ok: true });
}
