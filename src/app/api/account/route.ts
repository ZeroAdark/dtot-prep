import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId, deleteAccountWithPassword } from "@/lib/auth";

export const dynamic = "force-dynamic";

// DELETE /api/account  { password } → delete the SIGNED-IN account (re-auth with
// password). Cascades to the user's sessions, responses, narratives, and study
// progress. A user can only ever delete their own account.
export async function DELETE(req: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const password = typeof body.password === "string" ? body.password : "";

  const ok = await deleteAccountWithPassword(userId, password);
  if (!ok) {
    return NextResponse.json({ error: "Incorrect password." }, { status: 403 });
  }
  return NextResponse.json({ ok: true });
}
