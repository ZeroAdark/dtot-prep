"use client";

import { useState, useEffect } from "react";
import {
  ShieldCheck,
  Timer,
  CheckCircle2,
  FileText,
  Loader2,
  LogIn,
  UserPlus,
  Users,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const MIN_PASSWORD = 8;
type Mode = "login" | "register";
type UserStats = { totalUsers: number; onlineUsers: number; activeToday: number };

export function Welcome({ stats: initialStats }: { stats: UserStats }) {
  const [mode, setMode] = useState<Mode>("login");
  const [stats, setStats] = useState<UserStats>(initialStats);

  // Keep the counts (especially "online now") fresh while the visitor is here.
  useEffect(() => {
    let active = true;
    const tick = async () => {
      try {
        const res = await fetch("/api/stats", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as UserStats;
        if (active) setStats(data);
      } catch {
        /* ignore transient errors */
      }
    };
    const id = setInterval(tick, 30000);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, []);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function switchMode(next: Mode) {
    setMode(next);
    setError(null);
    setPassword("");
    setConfirm("");
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim()) return setError("Please enter your name.");
    if (!password) return setError("Please enter your password.");
    if (mode === "register") {
      if (password.length < MIN_PASSWORD)
        return setError(`Password must be at least ${MIN_PASSWORD} characters.`);
      if (password !== confirm) return setError("Passwords do not match.");
    }

    setLoading(true);
    try {
      const res = await fetch("/api/session", {
        method: mode === "register" ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(
          data.error ||
            (mode === "register"
              ? "Could not create the account."
              : "Could not sign in."),
        );
        setLoading(false);
        return;
      }
      // Hard navigation guarantees a fresh server render with the new session.
      window.location.assign("/");
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  const features = [
    { icon: Timer, title: "Strict timed engine", desc: "Global + per-section countdowns that lock and force-submit — and survive a refresh." },
    { icon: CheckCircle2, title: "Instant auto-grading", desc: "Job Knowledge, Situational Judgment & English Expression graded with full rationale." },
    { icon: FileText, title: "STAR-L narratives", desc: "Draft the six required essays with a self-scoring STAR-L rubric." },
  ];

  return (
    <div className="mx-auto max-w-5xl animate-fade-in">
      <div className="grid items-start gap-10 md:grid-cols-2">
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

          {/* Social-proof counts */}
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
            <span className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>
                <strong className="font-semibold text-foreground">
                  {stats.totalUsers.toLocaleString()}
                </strong>{" "}
                {stats.totalUsers === 1 ? "candidate" : "candidates"}
              </span>
            </span>
            <span className="flex items-center gap-2 text-muted-foreground">
              <Activity className="h-4 w-4" />
              <span>
                <strong className="font-semibold text-foreground">
                  {stats.activeToday.toLocaleString()}
                </strong>{" "}
                active today
              </span>
            </span>
            <span className="flex items-center gap-2 text-muted-foreground">
              <span className="relative flex h-2.5 w-2.5" aria-hidden="true">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-success" />
              </span>
              <span>
                <strong className="font-semibold text-foreground">
                  {stats.onlineUsers.toLocaleString()}
                </strong>{" "}
                online now
              </span>
            </span>
          </div>
        </div>

        <Card className="shadow-md">
          {/* Fixed min-height + flex column so switching Login/Create account
              doesn't resize the card or shift the hero; the footer stays pinned
              to the bottom and the extra field just fills reserved space. */}
          <CardContent className="flex min-h-[36rem] flex-col p-8">
            {/* Tabs */}
            <div className="mb-5 grid grid-cols-2 gap-1 rounded-lg bg-muted p-1">
              {(["login", "register"] as Mode[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => switchMode(m)}
                  className={cn(
                    "inline-flex items-center justify-center gap-1.5 rounded-md py-2 text-sm font-medium transition-colors",
                    mode === m
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {m === "login" ? (
                    <>
                      <LogIn className="h-4 w-4" /> Log in
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4" /> Create account
                    </>
                  )}
                </button>
              ))}
            </div>

            <h2 className="text-xl font-semibold">
              {mode === "login" ? "Welcome back" : "Create your profile"}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {mode === "login"
                ? "Sign in to your local candidate profile to continue."
                : "Your progress, scores, and drafts are saved to this profile."}
            </p>

            <form onSubmit={submit} className="mt-6 space-y-4">
              <div>
                <label htmlFor="name" className="mb-1.5 block text-sm font-medium">
                  Name
                </label>
                <input
                  id="name"
                  value={name}
                  autoComplete="username"
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Jordan Alvarez"
                  disabled={loading}
                  className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
                  autoFocus
                />
              </div>
              <div>
                <label htmlFor="password" className="mb-1.5 block text-sm font-medium">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  autoComplete={mode === "register" ? "new-password" : "current-password"}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === "register" ? `At least ${MIN_PASSWORD} characters` : "Your password"}
                  disabled={loading}
                  className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
                />
              </div>
              {mode === "register" && (
                <div>
                  <label htmlFor="confirm" className="mb-1.5 block text-sm font-medium">
                    Confirm password
                  </label>
                  <input
                    id="confirm"
                    type="password"
                    value={confirm}
                    autoComplete="new-password"
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="Re-enter your password"
                    disabled={loading}
                    className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
                  />
                </div>
              )}

              {error && <p className="text-sm text-destructive">{error}</p>}

              <Button type="submit" size="lg" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />{" "}
                    {mode === "register" ? "Creating…" : "Signing in…"}
                  </>
                ) : mode === "register" ? (
                  <>
                    <UserPlus className="h-4 w-4" /> Create account
                  </>
                ) : (
                  <>
                    <LogIn className="h-4 w-4" /> Sign in
                  </>
                )}
              </Button>
            </form>

            <div className="mt-auto pt-6 text-center">
              <p className="text-xs text-muted-foreground">
                {mode === "login"
                  ? "Practice profile on this server. New here? Switch to “Create account.”"
                  : "No email required — this is a practice profile on this server."}
              </p>
              <p className="mt-2 text-[11px] text-muted-foreground/70">
                Inactive accounts are automatically deleted after 30 days.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
