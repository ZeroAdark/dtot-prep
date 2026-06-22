import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { saveResponse } from "@/lib/engine";
import { sameOrigin } from "@/lib/request-guard";

// POST /api/responses
// { sessionId, questionId, selectedOptionId, flagged?, timeSpentSec? }
export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { sessionId, questionId } = body;
  if (!sessionId || !questionId) {
    return NextResponse.json({ error: "Missing fields." }, { status: 400 });
  }

  // Ownership check.
  const session = await prisma.testSession.findFirst({
    where: { id: sessionId, userId },
    select: { id: true, status: true },
  });
  if (!session) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (session.status !== "IN_PROGRESS") {
    return NextResponse.json({ error: "Session is closed." }, { status: 409 });
  }

  try {
    await saveResponse({
      sessionId,
      questionId,
      selectedOptionId: body.selectedOptionId ?? null,
      flagged: body.flagged,
      timeSpentSec: body.timeSpentSec,
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("saveResponse failed", e);
    return NextResponse.json({ error: "Failed to save." }, { status: 400 });
  }
}
