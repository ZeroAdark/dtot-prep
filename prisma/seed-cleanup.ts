/* eslint-disable no-console */
// ─────────────────────────────────────────────────────────────────────────────
// Prune out-of-scope QUESTIONS.
//
// Some topics were removed from the DTOT scope after research showed they are
// not part of the test (CompTIA A+/Security+ level + the DTO role). Study guides
// for removed topics are pruned automatically by seed-study (it only reinserts
// what is present in prisma/study/*.json), so this script handles QUESTIONS only.
//
// Idempotent: deletes questions whose topic is in REMOVED_QUESTION_TOPICS and
// nothing else, so it is safe to run on every container start. Deleting a
// question cascades to its responses, which is the intended effect of removing
// out-of-scope material.
// ─────────────────────────────────────────────────────────────────────────────
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Topics no longer in scope. "Systems Integration" is software-developer /
// integration-architecture material (REST/API design, OAuth/JWT, Kafka,
// microservices, ESB) that does not appear on the CompTIA A+/Security+-level
// DTOT and is not part of the Diplomatic Technology Officer role.
const REMOVED_QUESTION_TOPICS = ["Systems Integration"];

async function main() {
  const { count } = await prisma.question.deleteMany({
    where: { topic: { in: REMOVED_QUESTION_TOPICS } },
  });
  console.log(
    `Pruned ${count} out-of-scope question(s) [${REMOVED_QUESTION_TOPICS.join(", ")}]. Total questions now: ${await prisma.question.count()}.`,
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
