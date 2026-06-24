"use client";

import { InteractiveDiagram } from "@/components/InteractiveDiagram";
import { MatchingDrill } from "@/components/MatchingDrill";
import { DRILLS } from "@/lib/drills";

/** The "Visuals" tab of a study guide: interactive diagrams + matching drills. */
export function StudyVisuals({
  diagrams,
  drills,
}: {
  diagrams: string[];
  drills: string[];
}) {
  const drillDefs = drills.map((s) => DRILLS[s]).filter(Boolean);

  return (
    <div className="space-y-5">
      {diagrams.map((slug) => (
        <InteractiveDiagram key={slug} slug={slug} />
      ))}
      {drillDefs.map((d) => (
        <MatchingDrill key={d.slug} drill={d} />
      ))}
    </div>
  );
}
