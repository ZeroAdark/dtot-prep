"use client";

import { useState } from "react";
import Link from "next/link";
import { Trophy, RotateCcw, LayoutDashboard, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ReadinessRing } from "@/components/ReadinessRing";
import { ReviewQuestion } from "@/components/ReviewQuestion";
import { SECTIONS, PASS_THRESHOLD } from "@/lib/constants";
import { sectionStyle } from "@/lib/sectionStyle";
import { readinessBand } from "@/lib/grading";
import { cn, formatDuration } from "@/lib/utils";
import type { ClientSession } from "@/lib/types";

const toneVariant: Record<string, "success" | "warning" | "destructive" | "default"> = {
  success: "success",
  warning: "warning",
  destructive: "destructive",
  primary: "default",
};
const toneBar: Record<string, string> = {
  success: "bg-success",
  warning: "bg-warning",
  destructive: "bg-destructive",
  primary: "bg-primary",
};

export function TestResults({ session }: { session: ClientSession }) {
  const [onlyWrong, setOnlyWrong] = useState(false);
  const band = readinessBand(session.score);
  const elapsed: number | null = session.completedAt
    ? Math.round(
        (new Date(session.completedAt).getTime() -
          new Date(session.startTime).getTime()) /
          1000,
      )
    : null;

  return (
    <div className="mx-auto max-w-3xl animate-fade-in space-y-8">
      {/* Hero */}
      <Card>
        <CardContent className="flex flex-col items-center gap-5 p-8 text-center sm:flex-row sm:text-left">
          <ReadinessRing value={session.score} tone={band.tone} label="Score" />
          <div className="flex-1">
            <div className="flex items-center justify-center gap-2 sm:justify-start">
              <Trophy className="h-5 w-5 text-primary" />
              <h1 className="text-2xl font-bold">
                {session.status === "EXPIRED" ? "Time expired — submitted" : "Test complete"}
              </h1>
            </div>
            <p className="mt-1 text-muted-foreground">
              You answered {session.correctCount} of {session.totalCount} questions
              correctly.
            </p>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <Badge variant={toneVariant[band.tone]}>{band.label}</Badge>
              {session.score != null && (
                <Badge variant={session.score >= PASS_THRESHOLD ? "success" : "muted"}>
                  {session.score >= PASS_THRESHOLD ? "Above" : "Below"} {PASS_THRESHOLD}% bar
                </Badge>
              )}
              {elapsed != null && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" /> {formatDuration(elapsed)} used
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section breakdown */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Section breakdown</h2>
        {session.sections.map((sec) => {
          const meta = SECTIONS[sec.section];
          const style = sectionStyle(sec.section);
          const b = readinessBand(sec.scorePct);
          return (
            <Card key={sec.section}>
              <CardContent className="p-4">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={cn("h-2.5 w-2.5 rounded-full", style.dot)} />
                    <span className="font-medium">{meta.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {sec.correctCount}/{sec.totalCount}
                    </span>
                    <Badge variant={toneVariant[b.tone]}>
                      {sec.scorePct == null ? "—" : `${Math.round(sec.scorePct)}%`}
                    </Badge>
                  </div>
                </div>
                <Progress
                  value={sec.scorePct ?? 0}
                  indicatorClassName={toneBar[b.tone]}
                />
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Review */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Answer review</h2>
          <Button
            variant={onlyWrong ? "default" : "outline"}
            size="sm"
            onClick={() => setOnlyWrong((v) => !v)}
          >
            {onlyWrong ? "Showing incorrect" : "Show only incorrect"}
          </Button>
        </div>
        <div className="space-y-6">
          {session.sections.map((sec) => {
            const items = sec.questions
              .map((q, i) => ({ q, i }))
              .filter(({ q }) => (onlyWrong ? q.isCorrect === false : true));
            if (items.length === 0) return null;
            return (
              <div key={sec.section} className="space-y-3">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  {SECTIONS[sec.section].label}
                </h3>
                {items.map(({ q, i }) => (
                  <ReviewQuestion key={q.questionId} item={q} index={i} />
                ))}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link href="/">
          <Button variant="outline">
            <LayoutDashboard className="h-4 w-4" /> Back to dashboard
          </Button>
        </Link>
        <Link href="/test">
          <Button>
            <RotateCcw className="h-4 w-4" /> Start another test
          </Button>
        </Link>
      </div>
    </div>
  );
}
