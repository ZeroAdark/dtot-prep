import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createTestSession } from "@/lib/engine";
import { SECTION_ORDER, SectionKey, TestMode } from "@/lib/constants";
import { sameOrigin } from "@/lib/request-guard";

// GET /api/tests → this candidate's sessions (most recent first)
export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sessions = await prisma.testSession.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { sectionStates: true },
    take: 50,
  });
  return NextResponse.json({ sessions });
}

// POST /api/tests  { mode, sections, countPerSection? } → { id }
export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const mode = body.mode as TestMode;
  const sections = (Array.isArray(body.sections) ? body.sections : []).filter(
    (s: string): s is SectionKey => SECTION_ORDER.includes(s as SectionKey),
  );
  if (!["FULL_EXAM", "SECTION", "PRACTICE"].includes(mode)) {
    return NextResponse.json({ error: "Invalid mode." }, { status: 400 });
  }
  if (sections.length === 0) {
    return NextResponse.json({ error: "Select at least one section." }, { status: 400 });
  }

  try {
    const id = await createTestSession({
      userId,
      mode,
      sections,
      countPerSection: body.countPerSection,
    });
    return NextResponse.json({ id });
  } catch (e) {
    // Log the real error server-side; return a generic message so internal
    // (e.g. Prisma) details aren't disclosed to clients.
    console.error("createTestSession failed", e);
    return NextResponse.json({ error: "Failed to create test." }, { status: 400 });
  }
}
