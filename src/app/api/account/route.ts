import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId, deleteAccountWithPassword } from "@/lib/auth";
import {
  checkRateLimit,
  registerFailure,
  clearRateLimit,
  clientIp,
} from "@/lib/rate-limit";
import { sameOrigin } from "@/lib/request-guard";

export const dynamic = "force-dynamic";

// DELETE /api/account  { password } → delete the SIGNED-IN account (re-auth with
// password). Cascades to the user's sessions, responses, narratives, and study
// progress. A user can only ever delete their own account.
export async function DELETE(req: NextRequest) {
  if (!sameOrigin(req)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Throttle the password re-auth so a hijacked session can't brute-force it.
  const key = `account-delete:${userId}`;
  const rl = checkRateLimit(key);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many attempts. Please try again later." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } },
    );
  }

  const body = await req.json().catch(() => ({}));
  const password = typeof body.password === "string" ? body.password : "";

  const ok = await deleteAccountWithPassword(userId, password);
  if (!ok) {
    registerFailure(key);
    return NextResponse.json({ error: "Incorrect password." }, { status: 403 });
  }
  clearRateLimit(key);
  return NextResponse.json({ ok: true });
}
