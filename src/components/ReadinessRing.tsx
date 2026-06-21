import { cn } from "@/lib/utils";

const TONE_STROKE: Record<string, string> = {
  destructive: "stroke-destructive",
  warning: "stroke-warning",
  primary: "stroke-primary",
  success: "stroke-success",
};
const TONE_TEXT: Record<string, string> = {
  destructive: "text-destructive",
  warning: "text-warning",
  primary: "text-primary",
  success: "text-success",
};

export function ReadinessRing({
  value,
  tone = "primary",
  size = 132,
  label,
}: {
  value: number | null;
  tone?: string;
  size?: number;
  label?: string;
}) {
  const r = (size - 14) / 2;
  const c = 2 * Math.PI * r;
  const v = value ?? 0;
  const offset = c - (v / 100) * c;
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={10}
          className="stroke-muted"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={10}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          className={cn("transition-all", TONE_STROKE[tone])}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn("text-3xl font-bold tabular", TONE_TEXT[tone])}>
          {value == null ? "—" : Math.round(value)}
          {value != null && <span className="text-base">%</span>}
        </span>
        {label && (
          <span className="mt-0.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </span>
        )}
      </div>
    </div>
  );
}
