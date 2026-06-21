import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseOptions, fromJson } from "@/lib/serialize";

export const dynamic = "force-dynamic";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// GET /api/study/quiz?material=<id>&n=5
// Returns a random self-check set drawn from the question bank for the study
// guide's topic (falling back to its whole section). Answers are included —
// this is ungraded study mode, where the client reveals feedback on selection.
export async function GET(req: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const materialId = searchParams.get("material");
  const n = Math.min(10, Math.max(1, Number(searchParams.get("n")) || 5));
  if (!materialId) {
    return NextResponse.json({ error: "Missing material." }, { status: 400 });
  }

  const material = await prisma.studyMaterial.findUnique({
    where: { id: materialId },
    select: { section: true, topic: true },
  });
  if (!material) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Prefer questions matching this guide's exact topic; if too few exist, widen
  // to the whole section so the self-check always has enough to show.
  let pool = await prisma.question.findMany({
    where: { section: material.section, topic: material.topic },
  });
  if (pool.length < n) {
    pool = await prisma.question.findMany({ where: { section: material.section } });
  }

  const questions = shuffle(pool)
    .slice(0, n)
    .map((q) => ({
      id: q.id,
      topic: q.topic,
      difficulty: q.difficulty,
      prompt: q.prompt,
      scenario: q.scenario,
      options: parseOptions(q.options),
      correctId: q.correctId,
      rationale: q.rationale,
      optionNotes: q.optionNotes
        ? fromJson<Record<string, string>>(q.optionNotes, {})
        : null,
      reference: q.reference,
    }));

  return NextResponse.json({
    section: material.section,
    topic: material.topic,
    questions,
  });
}
