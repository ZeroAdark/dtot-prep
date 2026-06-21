import { NextResponse } from "next/server";
import { deleteProfile } from "@/lib/auth";

export const dynamic = "force-dynamic";

// DELETE /api/profiles/:id → permanently delete a candidate profile and all of
// its data (cascades to sessions, responses, narratives, study progress).
// If it is the profile currently signed in, the session cookie is cleared.
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } },
) {
  if (!params.id) {
    return NextResponse.json({ error: "Missing id." }, { status: 400 });
  }
  const removed = await deleteProfile(params.id);
  if (!removed) {
    return NextResponse.json({ error: "Profile not found." }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
