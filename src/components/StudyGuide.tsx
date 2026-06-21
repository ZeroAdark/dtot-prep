"use client";

import { useState } from "react";
import {
  BookOpen,
  Layers,
  ListChecks,
  PencilLine,
  CheckCircle2,
  Circle,
  Loader2,
  ChevronRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { sectionStyle } from "@/lib/sectionStyle";
import { Flashcards } from "@/components/Flashcards";
import { StudyQuickCheck } from "@/components/StudyQuickCheck";
import type { StudyGuideData } from "@/lib/types";

type Tab = "read" | "cards" | "quiz";

export function StudyGuide({
  guide,
  defaultOpen = false,
  onStudiedChange,
}: {
  guide: StudyGuideData;
  defaultOpen?: boolean;
  onStudiedChange?: (studied: boolean) => void;
}) {
  const style = sectionStyle(guide.section);
  const [open, setOpen] = useState(defaultOpen);
  const [tab, setTab] = useState<Tab>("read");
  // Lazily mount (and keep mounted) the flashcards/quiz once first opened so
  // their state and the quiz fetch survive tab switches.
  const [seen, setSeen] = useState<Record<Tab, boolean>>({
    read: true,
    cards: false,
    quiz: false,
  });
  const [studied, setStudied] = useState(guide.studied);
  const [saving, setSaving] = useState(false);

  const selectTab = (t: Tab) => {
    setTab(t);
    setSeen((s) => (s[t] ? s : { ...s, [t]: true }));
  };

  const toggleStudied = async () => {
    const next = !studied;
    setStudied(next);
    setSaving(true);
    try {
      const res = await fetch("/api/study/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ materialId: guide.id, studied: next }),
      });
      if (!res.ok) throw new Error();
      onStudiedChange?.(next);
    } catch {
      setStudied(!next); // revert on failure
    } finally {
      setSaving(false);
    }
  };

  const tabs: { key: Tab; label: string; icon: typeof BookOpen; count?: number }[] =
    [
      { key: "read", label: "Read", icon: BookOpen },
      { key: "cards", label: "Flashcards", icon: Layers, count: guide.flashcards.length },
      { key: "quiz", label: "Quick check", icon: PencilLine },
    ];

  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border bg-card transition-colors",
        studied ? style.border : "border-border",
      )}
    >
      {/* Header / toggle */}
      <div className="flex items-center gap-3 p-5">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex flex-1 items-center gap-3 text-left"
          aria-expanded={open}
        >
          <ChevronRight
            className={cn(
              "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
              open && "rotate-90",
            )}
          />
          <span>
            <span className="flex items-center gap-2 font-semibold">
              {guide.title}
              {studied && (
                <CheckCircle2 className={cn("h-4 w-4", style.text)} />
              )}
            </span>
            <span className="block text-sm text-muted-foreground">
              {guide.summary}
            </span>
          </span>
        </button>
        <Badge variant="secondary" className="hidden sm:inline-flex">
          {guide.topic}
        </Badge>
      </div>

      {open && (
        <div className="border-t">
          {/* Tab bar + studied toggle */}
          <div className="flex flex-wrap items-center gap-1 border-b bg-muted/30 px-3 py-2">
            {tabs.map((t) => {
              const Icon = t.icon;
              const active = tab === t.key;
              return (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => selectTab(t.key)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                    active
                      ? cn("bg-card shadow-sm", style.text)
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {t.label}
                  {t.count != null && (
                    <span className="text-xs text-muted-foreground">
                      ({t.count})
                    </span>
                  )}
                </button>
              );
            })}

            <button
              type="button"
              onClick={toggleStudied}
              disabled={saving}
              className={cn(
                "ml-auto inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                studied
                  ? cn(style.soft, style.text)
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : studied ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <Circle className="h-4 w-4" />
              )}
              {studied ? "Studied" : "Mark as studied"}
            </button>
          </div>

          {/* Tab panels */}
          <div className="p-5">
            <div className={cn(tab !== "read" && "hidden")}>
              <div className="whitespace-pre-line text-sm leading-relaxed text-foreground/90">
                {guide.content}
              </div>
              {guide.keyPoints.length > 0 && (
                <div className={cn("mt-4 rounded-md p-4", style.soft)}>
                  <div className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
                    <ListChecks className={cn("h-4 w-4", style.text)} /> Key
                    takeaways
                  </div>
                  <ul className="space-y-1.5 text-sm">
                    {guide.keyPoints.map((kp, k) => (
                      <li key={k} className="flex gap-2">
                        <span
                          className={cn(
                            "mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full",
                            style.dot,
                          )}
                        />
                        <span>{kp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {seen.cards && (
              <div className={cn(tab !== "cards" && "hidden")}>
                <Flashcards cards={guide.flashcards} style={style} />
              </div>
            )}

            {seen.quiz && (
              <div className={cn(tab !== "quiz" && "hidden")}>
                <StudyQuickCheck materialId={guide.id} style={style} />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
