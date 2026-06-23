import { NextResponse } from "next/server";
import { getUserStats } from "@/lib/stats";

export const dynamic = "force-dynamic";

// GET /api/stats → { totalUsers, onlineUsers }
// Public aggregate counts for the landing page — no PII, no auth required.
export async function GET() {
  const stats = await getUserStats();
  return NextResponse.json(stats);
}
