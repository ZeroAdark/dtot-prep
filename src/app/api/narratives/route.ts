import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { scoreRubric, RubricState } from "@/lib/grading";
import { countWords } from "@/lib/utils";
import {
  COMPETENCIES,
  CompetencyKey,
  STARL_TOTAL_ITEMS,
} from "@/lib/constants";
import { toJson } from "@/lib/serialize";

// GET /api/narratives → all of this candidate's narratives (one per competency)
export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const narratives = await prisma.narrative.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json({ narratives });
}

// POST /api/narratives  { competency, content, rubric, status? }
// Upserts the single narrative per competency (so progress resumes).
export async function POST(req: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const competency = body.competency as CompetencyKey;
  const meta = COMPETENCIES[competency];
  if (!meta) {
    return NextResponse.json({ error: "Invalid competency." }, { status: 400 });
  }

  const content = typeof body.content === "string" ? body.content : "";
  const rubricState = (body.rubric ?? {}) as RubricState;
  const scored = scoreRubric(rubricState);
  const status = body.status === "COMPLETE" ? "COMPLETE" : "DRAFT";

  const existing = await prisma.narrative.findFirst({
    where: { userId, competency },
  });

  const data = {
    prompt: meta.prompt,
    content,
    wordCount: countWords(content),
    rubric: toJson(rubricState),
    rubricScore: scored.score,
    rubricMax: STARL_TOTAL_ITEMS,
    status,
  };

  const narrative = existing
    ? await prisma.narrative.update({ where: { id: existing.id }, data })
    : await prisma.narrative.create({
        data: { userId, competency, ...data },
      });

  return NextResponse.json({ narrative, scored });
}
