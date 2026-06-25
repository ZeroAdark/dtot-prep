import { STARL_RUBRIC, STARL_TOTAL_ITEMS, PASS_THRESHOLD } from "./constants";
import { pct } from "./utils";

// ── STAR-L rubric scoring ────────────────────────────────────────────────────

export type RubricState = Record<string, boolean>; // itemId -> checked

export interface RubricResult {
  score: number;
  max: number;
  percent: number;
  byCategory: { key: string; label: string; got: number; max: number }[];
  level: "Needs work" | "Developing" | "Strong" | "Exemplary";
}

export function scoreRubric(state: RubricState): RubricResult {
  let score = 0;
  const byCategory = STARL_RUBRIC.map((cat) => {
    const got = cat.items.filter((it) => state[it.id]).length;
    score += got;
    return { key: cat.key, label: cat.label, got, max: cat.items.length };
  });
  const max = STARL_TOTAL_ITEMS;
  const percent = pct(score, max);
  let level: RubricResult["level"] = "Needs work";
  if (percent >= 90) level = "Exemplary";
  else if (percent >= 70) level = "Strong";
  else if (percent >= 45) level = "Developing";
  return { score, max, percent, byCategory, level };
}

// ── Readiness scoring (dashboard) ────────────────────────────────────────────

export interface ReadinessBand {
  label: "Not ready" | "Building" | "On track" | "Exam ready";
  tone: "destructive" | "warning" | "primary" | "success";
}

export function readinessBand(percent: number | null): ReadinessBand {
  if (percent == null) return { label: "Not ready", tone: "destructive" };
  if (percent >= 85) return { label: "Exam ready", tone: "success" };
  if (percent >= PASS_THRESHOLD) return { label: "On track", tone: "primary" };
  if (percent >= 50) return { label: "Building", tone: "warning" };
  return { label: "Not ready", tone: "destructive" };
}
