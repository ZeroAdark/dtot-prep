import assert from "node:assert/strict";
import test from "node:test";
import { buildResponseUpdate, parseResponsePatch } from "./response-patch";

test("a flag-only request preserves the selected answer", () => {
  const existing = {
    selectedOptionId: "A" as string | null,
    isCorrect: true as boolean | null,
    flagged: false,
    timeSpentSec: 0,
  };
  const patch = parseResponsePatch({ flagged: true });
  const update = buildResponseUpdate(existing, "A", patch);
  const saved = { ...existing, ...update };

  assert.deepEqual(patch, { flagged: true });
  assert.equal(saved.selectedOptionId, "A");
  assert.equal(saved.isCorrect, true);
  assert.equal(saved.flagged, true);
});

test("four flags do not change a nine-out-of-ten score", () => {
  const responses = Array.from({ length: 10 }, (_, index) => ({
    selectedOptionId: index === 0 ? "B" : "A",
    isCorrect: index !== 0,
    flagged: false,
    timeSpentSec: 0,
  }));

  for (let index = 0; index < 4; index += 1) {
    const patch = parseResponsePatch({ flagged: true });
    Object.assign(
      responses[index],
      buildResponseUpdate(responses[index], "A", patch),
    );
  }

  assert.equal(
    responses.filter((response) => response.isCorrect === true).length,
    9,
  );
  assert.equal(
    responses.filter((response) => response.selectedOptionId !== null).length,
    10,
  );
});

test("an explicit null still clears an answer", () => {
  const update = buildResponseUpdate(
    { flagged: true, timeSpentSec: 7 },
    "A",
    parseResponsePatch({ selectedOptionId: null }),
  );

  assert.equal(update.selectedOptionId, null);
  assert.equal(update.isCorrect, null);
  assert.equal(update.answeredAt, null);
  assert.equal(update.flagged, undefined);
});
