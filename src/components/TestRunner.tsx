"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Flag,
  ChevronLeft,
  ChevronRight,
  Clock,
  AlarmClock,
  Send,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TestResults } from "@/components/TestResults";
import { useCountdown } from "@/lib/useCountdown";
import { SECTIONS } from "@/lib/constants";
import { sectionStyle } from "@/lib/sectionStyle";
import { cn, formatClock } from "@/lib/utils";
import type { ClientSession, ClientSection } from "@/lib/types";

function timerTone(remaining: number | null, total: number): string {
  if (remaining == null) return "text-foreground";
  if (remaining <= 30) return "text-destructive animate-pulse-ring";
  if (remaining <= Math.max(60, total * 0.15)) return "text-warning";
  return "text-foreground";
}

type ConfirmConfig = {
  title: string;
  message: string;
  confirmLabel: string;
  variant: "default" | "destructive";
  action: () => Promise<void>;
};

export function TestRunner({ initial }: { initial: ClientSession }) {
  const router = useRouter();
  const [session, setSession] = useState<ClientSession>(initial);
  const [qIndex, setQIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [pendingConfirm, setPendingConfirm] = useState<ConfirmConfig | null>(null);
  const pendingSaves = useRef(0);

  const active: ClientSection | undefined = useMemo(
    () => session.sections.find((s) => s.status === "IN_PROGRESS"),
    [session],
  );

  // Persist the absolute deadline to localStorage as a resilience backup.
  useEffect(() => {
    try {
      localStorage.setItem(
        `dtot:timer:${session.id}`,
        JSON.stringify({
          startTime: session.startTime,
          deadlineAt: session.deadlineAt,
          sectionDeadline: active?.deadlineAt ?? null,
        }),
      );
    } catch {
      /* ignore */
    }
  }, [session.id, session.startTime, session.deadlineAt, active?.deadlineAt]);

  const refetch = useCallback(async () => {
    if (pendingSaves.current > 0) return;
    const res = await fetch(`/api/tests/${session.id}`, { cache: "no-store" });
    if (res.status === 401) {
      router.push("/");
      return;
    }
    if (!res.ok) return;
    const data = await res.json();
    if (data.session) setSession(data.session as ClientSession);
  }, [session.id, router]);

  // Reset question index when the active section changes.
  const activeKey = active?.section;
  useEffect(() => {
    setQIndex(0);
  }, [activeKey]);

  // Keep server timer enforcement in sync: poll + refetch on focus.
  useEffect(() => {
    if (session.finished) return;
    const id = setInterval(refetch, 20000);
    const onVis = () => document.visibilityState === "visible" && refetch();
    document.addEventListener("visibilitychange", onVis);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [session.finished, refetch]);

  const onExpire = useCallback(() => {
    // Give the server clock a beat to cross the deadline, then resync.
    setTimeout(refetch, 600);
  }, [refetch]);

  const globalRemaining = useCountdown(
    session.deadlineAt,
    onExpire,
    session.timed && !session.finished,
  );
  const sectionRemaining = useCountdown(
    active?.deadlineAt,
    onExpire,
    session.timed && !!active && !session.finished,
  );

  async function persist(
    questionId: string,
    patch: { selectedOptionId?: string | null; flagged?: boolean },
  ) {
    pendingSaves.current += 1;
    setSaving(true);
    try {
      await fetch("/api/responses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: session.id, questionId, ...patch }),
      });
    } catch {
      /* offline — optimistic value remains; will reconcile on next refetch */
    } finally {
      pendingSaves.current -= 1;
      if (pendingSaves.current <= 0) setSaving(false);
    }
  }

  function updateQuestion(
    questionId: string,
    patch: Partial<{ selectedOptionId: string | null; flagged: boolean }>,
  ) {
    setSession((prev) => ({
      ...prev,
      sections: prev.sections.map((s) =>
        s.section !== activeKey
          ? s
          : {
              ...s,
              questions: s.questions.map((q) =>
                q.questionId === questionId ? { ...q, ...patch } : q,
              ),
            },
      ),
    }));
  }

  function selectOption(questionId: string, optionId: string) {
    updateQuestion(questionId, { selectedOptionId: optionId });
    persist(questionId, { selectedOptionId: optionId });
  }

  function toggleFlag(questionId: string, current: boolean) {
    updateQuestion(questionId, { flagged: !current });
    persist(questionId, { flagged: !current });
  }

  async function patchSession(body: Record<string, unknown>) {
    const res = await fetch(`/api/tests/${session.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (data.session) setSession(data.session as ClientSession);
  }

  // Open an in-app confirmation dialog. (Replaces native confirm(), which mobile
  // browsers often suppress — there the action would silently never fire.)
  function submitSection() {
    if (!active) return;
    const section = active.section;
    const label = SECTIONS[section].label;
    const unanswered = active.questions.filter((q) => q.selectedOptionId == null).length;
    const idx = session.sections.findIndex((s) => s.section === section);
    const isLast = idx + 1 === session.sections.length;
    setPendingConfirm({
      title: `Submit ${label}?`,
      message:
        unanswered > 0
          ? `${unanswered} question(s) are unanswered and will be marked incorrect. You can't change answers after submitting.`
          : "You won't be able to change your answers after submitting.",
      confirmLabel: isLast ? "Submit & finish" : "Submit section",
      variant: "default",
      action: () => patchSession({ action: "submitSection", section }),
    });
  }

  function submitEntireTest() {
    setPendingConfirm({
      title: "End the entire test?",
      message: "All sections will be graded now and you won't be able to continue.",
      confirmLabel: "End test",
      variant: "destructive",
      action: () => patchSession({ action: "submit" }),
    });
  }

  async function runConfirm() {
    if (!pendingConfirm || submitting) return;
    setSubmitting(true);
    try {
      await pendingConfirm.action();
    } finally {
      setSubmitting(false);
      setPendingConfirm(null);
    }
  }

  if (session.finished) return <TestResults session={session} />;

  if (!active) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-20 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading the next section…</p>
        <Button variant="outline" onClick={refetch}>
          Refresh
        </Button>
      </div>
    );
  }

  const meta = SECTIONS[active.section];
  const style = sectionStyle(active.section);
  const q = active.questions[qIndex];
  const answeredCount = active.questions.filter((x) => x.selectedOptionId != null).length;
  const sectionIdx = session.sections.findIndex((s) => s.section === active.section);

  return (
    <div className="animate-fade-in">
      {/* Sticky exam bar */}
      <div className="sticky top-16 z-20 -mx-6 mb-6 border-b bg-card/95 px-6 py-3 backdrop-blur">
        <div className="container flex flex-wrap items-center justify-between gap-3 px-0">
          <div className="flex items-center gap-2">
            <span className={cn("flex h-8 w-8 items-center justify-center rounded-md text-xs font-bold text-white", style.dot)}>
              {meta.short}
            </span>
            <div>
              <div className="text-sm font-semibold leading-tight">{meta.label}</div>
              <div className="text-[11px] text-muted-foreground">
                Section {sectionIdx + 1} of {session.sections.length} · {answeredCount}/
                {active.questions.length} answered
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {session.timed && (
              <>
                <TimerPill
                  icon={<AlarmClock className="h-4 w-4" />}
                  label="Section"
                  value={sectionRemaining}
                  total={active.durationSec}
                />
                <TimerPill
                  icon={<Clock className="h-4 w-4" />}
                  label="Total"
                  value={globalRemaining}
                  total={session.totalDurationSec}
                />
              </>
            )}
            <div className="flex items-center gap-2">
              {saving && (
                <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  <Loader2 className="h-3 w-3 animate-spin" /> Saving
                </span>
              )}
              <Button size="sm" onClick={submitSection} disabled={submitting}>
                <Send className="h-4 w-4" />
                {sectionIdx + 1 === session.sections.length ? "Submit & finish" : "Submit section"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_260px]">
        {/* Question */}
        <div>
          <div className="rounded-lg border bg-card p-6">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-muted-foreground">
                Question {qIndex + 1} of {active.questions.length}
              </span>
              <Badge variant="secondary">{q.topic}</Badge>
              <Badge variant="muted">{q.difficulty.toLowerCase()}</Badge>
              <button
                onClick={() => toggleFlag(q.questionId, q.flagged)}
                className={cn(
                  "ml-auto flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                  q.flagged
                    ? "bg-warning/20 text-warning"
                    : "text-muted-foreground hover:bg-muted",
                )}
              >
                <Flag className="h-3.5 w-3.5" />
                {q.flagged ? "Flagged" : "Flag"}
              </button>
            </div>

            {q.scenario && (
              <p className="mb-4 rounded-md bg-muted/60 p-4 text-sm leading-relaxed text-foreground/90">
                {q.scenario}
              </p>
            )}

            <p className="text-lg font-medium leading-relaxed">{q.prompt}</p>

            <ul className="mt-5 space-y-2.5">
              {q.options.map((opt) => {
                const selected = q.selectedOptionId === opt.id;
                return (
                  <li key={opt.id}>
                    <button
                      onClick={() => selectOption(q.questionId, opt.id)}
                      className={cn(
                        "flex w-full items-start gap-3 rounded-lg border p-3.5 text-left text-sm transition-all",
                        selected
                          ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                          : "hover:border-primary/40 hover:bg-muted/40",
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-bold",
                          selected
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-muted-foreground/30",
                        )}
                      >
                        {opt.id}
                      </span>
                      <span className="pt-0.5">{opt.text}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Prev / next */}
          <div className="mt-4 flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => setQIndex((i) => Math.max(0, i - 1))}
              disabled={qIndex === 0}
            >
              <ChevronLeft className="h-4 w-4" /> Previous
            </Button>
            {qIndex + 1 < active.questions.length ? (
              <Button variant="outline" onClick={() => setQIndex((i) => i + 1)}>
                Next <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={submitSection} disabled={submitting}>
                <CheckCircle2 className="h-4 w-4" /> Review &amp; submit
              </Button>
            )}
          </div>
        </div>

        {/* Palette */}
        <aside className="space-y-4">
          <div className="rounded-lg border bg-card p-4">
            <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Question navigator
            </div>
            <div className="grid grid-cols-6 gap-2 lg:grid-cols-5">
              {active.questions.map((item, i) => {
                const isCurrent = i === qIndex;
                const answered = item.selectedOptionId != null;
                return (
                  <button
                    key={item.questionId}
                    onClick={() => setQIndex(i)}
                    className={cn(
                      "relative flex h-9 items-center justify-center rounded-md border text-sm font-medium transition-all",
                      isCurrent && "ring-2 ring-primary",
                      answered
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card hover:bg-muted",
                    )}
                  >
                    {i + 1}
                    {item.flagged && (
                      <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-warning" />
                    )}
                  </button>
                );
              })}
            </div>
            <div className="mt-4 space-y-1.5 text-xs text-muted-foreground">
              <Legend className="border-primary bg-primary" label="Answered" />
              <Legend className="border-border bg-card" label="Unanswered" />
              <Legend className="border-warning bg-warning" label="Flagged (corner)" />
            </div>
          </div>

          <Button
            variant="ghost"
            className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={submitEntireTest}
            disabled={submitting}
          >
            End entire test
          </Button>
        </aside>
      </div>

      {pendingConfirm && (
        <ConfirmDialog
          title={pendingConfirm.title}
          message={pendingConfirm.message}
          confirmLabel={pendingConfirm.confirmLabel}
          variant={pendingConfirm.variant}
          busy={submitting}
          onConfirm={runConfirm}
          onCancel={() => {
            if (!submitting) setPendingConfirm(null);
          }}
        />
      )}
    </div>
  );
}

function TimerPill({
  icon,
  label,
  value,
  total,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | null;
  total: number;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-muted-foreground">{icon}</span>
      <div className="leading-none">
        <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
          {label}
        </div>
        <div className={cn("tabular text-lg font-bold", timerTone(value, total))}>
          {value == null ? "—" : formatClock(value)}
        </div>
      </div>
    </div>
  );
}

function Legend({ className, label }: { className: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className={cn("h-3.5 w-3.5 rounded border", className)} />
      {label}
    </div>
  );
}

// Mobile-safe confirmation dialog: a bottom sheet on phones, centered on larger
// screens. Renders above everything (z-50), dims + blocks the page behind it,
// and supports click-away + Escape to cancel.
function ConfirmDialog({
  title,
  message,
  confirmLabel,
  variant,
  busy,
  onConfirm,
  onCancel,
}: {
  title: string;
  message: string;
  confirmLabel: string;
  variant: "default" | "destructive";
  busy: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onCancel]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 backdrop-blur-sm sm:items-center"
    >
      {/* click-away backdrop */}
      <button
        type="button"
        aria-hidden="true"
        tabIndex={-1}
        onClick={onCancel}
        className="absolute inset-0 cursor-default"
      />
      <div className="relative w-full max-w-sm rounded-xl border bg-card p-6 shadow-xl">
        <h2 className="text-base font-semibold">{title}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{message}</p>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="ghost" onClick={onCancel} disabled={busy}>
            Cancel
          </Button>
          <Button variant={variant} onClick={onConfirm} disabled={busy} autoFocus>
            {busy ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Working…
              </>
            ) : (
              confirmLabel
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
