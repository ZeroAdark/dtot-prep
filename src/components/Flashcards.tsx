"use client";

import { useState } from "react";
import { RotateCw, ChevronLeft, ChevronRight, Shuffle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { SectionStyle } from "@/lib/sectionStyle";
import type { StudyFlashcard } from "@/lib/types";

export function Flashcards({
  cards,
  style,
}: {
  cards: StudyFlashcard[];
  style: SectionStyle;
}) {
  const [order, setOrder] = useState<number[]>(() => cards.map((_, i) => i));
  const [pos, setPos] = useState(0);
  const [flipped, setFlipped] = useState(false);

  if (cards.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No flashcards for this guide yet.
      </p>
    );
  }

  const card = cards[order[pos]];

  const go = (delta: number) => {
    setFlipped(false);
    setPos((p) => (p + delta + cards.length) % cards.length);
  };

  const shuffleCards = () => {
    const a = [...order];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    setOrder(a);
    setPos(0);
    setFlipped(false);
  };

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => setFlipped((f) => !f)}
        aria-label={flipped ? "Hide answer" : "Reveal answer"}
        className={cn(
          "flex min-h-[180px] w-full flex-col items-center justify-center gap-3 rounded-xl border-2 p-6 text-center transition-colors hover:bg-muted/40",
          style.border,
          flipped ? style.soft : "bg-card",
        )}
      >
        <span
          className={cn(
            "text-[11px] font-semibold uppercase tracking-wide",
            style.text,
          )}
        >
          {flipped ? "Answer" : "Term / Question"}
        </span>
        <span className="text-base font-medium leading-relaxed text-foreground">
          {flipped ? card.back : card.front}
        </span>
        <span className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
          <RotateCw className="h-3 w-3" />
          {flipped ? "Tap to hide" : "Tap to reveal"}
        </span>
      </button>

      <div className="flex items-center justify-between gap-2">
        <Button variant="outline" size="sm" onClick={() => go(-1)}>
          <ChevronLeft className="h-4 w-4" /> Prev
        </Button>
        <span className="text-sm tabular-nums text-muted-foreground">
          {pos + 1} / {cards.length}
        </span>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={shuffleCards}>
            <Shuffle className="h-4 w-4" /> Shuffle
          </Button>
          <Button variant="outline" size="sm" onClick={() => go(1)}>
            Next <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
