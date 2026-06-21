import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createTestSession } from "@/lib/engine";
import { SECTION_ORDER, SectionKey, TestMode } from "@/lib/constants";

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
    const msg = e instanceof Error ? e.message : "Failed to create test.";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
