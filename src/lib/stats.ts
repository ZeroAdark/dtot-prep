import { prisma } from "./prisma";
import {
  SECTION_ORDER,
  SectionKey,
  COMPETENCY_ORDER,
  STARL_TOTAL_ITEMS,
} from "./constants";
import { pct } from "./utils";
import { readinessBand } from "./grading";

const FINISHED = ["COMPLETED", "EXPIRED"];

// "Online" = active within this window; "active today" = within the last 24h.
// lastSeenAt is bumped on each authenticated request (throttled in auth.ts).
const ONLINE_WINDOW_MS = 5 * 60 * 1000;
const TODAY_WINDOW_MS = 24 * 60 * 60 * 1000;

export interface UserStats {
  totalUsers: number;
  onlineUsers: number;
  activeToday: number;
}

/** Aggregate, non-PII counts for the public landing page. */
export async function getUserStats(): Promise<UserStats> {
  const now = Date.now();
  const onlineSince = new Date(now - ONLINE_WINDOW_MS);
  const todaySince = new Date(now - TODAY_WINDOW_MS);
  const [totalUsers, onlineUsers, activeToday] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { lastSeenAt: { gte: onlineSince } } }),
    prisma.user.count({ where: { lastSeenAt: { gte: todaySince } } }),
  ]);
  return { totalUsers, onlineUsers, activeToday };
}

export interface SectionReadiness {
  section: SectionKey;
  attempted: number; // questions answered/graded across finished sessions
  correct: number;
  total: number;
  percent: number | null;
  band: ReturnType<typeof readinessBand>;
}

export interface DashboardStats {
  overallReadiness: number | null;
  overallBand: ReturnType<typeof readinessBand>;
  sections: SectionReadiness[];
  totalSessions: number;
  finishedSessions: number;
  inProgress: number;
  totalAnswered: number;
  totalCorrect: number;
  mistakeCount: number;
  narrativesComplete: number;
  narrativesTotal: number;
  avgRubricPercent: number | null;
  recentSessions: {
    id: string;
    mode: string;
    status: string;
    score: number | null;
    createdAt: Date;
    sections: string;
    correctCount: number;
    totalCount: number;
  }[];
  hasActivity: boolean;
}

export async function getDashboardStats(userId: string): Promise<DashboardStats> {
  const [sessions, finishedResponses, narratives] = await Promise.all([
    prisma.testSession.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    }),
    prisma.userResponse.findMany({
      where: {
        userId,
        session: { status: { in: FINISHED } },
      },
      select: { section: true, isCorrect: true, selectedOptionId: true },
    }),
    prisma.narrative.findMany({ where: { userId } }),
  ]);

  const sectionStats: SectionReadiness[] = SECTION_ORDER.map((section) => {
    const rows = finishedResponses.filter((r) => r.section === section);
    const total = rows.length;
    const correct = rows.filter((r) => r.isCorrect === true).length;
    const percent = total > 0 ? pct(correct, total) : null;
    return {
      section,
      attempted: rows.filter((r) => r.selectedOptionId != null).length,
      correct,
      total,
      percent,
      band: readinessBand(percent),
    };
  });

  const measured = sectionStats.filter((s) => s.percent != null);
  const overallReadiness =
    measured.length > 0
      ? Math.round(
          (measured.reduce((sum, s) => sum + (s.percent ?? 0), 0) /
            measured.length) *
            10,
        ) / 10
      : null;

  const totalAnswered = finishedResponses.filter(
    (r) => r.selectedOptionId != null,
  ).length;
  const totalCorrect = finishedResponses.filter(
    (r) => r.isCorrect === true,
  ).length;
  const mistakeCount = finishedResponses.filter(
    (r) => r.isCorrect === false,
  ).length;

  const narrativesComplete = narratives.filter(
    (n) => n.status === "COMPLETE",
  ).length;
  const rubricPercents = narratives
    .filter((n) => n.rubricMax > 0)
    .map((n) => (n.rubricScore / n.rubricMax) * 100);
  const avgRubricPercent =
    rubricPercents.length > 0
      ? Math.round(
          (rubricPercents.reduce((a, b) => a + b, 0) / rubricPercents.length) *
            10,
        ) / 10
      : null;

  return {
    overallReadiness,
    overallBand: readinessBand(overallReadiness),
    sections: sectionStats,
    totalSessions: sessions.length,
    finishedSessions: sessions.filter((s) => FINISHED.includes(s.status)).length,
    inProgress: sessions.filter((s) => s.status === "IN_PROGRESS").length,
    totalAnswered,
    totalCorrect,
    mistakeCount,
    narrativesComplete,
    narrativesTotal: COMPETENCY_ORDER.length,
    avgRubricPercent,
    recentSessions: sessions.slice(0, 6).map((s) => ({
      id: s.id,
      mode: s.mode,
      status: s.status,
      score: s.score,
      createdAt: s.createdAt,
      sections: s.sections,
      correctCount: s.correctCount,
      totalCount: s.totalCount,
    })),
    hasActivity: sessions.length > 0 || narratives.length > 0,
  };
}

export { STARL_TOTAL_ITEMS };
