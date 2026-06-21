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
