"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Check,
  X,
  Info,
  BookMarked,
  RefreshCw,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { InteractiveDiagram } from "@/components/InteractiveDiagram";
import type { SectionStyle } from "@/lib/sectionStyle";
import type { StudyQuizItem } from "@/lib/types";

export function StudyQuickCheck({
  materialId,
  style,
}: {
  materialId: string;
  style: SectionStyle;
}) {
  const [questions, setQuestions] = useState<StudyQuizItem[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // questionId -> selected option id
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    setAnswers({});
    try {
      const res = await fetch(`/api/study/quiz?material=${materialId}&n=5`);
      if (!res.ok) throw new Error("Could not load questions.");
      const data = await res.json();
      setQuestions(data.questions as StudyQuizItem[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, [materialId]);

  useEffect(() => {
    load();
  }, [load]);

  const choose = (qid: string, optId: string) => {
    setAnswers((prev) => (prev[qid] ? prev : { ...prev, [qid]: optId }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading questions…
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <AlertCircle className="h-5 w-5 text-destructive" />
        <p className="text-sm text-muted-foreground">{error}</p>
        <Button variant="outline" size="sm" onClick={load}>
          <RefreshCw className="h-4 w-4" /> Try again
        </Button>
      </div>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        No practice questions are available for this topic yet.
      </p>
    );
  }

  const answeredCount = Object.keys(answers).length;
  const correctCount = questions.filter(
    (q) => answers[q.id] === q.correctId,
  ).length;
  const allAnswered = answeredCount === questions.length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          Answer to reveal the rationale. Drawn from the question bank for this
          topic.
        </p>
        <Badge variant={allAnswered ? "success" : "muted"} className="gap-1">
          {correctCount} / {questions.length} correct
        </Badge>
      </div>

      {questions.map((q, i) => {
        const selected = answers[q.id];
        const answered = selected != null;
        return (
          <div key={q.id} className="rounded-lg border bg-card p-4">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground">
                Q{i + 1}
              </span>
              <Badge variant="secondary">{q.topic}</Badge>
              <Badge variant="muted">{q.difficulty.toLowerCase()}</Badge>
            </div>

            {q.scenario && (
              <p className="mb-2 rounded-md bg-muted/60 p-3 text-sm text-muted-foreground">
                {q.scenario}
              </p>
            )}

            {q.diagram && (
              <div className="mb-3">
                <InteractiveDiagram slug={q.diagram} compact />
              </div>
            )}

            <p className="font-medium">{q.prompt}</p>

            <ul className="mt-3 space-y-2">
              {q.options.map((opt) => {
                const isCorrect = opt.id === q.correctId;
                const isSelected = opt.id === selected;
                const wrongSelected = isSelected && !isCorrect;
                return (
                  <li key={opt.id}>
                    <button
                      type="button"
                      disabled={answered}
                      onClick={() => choose(q.id, opt.id)}
                      className={cn(
                        "flex w-full gap-3 rounded-md border p-3 text-left text-sm transition-colors",
                        !answered && "hover:border-primary/50 hover:bg-muted/50",
                        answered && isCorrect && "border-success/40 bg-success/10",
                        answered &&
                          wrongSelected &&
                          "border-destructive/40 bg-destructive/10",
                        answered &&
                          !isCorrect &&
                          !wrongSelected &&
                          "border-border opacity-70",
                        !answered && "border-border",
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-bold",
                          answered &&
                            isCorrect &&
                            "border-success bg-success text-success-foreground",
                          answered &&
                            wrongSelected &&
                            "border-destructive bg-destructive text-destructive-foreground",
                          (!answered || (!isCorrect && !wrongSelected)) &&
                            "border-muted-foreground/30",
                        )}
                      >
                        {answered && isCorrect ? (
                          <Check className="h-3.5 w-3.5" />
                        ) : answered && wrongSelected ? (
                          <X className="h-3.5 w-3.5" />
                        ) : (
                          opt.id
                        )}
                      </span>
                      <span className="flex-1">{opt.text}</span>
                    </button>
                  </li>
                );
              })}
            </ul>

            {answered && (
              <div className="mt-3 flex gap-2 rounded-md bg-primary/5 p-3">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <div className="text-sm">
                  <span className="font-medium text-primary">Rationale. </span>
                  <span className="text-foreground/90">{q.rationale}</span>
                  {q.reference && (
                    <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <BookMarked className="h-3.5 w-3.5" />
                      {q.reference}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}

      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {allAnswered
            ? `You scored ${correctCount} / ${questions.length}.`
            : `${answeredCount} / ${questions.length} answered`}
        </span>
        <Button variant="outline" size="sm" onClick={load}>
          <RefreshCw className="h-4 w-4" /> New questions
        </Button>
      </div>
    </div>
  );
}
