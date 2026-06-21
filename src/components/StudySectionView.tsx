"use client";

import { useMemo, useState } from "react";
import { Search, GraduationCap } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { StudyGuide } from "@/components/StudyGuide";
import { sectionStyle } from "@/lib/sectionStyle";
import { cn } from "@/lib/utils";
import type { SectionKey } from "@/lib/constants";
import type { StudyGuideData } from "@/lib/types";

export function StudySectionView({
  section,
  guides,
}: {
  section: SectionKey;
  guides: StudyGuideData[];
}) {
  const style = sectionStyle(section);
  const [query, setQuery] = useState("");
  const [studiedIds, setStudiedIds] = useState<Set<string>>(
    () => new Set(guides.filter((g) => g.studied).map((g) => g.id)),
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return guides;
    return guides.filter((g) =>
      [g.title, g.topic, g.summary, g.content].some((f) =>
        f.toLowerCase().includes(q),
      ),
    );
  }, [guides, query]);

  const total = guides.length;
  const studiedCount = studiedIds.size;
  const pct = total === 0 ? 0 : Math.round((studiedCount / total) * 100);

  const onStudiedChange = (id: string, studied: boolean) =>
    setStudiedIds((prev) => {
      const next = new Set(prev);
      if (studied) next.add(id);
      else next.delete(id);
      return next;
    });

  return (
    <div className="space-y-4">
      {/* Progress + search */}
      <div className="rounded-lg border bg-card p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <GraduationCap className={cn("h-4 w-4", style.text)} />
            Studied {studiedCount} of {total} guides
          </div>
          <span className="text-sm tabular-nums text-muted-foreground">
            {pct}%
          </span>
        </div>
        <Progress
          value={pct}
          className="mt-2"
          indicatorClassName={style.bar}
        />
        <div className="relative mt-3">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search these guides…"
            className="h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-md border p-6 text-center text-sm text-muted-foreground">
          No guides match “{query}”.
        </p>
      ) : (
        <div className="space-y-3">
          {filtered.map((g, i) => (
            <StudyGuide
              key={g.id}
              guide={g}
              defaultOpen={!query && i === 0}
              onStudiedChange={(s) => onStudiedChange(g.id, s)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
