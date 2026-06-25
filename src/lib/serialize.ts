// Helpers for the JSON-in-String columns (keeps schema portable SQLite⇄Postgres).

export function toJson(value: unknown): string {
  return JSON.stringify(value ?? null);
}

export function fromJson<T>(value: string | null | undefined, fallback: T): T {
  if (value == null || value === "") return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export interface QuestionOption {
  id: string; // "A".."E"
  text: string;
}

export function parseOptions(value: string | null | undefined): QuestionOption[] {
  return fromJson<QuestionOption[]>(value, []);
}

// ── Answer-position balancing ────────────────────────────────────────────────
// The authored question bank is heavily skewed toward A/B as the correct answer
// (~91% of correct answers were A or B). We balance the *displayed* position by
// shuffling each question's options when it is served — deterministically, so a
// given (session, question) always renders the same order (stable across reloads
// and into review). Grading is unaffected: the client submits the option's
// stable `id`, which the server still compares to the stored `correctId`.
//
// Questions whose rationale/notes refer to options BY LETTER ("Option A …",
// "(C)") are left in their original order so those explanations stay consistent;
// the client labels options by display position, so an unshuffled question keeps
// A/B/C/D exactly as written.
const LETTER_COUPLED =
  /\b[Oo]ptions?\s+[A-E]\b|\b[Cc]hoices?\s+[A-E]\b|\([A-Ea-e]\)/;

function seededShuffle<T>(arr: T[], seed: string): T[] {
  const a = [...arr];
  // FNV-1a hash of the seed → 32-bit state for a small xorshift PRNG.
  let s = 2166136261 >>> 0;
  for (let i = 0; i < seed.length; i++) {
    s ^= seed.charCodeAt(i);
    s = Math.imul(s, 16777619) >>> 0;
  }
  const rand = () => {
    s ^= s << 13;
    s >>>= 0;
    s ^= s >>> 17;
    s ^= s << 5;
    s >>>= 0;
    return s / 4294967296;
  };
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Options to display for a question, with the answer position balanced. `seed`
 * makes the order stable (use `${sessionId}:${questionId}` so test + review
 * agree; the ungraded quick-check can seed by question id alone).
 */
export function displayOptions(
  q: {
    options: string | null;
    rationale?: string | null;
    optionNotes?: string | null;
  },
  seed: string,
): QuestionOption[] {
  const options = parseOptions(q.options);
  const text = `${q.rationale ?? ""} ${q.optionNotes ?? ""}`;
  if (LETTER_COUPLED.test(text)) return options; // keep original order
  return seededShuffle(options, seed);
}
