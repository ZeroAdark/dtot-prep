"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Timer, CheckCircle2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function Welcome() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function start(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter your name to begin.");
      return;
    }
    setLoading(true);
    setError(null);
    const res = await fetch("/api/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (!res.ok) {
      setError("Could not start a session. Please try again.");
      setLoading(false);
      return;
    }
    router.refresh();
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
            <h2 className="text-xl font-semibold">Get started</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Enter a name to create your local candidate profile. Your progress,
              scores, and drafts are saved automatically.
            </p>
            <form onSubmit={start} className="mt-6 space-y-4">
              <div>
                <label htmlFor="name" className="mb-1.5 block text-sm font-medium">
                  Your name
                </label>
                <input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Jordan Alvarez"
                  className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  autoFocus
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" size="lg" className="w-full" disabled={loading}>
                {loading ? "Starting…" : "Start preparing"}
              </Button>
            </form>
            <p className="mt-4 text-center text-xs text-muted-foreground">
              No password required — this is a local practice profile.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
