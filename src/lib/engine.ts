import { prisma } from "./prisma";
import {
  SECTIONS,
  SECTION_ORDER,
  SectionKey,
  TestMode,
  SESSION_STATUS,
  sectionDurationSec,
} from "./constants";
import { pct } from "./utils";
import { parseOptions, fromJson, toJson } from "./serialize";
import { selectQuestions, HistoryMap } from "./selection";

// ── Config snapshot stored on TestSession.config ─────────────────────────────
interface SectionConfig {
  section: SectionKey;
  durationSec: number;
  questionIds: string[]; // fixed order for the session
}
interface SessionConfig {
  timed: boolean;
  sectionConfig: SectionConfig[];
}

export interface CreateSessionArgs {
  userId: string;
  mode: TestMode;
  sections: SectionKey[];
  countPerSection?: Partial<Record<SectionKey, number>>;
}

/**
 * Builds a test session: picks questions per section, snapshots ordering and
 * timing, sets the authoritative global + first-section deadlines, and creates
 * blank response rows so progress can be resumed exactly.
 */
export async function createTestSession(args: CreateSessionArgs) {
  const now = new Date();
  const timed = args.mode !== "PRACTICE";
  const orderedSections = SECTION_ORDER.filter((s) => args.sections.includes(s));
  if (orderedSections.length === 0) throw new Error("No sections selected.");

  // Build the candidate's answer history so selection can favor unseen and
  // previously-missed questions (see src/lib/selection.ts).
  const priorResponses = await prisma.userResponse.findMany({
    where: { userId: args.userId, selectedOptionId: { not: null } },
    select: { questionId: true, isCorrect: true },
  });
  const history: HistoryMap = new Map();
  for (const r of priorResponses) {
    const h = history.get(r.questionId) ?? { seen: 0, wrong: 0 };
    h.seen += 1;
    if (r.isCorrect === false) h.wrong += 1;
    history.set(r.questionId, h);
  }

  const sectionConfig: SectionConfig[] = [];
  let totalDurationSec = 0;

  for (const section of orderedSections) {
    const meta = SECTIONS[section];
    const requested = args.countPerSection?.[section] ?? meta.defaultCount;
    const pool = await prisma.question.findMany({
      where: { section },
      select: { id: true, topic: true, difficulty: true },
    });
    const chosen = selectQuestions(pool, requested, history);
    const durationSec = sectionDurationSec(section, chosen.length);
    totalDurationSec += durationSec;
    sectionConfig.push({ section, durationSec, questionIds: chosen });
  }

  // Practice is untimed → park the deadline far in the future.
  const deadlineAt = timed
    ? new Date(now.getTime() + totalDurationSec * 1000)
    : new Date(now.getTime() + 1000 * 60 * 60 * 24 * 30);

  const config: SessionConfig = { timed, sectionConfig };

  const session = await prisma.testSession.create({
    data: {
      userId: args.userId,
      mode: args.mode,
      sections: toJson(orderedSections),
      status: SESSION_STATUS.IN_PROGRESS,
      startTime: now,
      deadlineAt,
      totalDurationSec,
      currentSection: orderedSections[0],
      config: toJson(config),
      totalCount: sectionConfig.reduce((n, c) => n + c.questionIds.length, 0),
      sectionStates: {
        create: sectionConfig.map((c, i) => {
          const started = i === 0;
          const secDeadline = timed
            ? new Date(
                Math.min(
                  now.getTime() + c.durationSec * 1000,
                  deadlineAt.getTime(),
                ),
              )
            : null;
          return {
            section: c.section,
            status: started ? "IN_PROGRESS" : "NOT_STARTED",
            durationSec: c.durationSec,
            startedAt: started ? now : null,
            deadlineAt: started ? secDeadline : null,
            totalCount: c.questionIds.length,
          };
        }),
      },
      responses: {
        create: sectionConfig.flatMap((c) =>
          c.questionIds.map((qid) => ({
            userId: args.userId,
            questionId: qid,
            section: c.section,
          })),
        ),
      },
    },
  });

  return session.id;
}

// ── Timer enforcement (server-authoritative) ─────────────────────────────────

/**
 * Locks any section past its deadline, advances to the next section, and
 * expires the whole session past the global deadline — grading as it goes.
 * Idempotent; safe to call on every load and autosave.
 */
export async function enforceTimers(sessionId: string) {
  const session = await prisma.testSession.findUnique({
    where: { id: sessionId },
    include: { sectionStates: true },
  });
  if (!session) return null;
  if (session.status !== SESSION_STATUS.IN_PROGRESS) return session;

  const now = Date.now();
  const config = fromJson<SessionConfig>(session.config, {
    timed: true,
    sectionConfig: [],
  });
  const order = SECTION_ORDER.filter((s) =>
    session.sectionStates.some((ss) => ss.section === s),
  );

  // 1. Lock expired in-progress sections.
  for (const ss of session.sectionStates) {
    if (
      ss.status === "IN_PROGRESS" &&
      ss.deadlineAt &&
      ss.deadlineAt.getTime() <= now
    ) {
      await gradeAndLockSection(sessionId, ss.section, "LOCKED", ss.deadlineAt);
    }
  }

  // 2. Global expiry → lock everything still open, mark EXPIRED.
  if (config.timed && session.deadlineAt.getTime() <= now) {
    for (const ss of session.sectionStates) {
      if (ss.status === "IN_PROGRESS" || ss.status === "NOT_STARTED") {
        await gradeAndLockSection(
          sessionId,
          ss.section,
          "LOCKED",
          session.deadlineAt,
        );
      }
    }
    return finalizeSession(sessionId, SESSION_STATUS.EXPIRED);
  }

  // 3. If the current section is done/locked, auto-start the next one.
  const fresh = await prisma.testSession.findUnique({
    where: { id: sessionId },
    include: { sectionStates: true },
  });
  if (!fresh) return null;
  const active = fresh.sectionStates.find((s) => s.status === "IN_PROGRESS");
  if (!active) {
    const next = order
      .map((sec) => fresh.sectionStates.find((s) => s.section === sec)!)
      .find((s) => s.status === "NOT_STARTED");
    if (next) {
      const cfg = config.sectionConfig.find((c) => c.section === next.section);
      const dur = (cfg?.durationSec ?? next.durationSec) * 1000;
      const startAt = new Date(now);
      const secDeadline = config.timed
        ? new Date(Math.min(now + dur, fresh.deadlineAt.getTime()))
        : null;
      await prisma.sectionState.update({
        where: { id: next.id },
        data: {
          status: "IN_PROGRESS",
          startedAt: startAt,
          deadlineAt: secDeadline,
        },
      });
      await prisma.testSession.update({
        where: { id: sessionId },
        data: { currentSection: next.section },
      });
    } else {
      // No sections left → everything submitted/locked → finalize.
      const allDone = fresh.sectionStates.every(
        (s) => s.status === "SUBMITTED" || s.status === "LOCKED",
      );
      if (allDone) return finalizeSession(sessionId, SESSION_STATUS.COMPLETED);
    }
  }

  return prisma.testSession.findUnique({
    where: { id: sessionId },
    include: { sectionStates: true },
  });
}

/** Grade a single section from its stored responses and set its state. */
export async function gradeAndLockSection(
  sessionId: string,
  section: string,
  status: "LOCKED" | "SUBMITTED",
  submittedAt: Date,
) {
  const responses = await prisma.userResponse.findMany({
    where: { sessionId, section },
  });
  const correct = responses.filter((r) => r.isCorrect === true).length;
  const total = responses.length;
  await prisma.sectionState.update({
    where: { sessionId_section: { sessionId, section } },
    data: {
      status,
      submittedAt,
      correctCount: correct,
      totalCount: total,
      scorePct: pct(correct, total),
    },
  });
}

/** Recompute the whole session score and mark a terminal status. */
export async function finalizeSession(
  sessionId: string,
  status: (typeof SESSION_STATUS)[keyof typeof SESSION_STATUS],
) {
  const responses = await prisma.userResponse.findMany({ where: { sessionId } });
  const correct = responses.filter((r) => r.isCorrect === true).length;
  const total = responses.length;
  const elapsed = await computeElapsed(sessionId);
  return prisma.testSession.update({
    where: { id: sessionId },
    data: {
      status,
      score: pct(correct, total),
      correctCount: correct,
      totalCount: total,
      completedAt: new Date(),
      elapsedTime: elapsed,
    },
    include: { sectionStates: true },
  });
}

async function computeElapsed(sessionId: string): Promise<number> {
  const s = await prisma.testSession.findUnique({ where: { id: sessionId } });
  if (!s) return 0;
  return Math.max(0, Math.round((Date.now() - s.startTime.getTime()) / 1000));
}

// ── Saving answers (auto-grades on write, hidden until submit) ────────────────

export async function saveResponse(args: {
  sessionId: string;
  questionId: string;
  selectedOptionId: string | null;
  flagged?: boolean;
  timeSpentSec?: number;
}) {
  const existing = await prisma.userResponse.findUnique({
    where: {
      sessionId_questionId: {
        sessionId: args.sessionId,
        questionId: args.questionId,
      },
    },
  });
  if (!existing) throw new Error("Response slot not found.");

  // Don't accept answers for a locked/submitted section.
  const ss = await prisma.sectionState.findUnique({
    where: {
      sessionId_section: { sessionId: args.sessionId, section: existing.section },
    },
  });
  if (ss && (ss.status === "LOCKED" || ss.status === "SUBMITTED")) {
    return existing;
  }

  const question = await prisma.question.findUnique({
    where: { id: args.questionId },
  });
  const isCorrect =
    args.selectedOptionId != null && question != null
      ? args.selectedOptionId === question.correctId
      : null;

  return prisma.userResponse.update({
    where: { id: existing.id },
    data: {
      selectedOptionId: args.selectedOptionId,
      isCorrect,
      flagged: args.flagged ?? existing.flagged,
      timeSpentSec:
        args.timeSpentSec != null
          ? existing.timeSpentSec + args.timeSpentSec
          : existing.timeSpentSec,
      answeredAt: args.selectedOptionId != null ? new Date() : null,
    },
  });
}

/** Manually submit (lock) a section and advance. */
export async function submitSection(sessionId: string, section: string) {
  await gradeAndLockSection(sessionId, section, "SUBMITTED", new Date());
  return enforceTimers(sessionId);
}

/** Submit the entire session: lock everything open, finalize, grade. */
export async function submitSession(sessionId: string) {
  const states = await prisma.sectionState.findMany({ where: { sessionId } });
  for (const ss of states) {
    if (ss.status === "IN_PROGRESS" || ss.status === "NOT_STARTED") {
      await gradeAndLockSection(sessionId, ss.section, "SUBMITTED", new Date());
    }
  }
  return finalizeSession(sessionId, SESSION_STATUS.COMPLETED);
}

// ── Building the client DTO ──────────────────────────────────────────────────

export async function getSessionDTO(sessionId: string, userId: string) {
  // Verify ownership BEFORE enforceTimers runs — enforceTimers loads the session
  // by id only and can write (lock/expire/advance), so calling it first would
  // let an authenticated user trigger state changes on another user's session
  // just by guessing its id. Non-owners get the same 404 as a missing session.
  const owned = await prisma.testSession.findFirst({
    where: { id: sessionId, userId },
    select: { id: true },
  });
  if (!owned) return null;

  await enforceTimers(sessionId);
  const session = await prisma.testSession.findFirst({
    where: { id: sessionId, userId },
    include: { sectionStates: true, responses: true },
  });
  if (!session) return null;

  const config = fromJson<SessionConfig>(session.config, {
    timed: true,
    sectionConfig: [],
  });
  const finished =
    session.status === SESSION_STATUS.COMPLETED ||
    session.status === SESSION_STATUS.EXPIRED;

  // Pull every question used in this session, ordered per the config snapshot.
  const allIds = config.sectionConfig.flatMap((c) => c.questionIds);
  const questions = await prisma.question.findMany({
    where: { id: { in: allIds } },
  });
  const qById = new Map(questions.map((q) => [q.id, q]));
  const respByQid = new Map(session.responses.map((r) => [r.questionId, r]));

  const sectionsDTO = config.sectionConfig.map((c) => {
    const state = session.sectionStates.find((s) => s.section === c.section)!;
    const reveal = finished || state.status === "SUBMITTED" || state.status === "LOCKED";
    const items = c.questionIds.map((qid) => {
      const q = qById.get(qid)!;
      const r = respByQid.get(qid);
      return {
        questionId: qid,
        topic: q.topic,
        difficulty: q.difficulty,
        prompt: q.prompt,
        scenario: q.scenario,
        diagram: q.diagram ?? null,
        options: parseOptions(q.options),
        selectedOptionId: r?.selectedOptionId ?? null,
        flagged: r?.flagged ?? false,
        // Answers only revealed once the section/session is closed:
        correctId: reveal ? q.correctId : null,
        rationale: reveal ? q.rationale : null,
        optionNotes: reveal ? fromJson<Record<string, string>>(q.optionNotes, {}) : null,
        reference: reveal ? q.reference : null,
        isCorrect: reveal ? r?.isCorrect ?? null : null,
      };
    });
    return {
      section: c.section,
      status: state.status,
      durationSec: state.durationSec,
      startedAt: state.startedAt,
      deadlineAt: state.deadlineAt,
      submittedAt: state.submittedAt,
      correctCount: state.correctCount,
      totalCount: state.totalCount,
      scorePct: state.scorePct,
      reveal,
      questions: items,
    };
  });

  return {
    id: session.id,
    mode: session.mode,
    status: session.status,
    timed: config.timed,
    startTime: session.startTime,
    deadlineAt: session.deadlineAt,
    totalDurationSec: session.totalDurationSec,
    currentSection: session.currentSection,
    score: session.score,
    correctCount: session.correctCount,
    totalCount: session.totalCount,
    completedAt: session.completedAt,
    finished,
    sections: sectionsDTO,
  };
}
