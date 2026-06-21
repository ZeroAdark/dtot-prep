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
