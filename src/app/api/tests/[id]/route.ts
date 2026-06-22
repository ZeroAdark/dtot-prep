import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  getSessionDTO,
  submitSection,
  submitSession,
} from "@/lib/engine";
import { SESSION_STATUS } from "@/lib/constants";
import { sameOrigin } from "@/lib/request-guard";

// GET /api/tests/[id] → full session DTO (runs timer enforcement first)
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const dto = await getSessionDTO(id, userId);
  if (!dto) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ session: dto });
}

// PATCH /api/tests/[id]  { action: "submitSection"|"submit"|"abandon", section? }
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const owned = await prisma.testSession.findFirst({
    where: { id, userId },
    select: { id: true },
  });
  if (!owned) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const action = body.action as string;

  if (action === "submitSection" && typeof body.section === "string") {
    await submitSection(id, body.section);
  } else if (action === "submit") {
    await submitSession(id);
  } else if (action === "abandon") {
    await prisma.testSession.update({
      where: { id },
      data: { status: SESSION_STATUS.ABANDONED, completedAt: new Date() },
    });
  } else {
    return NextResponse.json({ error: "Unknown action." }, { status: 400 });
  }

  const dto = await getSessionDTO(id, userId);
  return NextResponse.json({ session: dto });
}
