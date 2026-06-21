/* eslint-disable no-console */
// ─────────────────────────────────────────────────────────────────────────────
// Idempotent question top-up.
//
// Inserts any EXTRA_QUESTIONS (prisma/questions/*.json) whose prompt is not
// already in the database. Safe to run repeatedly and on a live database: it
// never deletes or modifies existing questions (so candidate responses, which
// cascade from questions, are preserved) and never inserts a duplicate prompt.
// Run on every container start so new-topic questions reach the live volume.
// ─────────────────────────────────────────────────────────────────────────────
import { PrismaClient } from "@prisma/client";
import { EXTRA_QUESTIONS } from "./questions-extra";

const prisma = new PrismaClient();
const j = (v: unknown) => JSON.stringify(v);

async function main() {
  if (EXTRA_QUESTIONS.length === 0) {
    console.log("No extra questions to sync.");
    return;
  }
  const existing = new Set(
    (await prisma.question.findMany({ select: { prompt: true } })).map(
      (q) => q.prompt,
    ),
  );
  const toAdd = EXTRA_QUESTIONS.filter((q) => !existing.has(q.prompt));
  console.log(
    `Extra questions: ${EXTRA_QUESTIONS.length}; missing from DB: ${toAdd.length}`,
  );
  for (const q of toAdd) {
    await prisma.question.create({
      data: {
        section: q.section,
        topic: q.topic,
        difficulty: q.difficulty,
        prompt: q.prompt,
        scenario: q.scenario ?? null,
        options: j(q.options),
        correctId: q.correctId,
        rationale: q.rationale,
        optionNotes: q.optionNotes ? j(q.optionNotes) : null,
        reference: q.reference ?? null,
      },
    });
  }
  console.log(
    `Added ${toAdd.length} question(s). Total questions now: ${await prisma.question.count()}.`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
