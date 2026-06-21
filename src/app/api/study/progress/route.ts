import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET /api/study/progress → { studied: string[] } (material ids the user marked)
export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rows = await prisma.studyProgress.findMany({
    where: { userId },
    select: { materialId: true },
  });
  return NextResponse.json({ studied: rows.map((r) => r.materialId) });
}

// POST /api/study/progress  { materialId, studied: boolean }
// Toggles whether the current candidate has marked a guide as studied.
export async function POST(req: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const materialId: string | undefined = body.materialId;
  const studied = Boolean(body.studied);
  if (!materialId) {
    return NextResponse.json({ error: "Missing materialId." }, { status: 400 });
  }

  // Guard against orphan progress rows pointing at deleted guides.
  const exists = await prisma.studyMaterial.findUnique({
    where: { id: materialId },
    select: { id: true },
  });
  if (!exists) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (studied) {
    await prisma.studyProgress.upsert({
      where: { userId_materialId: { userId, materialId } },
      create: { userId, materialId },
      update: {},
    });
  } else {
    await prisma.studyProgress.deleteMany({ where: { userId, materialId } });
  }

  return NextResponse.json({ ok: true, studied });
}
