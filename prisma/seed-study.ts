/* eslint-disable no-console */
// ─────────────────────────────────────────────────────────────────────────────
// Study-materials-only refresh.
//
// Replaces all StudyMaterial rows with the current content in prisma/study/*.json
// WITHOUT touching questions, users, sessions, responses, narratives, or study
// progress. Safe to run on every container start, so updated/expanded study
// content deploys to a live database without wiping candidate data.
// (StudyMaterial has no foreign keys from user data, so delete + re-insert is safe;
//  StudyProgress references materials only by id string, not a DB relation.)
// ─────────────────────────────────────────────────────────────────────────────
import { PrismaClient } from "@prisma/client";
import { STUDY } from "./study-data";

const prisma = new PrismaClient();
const j = (v: unknown) => JSON.stringify(v);

async function main() {
  console.log(`Refreshing ${STUDY.length} study materials…`);
  await prisma.studyMaterial.deleteMany();
  for (const s of STUDY) {
    await prisma.studyMaterial.create({
      data: {
        section: s.section,
        topic: s.topic,
        title: s.title,
        summary: s.summary,
        content: s.content,
        keyPoints: j(s.keyPoints),
        flashcards: j(s.flashcards),
        order: s.order,
      },
    });
  }
  const count = await prisma.studyMaterial.count();
  console.log(`Study refresh complete: ${count} materials.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
