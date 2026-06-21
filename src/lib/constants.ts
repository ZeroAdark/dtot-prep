// ─────────────────────────────────────────────────────────────────────────────
// DTOT domain constants: sections, timing, competencies, and the STAR-L rubric.
// Single source of truth shared by the test engine, grading, seed, and UI.
// ─────────────────────────────────────────────────────────────────────────────

export type SectionKey =
  | "JOB_KNOWLEDGE"
  | "SITUATIONAL_JUDGMENT"
  | "ENGLISH_EXPRESSION";

export type Difficulty = "EASY" | "MEDIUM" | "HARD";

export interface SectionMeta {
  key: SectionKey;
  label: string;
  short: string;
  blurb: string;
  /** Official full-length question count for this section on the real DTOT. */
  examQuestions: number;
  /** Official full-length time limit (minutes) for this section. */
  examMinutes: number;
  /** Default number of questions pulled for a full-length section (= examQuestions). */
  defaultCount: number;
  /** Tailwind accent token base (see globals.css section-* classes). */
  accent: string;
  topics: string[];
}

export const SECTIONS: Record<SectionKey, SectionMeta> = {
  JOB_KNOWLEDGE: {
    key: "JOB_KNOWLEDGE",
    label: "Job Knowledge",
    short: "JK",
    blurb:
      "Computer hardware, operating systems, IT & telecommunications, networking, cybersecurity, mobile devices, troubleshooting, operational procedures, radio systems, PBX/VoIP, cloud, and data analytics.",
    examQuestions: 60,
    examMinutes: 40,
    defaultCount: 60,
    accent: "sky",
    topics: [
      "Computer Hardware",
      "Operating Systems",
      "IT & Telecommunications",
      "Cybersecurity",
      "Mobile Devices",
      "IT Troubleshooting",
      "Operational Procedures",
      "Radio Systems",
      "PBX / VoIP Convergence",
      "Cloud Computing",
      "Data Analytics",
    ],
  },
  SITUATIONAL_JUDGMENT: {
    key: "SITUATIONAL_JUDGMENT",
    label: "Situational Judgment",
    short: "SJ",
    blurb:
      "Scenario-based critical thinking, crisis response, and diplomatic problem-solving in an embassy context.",
    examQuestions: 28,
    examMinutes: 42,
    defaultCount: 28,
    accent: "violet",
    topics: [
      "Crisis Response",
      "Diplomatic Problem-Solving",
      "Resource Prioritization",
      "Interpersonal Judgment",
      "Security & Compliance",
    ],
  },
  ENGLISH_EXPRESSION: {
    key: "ENGLISH_EXPRESSION",
    label: "English Expression",
    short: "EE",
    blurb:
      "Grammar, syntax, usage, and professional communication for clear, correct diplomatic writing.",
    examQuestions: 65,
    examMinutes: 50,
    defaultCount: 65,
    accent: "emerald",
    topics: [
      "Grammar",
      "Syntax & Sentence Structure",
      "Usage & Word Choice",
      "Punctuation",
      "Professional Communication",
    ],
  },
};

export const SECTION_ORDER: SectionKey[] = [
  "JOB_KNOWLEDGE",
  "SITUATIONAL_JUDGMENT",
  "ENGLISH_EXPRESSION",
];

export const QUIZ_SECTIONS = SECTION_ORDER; // auto-graded multiple choice

/** Passing bar used for readiness scoring (percent). */
export const PASS_THRESHOLD = 70;

export function sectionMeta(key: string): SectionMeta | undefined {
  return SECTIONS[key as SectionKey];
}

/**
 * Seconds allotted for `count` questions in a section, scaled from the official
 * DTOT pace. At full length (count === examQuestions) this equals the official
 * section time exactly; shorter practice sets scale down proportionally.
 */
export function sectionDurationSec(key: SectionKey, count: number): number {
  const m = SECTIONS[key];
  if (count <= 0) return 0;
  return Math.max(1, Math.round((count * m.examMinutes * 60) / m.examQuestions));
}

/** Totals for a full-length, all-section mock exam (matches the real DTOT). */
export const FULL_EXAM_QUESTIONS = SECTION_ORDER.reduce(
  (n, s) => n + SECTIONS[s].examQuestions,
  0,
);
export const FULL_EXAM_MINUTES = SECTION_ORDER.reduce(
  (n, s) => n + SECTIONS[s].examMinutes,
  0,
);

// ── Personal Narrative competencies (the six required essays) ────────────────

export type CompetencyKey =
  | "SUBSTANTIVE_KNOWLEDGE"
  | "INTELLECTUAL"
  | "INTERPERSONAL"
  | "COMMUNICATION"
  | "LEADERSHIP"
  | "MANAGEMENT";

export interface CompetencyMeta {
  key: CompetencyKey;
  label: string;
  prompt: string;
  hint: string;
}

export const COMPETENCIES: Record<CompetencyKey, CompetencyMeta> = {
  SUBSTANTIVE_KNOWLEDGE: {
    key: "SUBSTANTIVE_KNOWLEDGE",
    label: "Substantive Knowledge / Skills",
    prompt:
      "Describe a situation in which you applied specialized technical knowledge or skills to accomplish an important objective. What was the challenge, what did you do, and what was the outcome?",
    hint: "Show depth of expertise in a relevant technical domain (networks, cybersecurity, cloud, telecom, etc.).",
  },
  INTELLECTUAL: {
    key: "INTELLECTUAL",
    label: "Intellectual Skills",
    prompt:
      "Describe a time you analyzed a complex problem, weighed alternatives, and reached a sound conclusion or decision. How did you think it through?",
    hint: "Highlight analysis, judgment, planning, and creative problem-solving under ambiguity.",
  },
  INTERPERSONAL: {
    key: "INTERPERSONAL",
    label: "Interpersonal Skills",
    prompt:
      "Describe a situation in which you built a productive relationship or resolved a conflict with others to achieve a shared goal. How did you handle the people dynamics?",
    hint: "Show empathy, cultural awareness, collaboration, and conflict resolution.",
  },
  COMMUNICATION: {
    key: "COMMUNICATION",
    label: "Communication Skills",
    prompt:
      "Describe a time you communicated complex or technical information clearly to a non-technical or diverse audience. What approach did you take and what was the result?",
    hint: "Emphasize clarity, audience adaptation, listening, and persuasion — oral or written.",
  },
  LEADERSHIP: {
    key: "LEADERSHIP",
    label: "Leadership Skills",
    prompt:
      "Describe a situation in which you took initiative, motivated others, or led a group through a difficult task. What did you do and what did you achieve?",
    hint: "Demonstrate initiative, influence, accountability, and developing/empowering others.",
  },
  MANAGEMENT: {
    key: "MANAGEMENT",
    label: "Management Skills",
    prompt:
      "Describe a time you planned, organized, and managed resources, people, or a project to deliver results on time. How did you manage competing demands?",
    hint: "Show planning, organizing, resourcing, prioritization, and follow-through.",
  },
};

export const COMPETENCY_ORDER: CompetencyKey[] = [
  "SUBSTANTIVE_KNOWLEDGE",
  "INTELLECTUAL",
  "INTERPERSONAL",
  "COMMUNICATION",
  "LEADERSHIP",
  "MANAGEMENT",
];

export function competencyMeta(key: string): CompetencyMeta | undefined {
  return COMPETENCIES[key as CompetencyKey];
}

// ── STAR-L self-scoring rubric ───────────────────────────────────────────────

export interface RubricItem {
  id: string;
  text: string;
}
export interface RubricCategory {
  key: string;
  label: string;
  letter: string;
  description: string;
  items: RubricItem[];
}

export const STARL_RUBRIC: RubricCategory[] = [
  {
    key: "situation",
    label: "Situation",
    letter: "S",
    description: "Set the scene with concrete, relevant context.",
    items: [
      { id: "s1", text: "Establishes specific context (who, where, when)." },
      { id: "s2", text: "Conveys why the situation mattered or was challenging." },
      { id: "s3", text: "Concise — no unnecessary background." },
    ],
  },
  {
    key: "task",
    label: "Task",
    letter: "T",
    description: "Define your specific responsibility or objective.",
    items: [
      { id: "t1", text: "States your specific role and responsibility." },
      { id: "t2", text: "Makes the goal / success criteria clear." },
      { id: "t3", text: "Distinguishes your task from the team's." },
    ],
  },
  {
    key: "action",
    label: "Action",
    letter: "A",
    description: "Detail what YOU did — the heart of the narrative.",
    items: [
      { id: "a1", text: 'Uses "I" (not only "we") to show personal contribution.' },
      { id: "a2", text: "Describes concrete, sequenced steps you took." },
      { id: "a3", text: "Demonstrates the targeted competency explicitly." },
      { id: "a4", text: "Explains the reasoning behind key decisions." },
    ],
  },
  {
    key: "result",
    label: "Result",
    letter: "R",
    description: "Show the measurable impact of your actions.",
    items: [
      { id: "r1", text: "States a clear outcome tied to your actions." },
      { id: "r2", text: "Quantifies impact where possible (metrics, scale, time)." },
      { id: "r3", text: "Positive or recovered outcome is evident." },
    ],
  },
  {
    key: "learning",
    label: "Learning",
    letter: "L",
    description: "Reflect — what you learned and how you apply it.",
    items: [
      { id: "l1", text: "Articulates a specific lesson learned." },
      { id: "l2", text: "Connects the lesson to future / diplomatic context." },
      { id: "l3", text: "Shows growth or self-awareness." },
    ],
  },
];

export const STARL_TOTAL_ITEMS = STARL_RUBRIC.reduce(
  (n, c) => n + c.items.length,
  0,
);

/** Word-count guidance for narratives. */
export const NARRATIVE_MIN_WORDS = 150;
export const NARRATIVE_TARGET_WORDS = 300;
export const NARRATIVE_MAX_WORDS = 500;

// ── Test modes ───────────────────────────────────────────────────────────────

export type TestMode = "FULL_EXAM" | "SECTION" | "PRACTICE";

export const SESSION_STATUS = {
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
  EXPIRED: "EXPIRED",
  ABANDONED: "ABANDONED",
} as const;
