import { SectionKey } from "./constants";

export interface ClientOption {
  id: string;
  text: string;
}

export interface ClientQuestionItem {
  questionId: string;
  topic: string;
  difficulty: string;
  prompt: string;
  scenario: string | null;
  options: ClientOption[];
  diagram: string | null; // optional schematic-diagram slug shown with the question
  selectedOptionId: string | null;
  flagged: boolean;
  // Revealed only after the section/session closes:
  correctId: string | null;
  rationale: string | null;
  optionNotes: Record<string, string> | null;
  reference: string | null;
  isCorrect: boolean | null;
}

export interface ClientSection {
  section: SectionKey;
  status: "NOT_STARTED" | "IN_PROGRESS" | "LOCKED" | "SUBMITTED";
  durationSec: number;
  startedAt: string | null;
  deadlineAt: string | null;
  submittedAt: string | null;
  correctCount: number;
  totalCount: number;
  scorePct: number | null;
  reveal: boolean;
  questions: ClientQuestionItem[];
}

// ── Study hub ────────────────────────────────────────────────────────────────
export interface StudyFlashcard {
  front: string;
  back: string;
}

export interface StudyGuideData {
  id: string;
  section: SectionKey;
  topic: string;
  title: string;
  summary: string;
  content: string;
  keyPoints: string[];
  flashcards: StudyFlashcard[];
  diagrams: string[]; // interactive-diagram slugs
  drills: string[]; // matching-drill slugs
  studied: boolean;
}

/** A quick-check question served in study mode (answer revealed on selection). */
export interface StudyQuizItem {
  id: string;
  topic: string;
  difficulty: string;
  prompt: string;
  scenario: string | null;
  diagram: string | null;
  options: ClientOption[];
  correctId: string;
  rationale: string;
  optionNotes: Record<string, string> | null;
  reference: string | null;
}

export interface ClientSession {
  id: string;
  mode: string;
  status: "IN_PROGRESS" | "COMPLETED" | "EXPIRED" | "ABANDONED";
  timed: boolean;
  startTime: string;
  deadlineAt: string;
  totalDurationSec: number;
  currentSection: string | null;
  score: number | null;
  correctCount: number;
  totalCount: number;
  completedAt: string | null;
  finished: boolean;
  sections: ClientSection[];
}
