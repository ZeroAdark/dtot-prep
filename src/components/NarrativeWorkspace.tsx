"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  FileText,
  CheckCircle2,
  Circle,
  Lightbulb,
  Save,
  Loader2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  COMPETENCIES,
  COMPETENCY_ORDER,
  CompetencyKey,
  STARL_RUBRIC,
  STARL_TOTAL_ITEMS,
  NARRATIVE_MIN_WORDS,
  NARRATIVE_TARGET_WORDS,
} from "@/lib/constants";
import { scoreRubric, RubricState } from "@/lib/grading";
import { cn, countWords } from "@/lib/utils";
import { fromJson } from "@/lib/serialize";

interface InitialNarrative {
  competency: string;
  content: string;
  rubric: string;
  status: string;
}
interface Draft {
  content: string;
  rubric: RubricState;
  status: string;
}

const LEVEL_VARIANT: Record<string, "success" | "warning" | "destructive" | "default"> = {
  Exemplary: "success",
  Strong: "success",
  Developing: "warning",
  "Needs work": "destructive",
};

export function NarrativeWorkspace({ initial }: { initial: InitialNarrative[] }) {
  const buildInitial = (): Record<CompetencyKey, Draft> => {
    const map = {} as Record<CompetencyKey, Draft>;
    for (const key of COMPETENCY_ORDER) {
      const found = initial.find((n) => n.competency === key);
      map[key] = {
        content: found?.content ?? "",
        rubric: found ? fromJson<RubricState>(found.rubric, {}) : {},
        status: found?.status ?? "DRAFT",
      };
    }
    return map;
  };

  const [drafts, setDrafts] = useState<Record<CompetencyKey, Draft>>(buildInitial);
  const [active, setActive] = useState<CompetencyKey>(COMPETENCY_ORDER[0]);
  const [saving, setSaving] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const firstRun = useRef(true);

  const draft = drafts[active];
  const meta = COMPETENCIES[active];
  const scored = useMemo(() => scoreRubric(draft.rubric), [draft.rubric]);
  const words = countWords(draft.content);

  async function save(comp: CompetencyKey, d: Draft, flash = false) {
    setSaving(true);
    try {
      await fetch("/api/narratives", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          competency: comp,
          content: d.content,
          rubric: d.rubric,
          status: d.status,
        }),
      });
      if (flash) {
        setSavedFlash(true);
        setTimeout(() => setSavedFlash(false), 1500);
      }
    } finally {
      setSaving(false);
    }
  }

  // Debounced autosave on content/rubric/status change for the active draft.
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => save(active, drafts[active]), 900);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft.content, JSON.stringify(draft.rubric), draft.status, active]);

  function setContent(content: string) {
    setDrafts((d) => ({ ...d, [active]: { ...d[active], content } }));
  }
  function toggleItem(id: string) {
    setDrafts((d) => ({
      ...d,
      [active]: {
        ...d[active],
        rubric: { ...d[active].rubric, [id]: !d[active].rubric[id] },
      },
    }));
  }
  function markComplete() {
    const next = { ...draft, status: draft.status === "COMPLETE" ? "DRAFT" : "COMPLETE" };
    setDrafts((d) => ({ ...d, [active]: next }));
    save(active, next, true);
  }

  const completeCount = COMPETENCY_ORDER.filter(
    (k) => drafts[k].status === "COMPLETE",
  ).length;

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold">
            <FileText className="h-7 w-7 text-primary" /> Personal Narratives
          </h1>
          <p className="mt-1 max-w-2xl text-muted-foreground">
            Draft the six required essays using the{" "}
            <span className="font-medium text-foreground">STAR-L</span> framework
            — Situation, Task, Action, Result, Learning — and self-score each
            against the rubric.
          </p>
        </div>
        <Badge variant={completeCount === 6 ? "success" : "secondary"} className="text-sm">
          {completeCount}/6 marked complete
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        {/* Competency list */}
        <aside className="space-y-1.5">
          {COMPETENCY_ORDER.map((key) => {
            const c = COMPETENCIES[key];
            const d = drafts[key];
            const s = scoreRubric(d.rubric);
            const isActive = key === active;
            const complete = d.status === "COMPLETE";
            return (
              <button
                key={key}
                onClick={() => setActive(key)}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-md border p-2.5 text-left transition-colors",
                  isActive
                    ? "border-primary bg-primary/5"
                    : "border-transparent hover:bg-muted",
                )}
              >
                {complete ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
                ) : (
                  <Circle className="h-4 w-4 shrink-0 text-muted-foreground/40" />
                )}
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{c.label}</span>
                  <span className="block text-[11px] text-muted-foreground">
                    {s.score}/{STARL_TOTAL_ITEMS} rubric · {countWords(d.content)} words
                  </span>
                </span>
              </button>
            );
          })}
        </aside>

        {/* Editor + rubric */}
        <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
          <div className="space-y-4">
            <Card>
              <CardContent className="p-5">
                <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-primary">
                  Prompt
                </div>
                <p className="font-medium">{meta.prompt}</p>
                <p className="mt-2 flex items-start gap-1.5 text-sm text-muted-foreground">
                  <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
                  {meta.hint}
                </p>
              </CardContent>
            </Card>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-sm font-medium">Your narrative</label>
                <div className="flex items-center gap-3 text-xs">
                  {saving ? (
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Loader2 className="h-3 w-3 animate-spin" /> Saving…
                    </span>
                  ) : savedFlash ? (
                    <span className="flex items-center gap-1 text-success">
                      <CheckCircle2 className="h-3 w-3" /> Saved
                    </span>
                  ) : null}
                  <span
                    className={cn(
                      "tabular",
                      words < NARRATIVE_MIN_WORDS
                        ? "text-muted-foreground"
                        : words <= NARRATIVE_TARGET_WORDS + 120
                          ? "text-success"
                          : "text-warning",
                    )}
                  >
                    {words} words
                  </span>
                </div>
              </div>
              <textarea
                value={draft.content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Open with the Situation, define your Task, detail the Actions you took, quantify the Result, and close with what you Learned…"
                className="prose-editor h-[420px] w-full resize-y rounded-lg border border-input bg-card p-4 text-sm leading-relaxed focus-visible:ring-2 focus-visible:ring-ring"
              />
              <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  Target ~{NARRATIVE_TARGET_WORDS} words (min {NARRATIVE_MIN_WORDS}).
                </span>
                <Button
                  size="sm"
                  variant={draft.status === "COMPLETE" ? "success" : "outline"}
                  onClick={markComplete}
                >
                  <Save className="h-4 w-4" />
                  {draft.status === "COMPLETE" ? "Marked complete" : "Mark complete"}
                </Button>
              </div>
            </div>
          </div>

          {/* STAR-L rubric */}
          <aside>
            <Card className="sticky top-24">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">STAR-L self-score</h3>
                  <Badge variant={LEVEL_VARIANT[scored.level]}>{scored.level}</Badge>
                </div>
                <div className="mt-3 flex items-end justify-between">
                  <span className="text-3xl font-bold tabular">
                    {scored.score}
                    <span className="text-base text-muted-foreground">
                      /{STARL_TOTAL_ITEMS}
                    </span>
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {Math.round(scored.percent)}%
                  </span>
                </div>
                <Progress value={scored.percent} className="mt-2" />

                <div className="mt-4 space-y-4">
                  {STARL_RUBRIC.map((cat) => {
                    const catScore = scored.byCategory.find((c) => c.key === cat.key);
                    return (
                      <div key={cat.key}>
                        <div className="mb-1.5 flex items-center gap-2">
                          <span className="flex h-5 w-5 items-center justify-center rounded bg-primary/10 text-[11px] font-bold text-primary">
                            {cat.letter}
                          </span>
                          <span className="text-sm font-medium">{cat.label}</span>
                          <span className="ml-auto text-[11px] text-muted-foreground">
                            {catScore?.got}/{catScore?.max}
                          </span>
                        </div>
                        <ul className="space-y-1">
                          {cat.items.map((it) => {
                            const checked = !!draft.rubric[it.id];
                            return (
                              <li key={it.id}>
                                <label className="flex cursor-pointer items-start gap-2 rounded p-1 text-xs hover:bg-muted">
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={() => toggleItem(it.id)}
                                    className="mt-0.5 h-3.5 w-3.5 shrink-0 accent-[hsl(var(--primary))]"
                                  />
                                  <span className={cn(checked && "text-foreground", !checked && "text-muted-foreground")}>
                                    {it.text}
                                  </span>
                                </label>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
}
