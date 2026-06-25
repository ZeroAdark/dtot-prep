import { SectionKey } from "./constants";

export interface SectionStyle {
  dot: string;
  text: string;
  soft: string; // soft background
  bar: string; // progress indicator
  border: string;
  ring: string;
}

// Each style carries a dark: variant so section-tinted surfaces (esp. the soft
// backgrounds and colored text) stay readable in dark mode.
export const SECTION_STYLES: Record<SectionKey, SectionStyle> = {
  JOB_KNOWLEDGE: {
    dot: "bg-sky-500",
    text: "text-sky-700 dark:text-sky-300",
    soft: "bg-sky-50 dark:bg-sky-500/10",
    bar: "bg-sky-500",
    border: "border-sky-200 dark:border-sky-500/30",
    ring: "ring-sky-200 dark:ring-sky-500/40",
  },
  SITUATIONAL_JUDGMENT: {
    dot: "bg-violet-500",
    text: "text-violet-700 dark:text-violet-300",
    soft: "bg-violet-50 dark:bg-violet-500/10",
    bar: "bg-violet-500",
    border: "border-violet-200 dark:border-violet-500/30",
    ring: "ring-violet-200 dark:ring-violet-500/40",
  },
  ENGLISH_EXPRESSION: {
    dot: "bg-emerald-500",
    text: "text-emerald-700 dark:text-emerald-300",
    soft: "bg-emerald-50 dark:bg-emerald-500/10",
    bar: "bg-emerald-500",
    border: "border-emerald-200 dark:border-emerald-500/30",
    ring: "ring-emerald-200 dark:ring-emerald-500/40",
  },
};

export function sectionStyle(key: string): SectionStyle {
  return SECTION_STYLES[key as SectionKey] ?? SECTION_STYLES.JOB_KNOWLEDGE;
}
