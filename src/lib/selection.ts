// ─────────────────────────────────────────────────────────────────────────────
// Question selection algorithm.
//
// Picks `count` questions from a pool with three goals, in order:
//   1. Balanced coverage — stratify across the section's topics (largest-
//      remainder allocation) so an exam isn't dominated by one topic.
//   2. Smart weighting — within each topic, bias sampling toward questions the
//      candidate has never seen, then toward ones they previously got wrong,
//      with mild fatigue for frequently-seen items (lightweight spaced repetition).
//   3. Randomized order — the final list is shuffled for presentation.
//
// Pure and deterministic given an injected RNG (handy for tests); defaults to
// Math.random in the app.
// ─────────────────────────────────────────────────────────────────────────────

import { shuffle } from "./utils";

export interface PoolQuestion {
  id: string;
  topic: string;
  difficulty: string;
}

export interface QStat {
  seen: number; // times the candidate has answered this question
  wrong: number; // times answered incorrectly
}
export type HistoryMap = Map<string, QStat>;

type RNG = () => number;

/**
 * Sampling weight for a question. Unseen questions get a strong boost; among
 * seen ones, a higher historical wrong-rate raises the weight while repeated
 * exposure gently lowers it.
 */
export function weightFor(q: PoolQuestion, history?: HistoryMap): number {
  const h = history?.get(q.id);
  if (!h || h.seen === 0) return 3; // never seen → prioritize new material
  const wrongRate = h.wrong / h.seen; // 0..1
  const fatigue = 1 / (1 + 0.5 * h.seen); // seen a lot → smaller
  return (0.5 + 2 * wrongRate) * fatigue + 0.1; // always > 0
}

/** Weighted random sample WITHOUT replacement (roulette-wheel selection). */
function weightedSample(
  items: PoolQuestion[],
  k: number,
  history: HistoryMap | undefined,
  rng: RNG,
): PoolQuestion[] {
  const pool = items.map((q) => ({ q, w: Math.max(1e-4, weightFor(q, history)) }));
  const out: PoolQuestion[] = [];
  const n = Math.min(k, pool.length);
  for (let picks = 0; picks < n; picks++) {
    const total = pool.reduce((s, p) => s + p.w, 0);
    let r = rng() * total;
    let idx = 0;
    for (; idx < pool.length - 1; idx++) {
      r -= pool[idx].w;
      if (r <= 0) break;
    }
    out.push(pool[idx].q);
    pool.splice(idx, 1);
  }
  return out;
}

/** Largest-remainder allocation of `count` across groups sized `groupSizes`. */
export function allocate(groupSizes: number[], count: number): number[] {
  const totalAvail = groupSizes.reduce((a, b) => a + b, 0);
  const target = Math.min(count, totalAvail);
  const base = groupSizes.map(() => 0);
  if (totalAvail === 0) return base;

  const raw = groupSizes.map((s) => (s / totalAvail) * target);
  raw.forEach((v, i) => (base[i] = Math.min(groupSizes[i], Math.floor(v))));
  let assigned = base.reduce((a, b) => a + b, 0);

  const order = raw
    .map((v, i) => ({ i, frac: v - Math.floor(v) }))
    .sort((a, b) => b.frac - a.frac);

  let guard = 0;
  while (assigned < target && guard < target + groupSizes.length + 1) {
    const { i } = order[guard % order.length];
    if (base[i] < groupSizes[i]) {
      base[i]++;
      assigned++;
    }
    guard++;
  }
  return base;
}

/**
 * Select `count` question ids from `pool`: stratified across topics, weighted
 * within each topic by `history`, returned in randomized order.
 */
export function selectQuestions(
  pool: PoolQuestion[],
  count: number,
  history?: HistoryMap,
  rng: RNG = Math.random,
): string[] {
  if (pool.length === 0 || count <= 0) return [];

  // 1. group by topic
  const byTopic = new Map<string, PoolQuestion[]>();
  for (const q of pool) {
    const arr = byTopic.get(q.topic) ?? [];
    arr.push(q);
    byTopic.set(q.topic, arr);
  }
  const topics = [...byTopic.keys()];
  const sizes = topics.map((t) => byTopic.get(t)!.length);

  // 2. allocate the quota across topics
  const alloc = allocate(sizes, count);

  // 3. weighted sample within each topic
  const chosen: PoolQuestion[] = [];
  const chosenIds = new Set<string>();
  topics.forEach((t, i) => {
    for (const q of weightedSample(byTopic.get(t)!, alloc[i], history, rng)) {
      chosen.push(q);
      chosenIds.add(q.id);
    }
  });

  // 4. top up from the remaining pool if rounding/availability left us short
  const target = Math.min(count, pool.length);
  if (chosen.length < target) {
    const remaining = pool.filter((q) => !chosenIds.has(q.id));
    for (const q of weightedSample(remaining, target - chosen.length, history, rng)) {
      chosen.push(q);
    }
  }

  // 5. randomized presentation order
  return shuffle(chosen).map((q) => q.id);
}
