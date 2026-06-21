import { SectionKey } from "./constants";

export interface SectionStyle {
  dot: string;
  text: string;
  soft: string; // soft background
  bar: string; // progress indicator
  border: string;
  ring: string;
}

export const SECTION_STYLES: Record<SectionKey, SectionStyle> = {
  JOB_KNOWLEDGE: {
    dot: "bg-sky-500",
    text: "text-sky-700",
    soft: "bg-sky-50",
    bar: "bg-sky-500",
    border: "border-sky-200",
    ring: "ring-sky-200",
  },
  SITUATIONAL_JUDGMENT: {
    dot: "bg-violet-500",
    text: "text-violet-700",
    soft: "bg-violet-50",
    bar: "bg-violet-500",
    border: "border-violet-200",
    ring: "ring-violet-200",
  },
  ENGLISH_EXPRESSION: {
    dot: "bg-emerald-500",
    text: "text-emerald-700",
    soft: "bg-emerald-50",
    bar: "bg-emerald-500",
    border: "border-emerald-200",
    ring: "ring-emerald-200",
  },
};

export function sectionStyle(key: string): SectionStyle {
  return SECTION_STYLES[key as SectionKey] ?? SECTION_STYLES.JOB_KNOWLEDGE;
}
