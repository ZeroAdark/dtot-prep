// ─────────────────────────────────────────────────────────────────────────────
// Study-guide content loader.
//
// Each topic's guides live as a JSON array in prisma/study/*.json so content can
// be edited/added without touching code. This module reads them all, sorts by
// section, and assigns a stable display `order`. Used only by the seed scripts
// (run via tsx at build/deploy time) — never imported by the Next.js app, which
// reads study materials from the database.
// ─────────────────────────────────────────────────────────────────────────────
import { readdirSync, readFileSync } from "fs";
import { join } from "path";

export interface Flashcard {
  front: string;
  back: string;
}

export interface StudyGuide {
  section: string;
  topic: string;
  title: string;
  summary: string;
  content: string;
  keyPoints: string[];
  flashcards: Flashcard[];
  diagrams: string[];
  drills: string[];
  order: number;
}

type RawGuide = Omit<StudyGuide, "order">;

// Attach interactive diagrams + matching drills to specific guides by a keyword
// in the title, so visuals land on the most relevant guide (and content JSON
// stays free of presentation slugs). Slugs map to src/components/diagrams/defs
// and src/lib/drills.
const VISUAL_RULES: { kw: string; diagrams?: string[]; drills?: string[] }[] = [
  { kw: "Network Models", diagrams: ["osi-model"], drills: ["osi-layer-functions"] },
  { kw: "Core Protocols", drills: ["ports-protocols"] },
  { kw: "Topologies", diagrams: ["network-topologies"] },
  { kw: "Motherboards", diagrams: ["motherboard", "pc-components"] },
  { kw: "Memory & Storage", diagrams: ["storage-memory"] },
  { kw: "Cables & Connectors", diagrams: ["ports-connectors", "ports-connectors-2", "internal-cables"], drills: ["connectors-use"] },
  { kw: "Service & Deployment Models", diagrams: ["cloud-service-models", "cloud-deployment-models"], drills: ["cloud-responsibility"] },
  { kw: "CIA Triad", diagrams: ["cia-triad"] },
  { kw: "Network Defense", diagrams: ["network-security-zones"] },
];

function visualsFor(title: string): { diagrams: string[]; drills: string[] } {
  const diagrams: string[] = [];
  const drills: string[] = [];
  for (const r of VISUAL_RULES) {
    if (title.includes(r.kw)) {
      if (r.diagrams) diagrams.push(...r.diagrams);
      if (r.drills) drills.push(...r.drills);
    }
  }
  return { diagrams, drills };
}

// Display order for sections so guides group sensibly in the hub.
const SECTION_RANK: Record<string, number> = {
  JOB_KNOWLEDGE: 0,
  SITUATIONAL_JUDGMENT: 1,
  ENGLISH_EXPRESSION: 2,
};

function loadRaw(): RawGuide[] {
  const dir = join(process.cwd(), "prisma", "study");
  const files = readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .sort();
  const out: RawGuide[] = [];
  for (const f of files) {
    const parsed = JSON.parse(readFileSync(join(dir, f), "utf8")) as RawGuide[];
    for (const g of parsed) {
      out.push({
        section: g.section,
        topic: g.topic,
        title: g.title,
        summary: g.summary,
        content: g.content,
        keyPoints: g.keyPoints ?? [],
        flashcards: g.flashcards ?? [],
        diagrams: g.diagrams?.length ? g.diagrams : visualsFor(g.title).diagrams,
        drills: g.drills?.length ? g.drills : visualsFor(g.title).drills,
      });
    }
  }
  return out;
}

// Stable sort by section rank (file order is preserved within a section), then
// number each guide so `order` drives the per-section list in the UI.
export const STUDY: StudyGuide[] = loadRaw()
  .sort(
    (a, b) => (SECTION_RANK[a.section] ?? 9) - (SECTION_RANK[b.section] ?? 9),
  )
  .map((g, i) => ({ ...g, order: i }));
