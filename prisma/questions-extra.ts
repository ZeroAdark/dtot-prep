// ─────────────────────────────────────────────────────────────────────────────
// Extra question banks for topics added after the original seed (e.g. the
// CompTIA A+ Core topics: Computer Hardware, Mobile Devices, Operating Systems,
// Operational Procedures, IT Troubleshooting).
//
// Content lives as JSON in prisma/questions/*.json so it can be edited/added
// without touching code. Used by seed.ts (fresh installs) and by
// seed-questions-sync.ts (idempotent add to an existing database).
// ─────────────────────────────────────────────────────────────────────────────
import { readdirSync, readFileSync } from "fs";
import { join } from "path";

export interface ExtraQuestion {
  section: string;
  topic: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  prompt: string;
  scenario?: string | null;
  options: { id: string; text: string }[];
  correctId: string;
  rationale: string;
  optionNotes?: Record<string, string>;
  reference?: string;
}

function load(): ExtraQuestion[] {
  const dir = join(process.cwd(), "prisma", "questions");
  let files: string[] = [];
  try {
    files = readdirSync(dir).filter((f) => f.endsWith(".json")).sort();
  } catch {
    return []; // directory may not exist in some setups — degrade gracefully
  }
  const out: ExtraQuestion[] = [];
  for (const f of files) {
    const parsed = JSON.parse(
      readFileSync(join(dir, f), "utf8"),
    ) as ExtraQuestion[];
    out.push(...parsed);
  }
  return out;
}

export const EXTRA_QUESTIONS: ExtraQuestion[] = load();
