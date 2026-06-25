"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { DIAGRAMS } from "@/components/diagrams/defs";
import { PART_VIEWS, PartViewsPanel } from "@/components/diagrams/multiview";

/**
 * Renders an interactive schematic diagram by slug: an SVG whose parts can be
 * tapped (or selected via the chips below) to reveal a description. The chips
 * make it fully usable on touch screens and keyboard-accessible.
 */
export function InteractiveDiagram({
  slug,
  compact = false,
}: {
  slug: string;
  compact?: boolean;
}) {
  const def = DIAGRAMS[slug];
  const [activeId, setActiveId] = useState<string | null>(null);

  if (!def) return null;
  const active = def.parts.find((p) => p.id === activeId) ?? null;
  const toggle = (id: string) => setActiveId((cur) => (cur === id ? null : id));

  const onSvgClick = (e: React.MouseEvent) => {
    const el = (e.target as Element).closest?.("[data-part]");
    const id = el?.getAttribute("data-part");
    if (id) toggle(id);
  };

  return (
    <figure className={cn("rounded-lg border bg-card", compact ? "p-3" : "p-4")}>
      {!compact && (
        <figcaption className="mb-2 text-sm font-semibold">{def.title}</figcaption>
      )}
      <div className="overflow-x-auto">
        {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
        <svg
          viewBox={def.viewBox}
          role="img"
          aria-label={def.title}
          onClick={onSvgClick}
          className="mx-auto h-auto w-full max-w-md select-none"
        >
          {def.render(activeId)}
        </svg>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {def.parts.map((p) => (
          <button
            key={p.id}
            type="button"
            aria-pressed={activeId === p.id}
            onClick={() => toggle(p.id)}
            className={cn(
              "rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
              activeId === p.id
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="mt-3 min-h-[3.75rem] rounded-md bg-muted/50 p-3 text-sm">
        {active ? (
          <div>
            <p>
              <span className="font-semibold text-foreground">{active.label}. </span>
              <span className="text-foreground/85">{active.description}</span>
            </p>
          </div>
        ) : (
          <p className="text-muted-foreground">
            {def.caption ?? "Tap a part of the diagram to learn more."}
          </p>
        )}
      </div>

      {active && PART_VIEWS[active.id] && (
        <PartViewsPanel id={active.id} label={active.label} />
      )}
    </figure>
  );
}
