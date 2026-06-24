import { Check, X, Info, BookMarked, Flag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { InteractiveDiagram } from "@/components/InteractiveDiagram";
import type { ClientQuestionItem } from "@/lib/types";

export function ReviewQuestion({
  item,
  index,
}: {
  item: ClientQuestionItem;
  index: number;
}) {
  const answered = item.selectedOptionId != null;
  const correct = item.isCorrect === true;

  return (
    <div className="rounded-lg border bg-card p-5">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="text-sm font-semibold text-muted-foreground">
          Question {index + 1}
        </span>
        <Badge variant="secondary">{item.topic}</Badge>
        <Badge variant="muted">{item.difficulty.toLowerCase()}</Badge>
        {item.flagged && (
          <Badge variant="warning" className="gap-1">
            <Flag className="h-3 w-3" /> flagged
          </Badge>
        )}
        <span className="ml-auto">
          {!answered ? (
            <Badge variant="muted">Not answered</Badge>
          ) : correct ? (
            <Badge variant="success" className="gap-1">
              <Check className="h-3 w-3" /> Correct
            </Badge>
          ) : (
            <Badge variant="destructive" className="gap-1">
              <X className="h-3 w-3" /> Incorrect
            </Badge>
          )}
        </span>
      </div>

      {item.scenario && (
        <p className="mb-3 rounded-md bg-muted/60 p-3 text-sm text-muted-foreground">
          {item.scenario}
        </p>
      )}

      {item.diagram && (
        <div className="mb-3">
          <InteractiveDiagram slug={item.diagram} compact />
        </div>
      )}

      <p className="font-medium">{item.prompt}</p>

      <ul className="mt-3 space-y-2">
        {item.options.map((opt) => {
          const isCorrectOpt = opt.id === item.correctId;
          const isSelected = opt.id === item.selectedOptionId;
          const wrongSelected = isSelected && !isCorrectOpt;
          return (
            <li
              key={opt.id}
              className={cn(
                "flex gap-3 rounded-md border p-3 text-sm",
                isCorrectOpt && "border-success/40 bg-success/10",
                wrongSelected && "border-destructive/40 bg-destructive/10",
                !isCorrectOpt && !wrongSelected && "border-border",
              )}
            >
              <span
                className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-bold",
                  isCorrectOpt && "border-success bg-success text-success-foreground",
                  wrongSelected && "border-destructive bg-destructive text-destructive-foreground",
                  !isCorrectOpt && !wrongSelected && "border-muted-foreground/30",
                )}
              >
                {opt.id}
              </span>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span>{opt.text}</span>
                  {isCorrectOpt && (
                    <span className="shrink-0 text-xs font-medium text-success">
                      Correct answer
                    </span>
                  )}
                  {wrongSelected && (
                    <span className="shrink-0 text-xs font-medium text-destructive">
                      Your answer
                    </span>
                  )}
                </div>
                {item.optionNotes?.[opt.id] && !isCorrectOpt && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {item.optionNotes[opt.id]}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      <div className="mt-4 flex gap-2 rounded-md bg-primary/5 p-3">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <div className="text-sm">
          <span className="font-medium text-primary">Rationale. </span>
          <span className="text-foreground/90">{item.rationale}</span>
          {item.reference && (
            <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
              <BookMarked className="h-3.5 w-3.5" />
              {item.reference}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
