"use client";

import { useMemo, useState } from "react";
import { Check, X, RefreshCw, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { DrillDef } from "@/lib/drills";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Tap-to-pair matching exercise. Tap an item on the left, then its match on the
 * right (or vice-versa). Works on touch and keyboard — no drag-and-drop, which
 * is unreliable on mobile.
 */
export function MatchingDrill({ drill }: { drill: DrillDef }) {
  // Right column is shuffled; each entry remembers the left index it belongs to.
  const rights = useMemo(
    () => shuffle(drill.pairs.map((p, i) => ({ text: p.right, correctLeft: i }))),
    [drill],
  );

  const [selLeft, setSelLeft] = useState<number | null>(null);
  const [selRight, setSelRight] = useState<number | null>(null);
  const [matches, setMatches] = useState<Record<number, number>>({}); // leftIdx -> rightIdx
  const [checked, setChecked] = useState(false);
  const [nonce, setNonce] = useState(0); // bump to reshuffle/reset

  const rightToLeft = (r: number): number | null => {
    const entry = Object.entries(matches).find(([, rr]) => rr === r);
    return entry ? Number(entry[0]) : null;
  };

  function pair(l: number, r: number) {
    setChecked(false);
    setMatches((prev) => {
      const next: Record<number, number> = {};
      for (const [k, v] of Object.entries(prev)) {
        const lk = Number(k);
        if (lk === l || v === r) continue; // drop any prior use of this left or right
        next[lk] = v;
      }
      next[l] = r;
      return next;
    });
    setSelLeft(null);
    setSelRight(null);
  }

  function tapLeft(l: number) {
    if (checked) return;
    if (selRight != null) pair(l, selRight);
    else setSelLeft((cur) => (cur === l ? null : l));
  }
  function tapRight(r: number) {
    if (checked) return;
    if (selLeft != null) pair(selLeft, r);
    else setSelRight((cur) => (cur === r ? null : r));
  }

  function reset() {
    setMatches({});
    setSelLeft(null);
    setSelRight(null);
    setChecked(false);
    setNonce((n) => n + 1);
  }

  const allMatched = Object.keys(matches).length === drill.pairs.length;
  const correctCount = drill.pairs.filter(
    (_, l) => matches[l] != null && rights[matches[l]].correctLeft === l,
  ).length;

  const pairBadge = (l: number) => (
    <span className="ml-2 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-[11px] font-bold text-primary">
      {l + 1}
    </span>
  );

  return (
    <div className="rounded-lg border bg-card p-4" key={nonce}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-sm font-semibold">{drill.title}</div>
        {checked && (
          <span
            className={cn(
              "rounded-full px-2.5 py-0.5 text-xs font-semibold",
              correctCount === drill.pairs.length
                ? "bg-success/15 text-success"
                : "bg-muted text-muted-foreground",
            )}
          >
            {correctCount} / {drill.pairs.length} correct
          </span>
        )}
      </div>
      <p className="mt-1 text-xs text-muted-foreground">{drill.instructions}</p>

      <div className="mt-4 grid grid-cols-2 gap-3">
        {/* Left column */}
        <div className="space-y-2">
          {drill.pairs.map((p, l) => {
            const matchedR = matches[l];
            const isMatched = matchedR != null;
            const isSel = selLeft === l;
            const correct = checked && isMatched && rights[matchedR].correctLeft === l;
            const wrong = checked && isMatched && rights[matchedR].correctLeft !== l;
            return (
              <button
                key={l}
                type="button"
                onClick={() => tapLeft(l)}
                disabled={checked}
                className={cn(
                  "flex w-full items-center justify-between rounded-md border p-2.5 text-left text-sm transition-colors",
                  isSel && "ring-2 ring-primary",
                  correct && "border-success/50 bg-success/10",
                  wrong && "border-destructive/50 bg-destructive/10",
                  !correct && !wrong && isMatched && "border-primary/50 bg-primary/5",
                  !isMatched && "border-border hover:bg-muted/60",
                )}
              >
                <span className="flex-1 font-medium">{p.left}</span>
                {isMatched && pairBadge(l)}
              </button>
            );
          })}
        </div>

        {/* Right column (shuffled) */}
        <div className="space-y-2">
          {rights.map((r, ri) => {
            const matchedL = rightToLeft(ri);
            const isMatched = matchedL != null;
            const isSel = selRight === ri;
            const correct = checked && isMatched && r.correctLeft === matchedL;
            const wrong = checked && isMatched && r.correctLeft !== matchedL;
            return (
              <button
                key={ri}
                type="button"
                onClick={() => tapRight(ri)}
                disabled={checked}
                className={cn(
                  "flex w-full items-center justify-between gap-1 rounded-md border p-2.5 text-left text-sm transition-colors",
                  isSel && "ring-2 ring-primary",
                  correct && "border-success/50 bg-success/10",
                  wrong && "border-destructive/50 bg-destructive/10",
                  !correct && !wrong && isMatched && "border-primary/50 bg-primary/5",
                  !isMatched && "border-border hover:bg-muted/60",
                )}
              >
                <span className="flex-1">{r.text}</span>
                {checked && isMatched ? (
                  correct ? (
                    <Check className="h-4 w-4 shrink-0 text-success" />
                  ) : (
                    <X className="h-4 w-4 shrink-0 text-destructive" />
                  )
                ) : (
                  isMatched && matchedL != null && pairBadge(matchedL)
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-2">
        <span className="text-xs text-muted-foreground">
          {checked
            ? correctCount === drill.pairs.length
              ? "Perfect — all matched correctly."
              : "Reset and try the ones you missed."
            : `${Object.keys(matches).length} / ${drill.pairs.length} matched`}
        </span>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={reset}>
            <RefreshCw className="h-4 w-4" /> Reset
          </Button>
          <Button size="sm" onClick={() => setChecked(true)} disabled={!allMatched || checked}>
            <CheckCircle2 className="h-4 w-4" /> Check
          </Button>
        </div>
      </div>
    </div>
  );
}
