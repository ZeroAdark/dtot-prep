"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Timer,
  Layers,
  GraduationCap,
  PlayCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  SECTIONS,
  SECTION_ORDER,
  SectionKey,
  TestMode,
  sectionDurationSec,
} from "@/lib/constants";
import { sectionStyle } from "@/lib/sectionStyle";
import { cn, formatDuration, formatDate } from "@/lib/utils";

type Length = "QUICK" | "HALF" | "FULL";

const MODES: { key: TestMode; title: string; desc: string; icon: typeof Timer }[] = [
  { key: "FULL_EXAM", title: "Full mock exam", desc: "All sections, strict global + section timers.", icon: Layers },
  { key: "SECTION", title: "Single section", desc: "Focus on one section under its own timer.", icon: Timer },
  { key: "PRACTICE", title: "Untimed practice", desc: "No clock — review answers as you go.", icon: GraduationCap },
];

export function TestSetup({
  counts,
  presetSection,
  resumable,
}: {
  counts: Record<SectionKey, number>;
  presetSection: SectionKey | null;
  resumable: {
    id: string;
    mode: string;
    sections: string;
    createdAt: string;
    totalCount: number;
  }[];
}) {
  const router = useRouter();
  const [mode, setMode] = useState<TestMode>(presetSection ? "SECTION" : "FULL_EXAM");
  const [length, setLength] = useState<Length>("FULL");
  const [selected, setSelected] = useState<SectionKey[]>(
    presetSection ? [presetSection] : [...SECTION_ORDER],
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const effectiveSections = useMemo<SectionKey[]>(() => {
    if (mode === "FULL_EXAM") return [...SECTION_ORDER];
    return selected;
  }, [mode, selected]);

  function countFor(section: SectionKey): number {
    const avail = counts[section] ?? 0;
    const official = SECTIONS[section].examQuestions;
    if (length === "QUICK") return Math.min(10, avail);
    if (length === "HALF") return Math.min(Math.round(official / 2), avail);
    return Math.min(official, avail); // FULL — official DTOT length
  }

  const plan = effectiveSections.map((s) => ({
    section: s,
    count: countFor(s),
  }));
  const totalQuestions = plan.reduce((n, p) => n + p.count, 0);
  const timed = mode !== "PRACTICE";
  const totalSeconds = plan.reduce(
    (n, p) => n + sectionDurationSec(p.section, p.count),
    0,
  );

  function toggleSection(s: SectionKey) {
    if (mode === "SECTION") {
      setSelected([s]);
    } else {
      setSelected((cur) =>
        cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s],
      );
    }
  }

  function chooseMode(m: TestMode) {
    setMode(m);
    if (m === "FULL_EXAM") setSelected([...SECTION_ORDER]);
    else if (m === "SECTION")
      setSelected((cur) => [cur[0] ?? presetSection ?? SECTION_ORDER[0]]);
  }

  async function start() {
    if (effectiveSections.length === 0) {
      setError("Select at least one section.");
      return;
    }
    if (totalQuestions === 0) {
      setError("No questions available for this selection.");
      return;
    }
    setLoading(true);
    setError(null);
    const countPerSection = Object.fromEntries(plan.map((p) => [p.section, p.count]));
    const res = await fetch("/api/tests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode, sections: effectiveSections, countPerSection }),
    });
    if (res.status === 401) {
      router.push("/");
      return;
    }
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Could not start the test.");
      setLoading(false);
      return;
    }
    router.push(`/test/${data.id}`);
  }

  return (
    <div className="mx-auto max-w-3xl animate-fade-in space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Start a practice test</h1>
        <p className="mt-1 text-muted-foreground">
          Configure your session. Timed modes mirror real testing conditions —
          the clock keeps running even if you refresh or close the tab.
        </p>
        <p className="mt-2 rounded-md bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
          <span className="font-medium text-foreground">Real DTOT format:</span>{" "}
          Job Knowledge 60 Q / 40 min · Situational Judgment 28 Q / 42 min ·
          English Expression 65 Q / 50 min. Choose <em>Full exam</em> below to
          practice at the official length.
        </p>
      </div>

      {resumable.length > 0 && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-primary">
              <Clock className="h-4 w-4" /> Resume an unfinished test
            </div>
            <div className="space-y-2">
              {resumable.map((r) => (
                <Link
                  key={r.id}
                  href={`/test/${r.id}`}
                  className="flex items-center justify-between rounded-md bg-card px-3 py-2 text-sm transition-colors hover:bg-muted"
                >
                  <span>
                    {r.mode === "FULL_EXAM"
                      ? "Full mock exam"
                      : r.mode === "SECTION"
                        ? "Single-section test"
                        : "Practice set"}{" "}
                    · {r.totalCount} questions
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(r.createdAt)} →
                  </span>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mode */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          1 · Choose a mode
        </h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {MODES.map((m) => {
            const Icon = m.icon;
            const active = mode === m.key;
            return (
              <button
                key={m.key}
                onClick={() => chooseMode(m.key)}
                className={cn(
                  "rounded-lg border p-4 text-left transition-all",
                  active
                    ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                    : "hover:border-primary/40 hover:bg-muted/40",
                )}
              >
                <Icon className={cn("h-5 w-5", active ? "text-primary" : "text-muted-foreground")} />
                <div className="mt-2 font-medium">{m.title}</div>
                <div className="mt-0.5 text-xs text-muted-foreground">{m.desc}</div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Sections */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          2 · {mode === "SECTION" ? "Pick a section" : "Sections included"}
        </h2>
        <div className="space-y-2">
          {SECTION_ORDER.map((s) => {
            const meta = SECTIONS[s];
            const style = sectionStyle(s);
            const on = effectiveSections.includes(s);
            const disabled = mode === "FULL_EXAM";
            return (
              <button
                key={s}
                onClick={() => !disabled && toggleSection(s)}
                disabled={disabled}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-all",
                  on ? cn("ring-2", style.ring, style.border) : "hover:bg-muted/40",
                  disabled && "cursor-default opacity-100",
                )}
              >
                <span className={cn("flex h-9 w-9 items-center justify-center rounded-md text-xs font-bold text-white", style.dot)}>
                  {meta.short}
                </span>
                <span className="flex-1">
                  <span className="block font-medium">{meta.label}</span>
                  <span className="block text-xs text-muted-foreground">
                    {counts[s]} questions available
                  </span>
                </span>
                <span
                  className={cn(
                    "flex h-5 w-5 items-center justify-center rounded-full border-2",
                    on ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/30",
                  )}
                >
                  {on && <span className="text-[10px]">✓</span>}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Length */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          3 · Length
        </h2>
        <div className="grid grid-cols-3 gap-3">
          {([
            { k: "QUICK", t: "Quick", d: "10 / section" },
            { k: "HALF", t: "Half-length", d: "≈½ official" },
            { k: "FULL", t: "Full exam", d: "official DTOT length" },
          ] as { k: Length; t: string; d: string }[]).map((o) => (
            <button
              key={o.k}
              onClick={() => setLength(o.k)}
              className={cn(
                "rounded-lg border p-3 text-center transition-all",
                length === o.k
                  ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                  : "hover:bg-muted/40",
              )}
            >
              <div className="font-medium">{o.t}</div>
              <div className="text-xs text-muted-foreground">{o.d}</div>
            </button>
          ))}
        </div>
      </section>

      {/* Summary + start */}
      <Card>
        <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
            <div>
              <span className="text-muted-foreground">Questions</span>
              <div className="text-xl font-bold tabular">{totalQuestions}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Time limit</span>
              <div className="text-xl font-bold tabular">
                {timed ? formatDuration(totalSeconds) : "Untimed"}
              </div>
            </div>
            <div className="flex flex-wrap gap-1">
              {plan.map((p) => (
                <Badge key={p.section} variant="secondary">
                  {SECTIONS[p.section].short} ×{p.count}
                </Badge>
              ))}
            </div>
          </div>
          <Button size="lg" onClick={start} disabled={loading || totalQuestions === 0}>
            <PlayCircle className="h-5 w-5" />
            {loading ? "Preparing…" : "Begin test"}
          </Button>
        </CardContent>
      </Card>

      {error && (
        <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" /> {error}
        </div>
      )}

      {timed && (
        <p className="flex items-start gap-2 text-xs text-muted-foreground">
          <Timer className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          Sections run in order, each with its own countdown. When a section&apos;s
          time runs out it locks and auto-submits; when the global timer ends the
          whole exam submits automatically.
        </p>
      )}
    </div>
  );
}
