"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Timer,
  CheckCircle2,
  FileText,
  Trash2,
  ArrowRight,
  Loader2,
  UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { ProfileSummary } from "@/lib/auth";

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const letters = parts.slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "");
  return letters.join("") || "?";
}

// Deterministic date (fixed locale + UTC) so server and client render identically.
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function Welcome({ profiles = [] }: { profiles?: ProfileSummary[] }) {
  const router = useRouter();
  const hasProfiles = profiles.length > 0;

  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  // Per-profile in-flight action (login or delete); blocks other actions.
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  // When profiles exist, the create form is revealed on demand.
  const [showCreate, setShowCreate] = useState(!hasProfiles);

  const anyBusy = creating || busyId !== null;
  // Always show the create form when there are no profiles (e.g. after the last
  // one is deleted), regardless of the persisted toggle state.
  const createOpen = showCreate || !hasProfiles;

  // Move focus into the name field when the create form is revealed on demand
  // (autoFocus only fires for the zero-profiles case that mounts immediately).
  const nameRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (showCreate && hasProfiles) nameRef.current?.focus();
  }, [showCreate, hasProfiles]);

  async function createProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter a name to create a profile.");
      return;
    }
    setCreating(true);
    setError(null);
    try {
      const res = await fetch("/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error();
      router.refresh();
    } catch {
      setError("Could not create the profile. Please try again.");
      setCreating(false);
    }
  }

  async function loginExisting(id: string) {
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch("/api/session", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: id }),
      });
      if (!res.ok) throw new Error();
      router.refresh();
    } catch {
      setError("Could not sign in to that profile. It may have been deleted.");
      setBusyId(null);
      router.refresh();
    }
  }

  async function deleteProfile(id: string) {
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch(`/api/profiles/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
    } catch {
      setError("Could not delete that profile. Please try again.");
    } finally {
      setBusyId(null);
      setConfirmId(null);
      router.refresh();
    }
  }

  const features = [
    { icon: Timer, title: "Strict timed engine", desc: "Global + per-section countdowns that lock and force-submit — and survive a refresh." },
    { icon: CheckCircle2, title: "Instant auto-grading", desc: "Job Knowledge, Situational Judgment & English Expression graded with full rationale." },
    { icon: FileText, title: "STAR-L narratives", desc: "Draft the six required essays with a self-scoring STAR-L rubric." },
  ];

  return (
    <div className="mx-auto max-w-5xl animate-fade-in">
      <div className="grid items-center gap-10 md:grid-cols-2">
        <div>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <ShieldCheck className="h-3.5 w-3.5" />
            Exam-realistic practice
          </div>
          <h1 className="text-4xl font-bold tracking-tight">
            Prepare for the Diplomatic Technology Officer Test
          </h1>
          <p className="mt-4 text-muted-foreground">
            A focused study &amp; practice environment covering all four DTOT
            components — Job Knowledge, Situational Judgment, English Expression,
            and the Personal Narratives — with timed mock exams, instant grading,
            and a readiness dashboard.
          </p>

          <ul className="mt-8 space-y-4">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <li key={f.title} className="flex gap-3">
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <div className="font-medium">{f.title}</div>
                    <div className="text-sm text-muted-foreground">{f.desc}</div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <Card className="shadow-md">
          <CardContent className="p-8">
            <h2 className="text-xl font-semibold">
              {hasProfiles ? "Choose a profile" : "Get started"}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {hasProfiles
                ? "Pick a saved candidate profile to continue — or create a new one. No password required."
                : "Enter a name to create your local candidate profile. Your progress, scores, and drafts are saved automatically."}
            </p>

            {hasProfiles && (
              <ul className="mt-5 max-h-[340px] space-y-2 overflow-y-auto pr-1">
                {profiles.map((p) => {
                  const isBusy = busyId === p.id;
                  if (confirmId === p.id) {
                    return (
                      <li
                        key={p.id}
                        className="rounded-lg border border-destructive/40 bg-destructive/5 p-3"
                      >
                        <div className="text-sm font-medium text-destructive">
                          Delete “{p.name}”?
                        </div>
                        <div className="mt-0.5 text-xs text-muted-foreground">
                          This permanently erases this profile and all of its
                          tests, answers, and narratives.
                        </div>
                        <div className="mt-3 flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setConfirmId(null)}
                            disabled={anyBusy}
                          >
                            Cancel
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteProfile(p.id)}
                            disabled={anyBusy}
                          >
                            {isBusy ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" /> Deleting…
                              </>
                            ) : (
                              <>
                                <Trash2 className="h-4 w-4" /> Delete
                              </>
                            )}
                          </Button>
                        </div>
                      </li>
                    );
                  }
                  return (
                    <li
                      key={p.id}
                      className="flex items-center gap-1 rounded-lg border transition-colors hover:border-primary/40"
                    >
                      <button
                        type="button"
                        onClick={() => loginExisting(p.id)}
                        disabled={anyBusy}
                        className="flex flex-1 items-center gap-3 rounded-l-lg p-3 text-left disabled:opacity-60"
                      >
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                          {initials(p.name)}
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate font-medium">
                            {p.name}
                          </span>
                          <span className="block truncate text-xs text-muted-foreground">
                            {p.tests} {p.tests === 1 ? "test" : "tests"} ·{" "}
                            {p.answered} answered · {fmtDate(p.createdAt)}
                          </span>
                        </span>
                        <span className="ml-auto shrink-0 pl-2 text-xs font-medium text-primary">
                          {isBusy ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <ArrowRight className="h-4 w-4" />
                          )}
                        </span>
                      </button>
                      <button
                        type="button"
                        title={`Delete ${p.name}`}
                        aria-label={`Delete ${p.name}`}
                        onClick={() => setConfirmId(p.id)}
                        disabled={anyBusy}
                        className="mr-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-40"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}

            {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

            {hasProfiles && !showCreate && (
              <button
                type="button"
                onClick={() => setShowCreate(true)}
                disabled={anyBusy}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md border border-dashed border-input py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground disabled:opacity-60"
              >
                <UserPlus className="h-4 w-4" /> Create a new profile
              </button>
            )}

            {createOpen && (
              <form onSubmit={createProfile} className={hasProfiles ? "mt-5 space-y-3 border-t pt-5" : "mt-6 space-y-4"}>
                {hasProfiles && (
                  <label htmlFor="name" className="block text-sm font-medium">
                    Create a new profile
                  </label>
                )}
                {!hasProfiles && (
                  <label htmlFor="name" className="mb-1.5 block text-sm font-medium">
                    Your name
                  </label>
                )}
                <input
                  id="name"
                  ref={nameRef}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Jordan Alvarez"
                  disabled={anyBusy}
                  className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
                  autoFocus={!hasProfiles}
                />
                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={anyBusy}
                >
                  {creating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Creating…
                    </>
                  ) : hasProfiles ? (
                    <>
                      <UserPlus className="h-4 w-4" /> Create &amp; sign in
                    </>
                  ) : (
                    "Start preparing"
                  )}
                </Button>
              </form>
            )}

            <p className="mt-4 text-center text-xs text-muted-foreground">
              No password required — these are local practice profiles on this
              device.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
