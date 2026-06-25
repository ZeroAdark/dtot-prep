import Link from "next/link";
import { redirect } from "next/navigation";
import { ListChecks, PartyPopper } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ReviewQuestion } from "@/components/ReviewQuestion";
import { SECTIONS, SECTION_ORDER, SectionKey } from "@/lib/constants";
import { displayOptions, fromJson } from "@/lib/serialize";
import { sectionStyle } from "@/lib/sectionStyle";
import { cn } from "@/lib/utils";
import type { ClientQuestionItem } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ReviewPage({
  searchParams,
}: {
  searchParams: Promise<{ section?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/");

  const { section: sectionParam } = await searchParams;
  const filter =
    sectionParam && SECTION_ORDER.includes(sectionParam as SectionKey)
      ? (sectionParam as SectionKey)
      : null;

  // Missed = wrong or unanswered, from finished sessions.
  const responses = await prisma.userResponse.findMany({
    where: {
      userId: user.id,
      session: { status: { in: ["COMPLETED", "EXPIRED"] } },
      ...(filter ? { section: filter } : {}),
      OR: [{ isCorrect: false }, { selectedOptionId: null }],
    },
    include: { question: true },
    orderBy: { updatedAt: "desc" },
  });

  // Dedupe by question, keeping the most recent miss.
  const seen = new Set<string>();
  const items: { section: SectionKey; item: ClientQuestionItem }[] = [];
  for (const r of responses) {
    if (seen.has(r.questionId)) continue;
    seen.add(r.questionId);
    items.push({
      section: r.section as SectionKey,
      item: {
        questionId: r.questionId,
        topic: r.question.topic,
        difficulty: r.question.difficulty,
        prompt: r.question.prompt,
        scenario: r.question.scenario,
        options: displayOptions(r.question, `${r.sessionId}:${r.questionId}`),
        diagram: r.question.diagram ?? null,
        selectedOptionId: r.selectedOptionId,
        flagged: r.flagged,
        correctId: r.question.correctId,
        rationale: r.question.rationale,
        optionNotes: fromJson<Record<string, string>>(r.question.optionNotes, {}),
        reference: r.question.reference,
        isCorrect: r.isCorrect,
      },
    });
  }

  const countsBySection = SECTION_ORDER.map((s) => ({
    section: s,
    count: items.filter((i) => i.section === s).length,
  }));

  return (
    <div className="mx-auto max-w-3xl animate-fade-in space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-3xl font-bold">
          <ListChecks className="h-7 w-7 text-primary" /> Review mistakes
        </h1>
        <p className="mt-1 text-muted-foreground">
          Every question you missed or left unanswered in a graded test, with the
          correct answer and rationale.
        </p>
      </div>

      {/* Section filter */}
      <div className="flex flex-wrap gap-2">
        <FilterChip href="/review" active={!filter} label="All sections" />
        {countsBySection.map((c) => (
          <FilterChip
            key={c.section}
            href={`/review?section=${c.section}`}
            active={filter === c.section}
            label={`${SECTIONS[c.section].label} (${c.count})`}
            dot={sectionStyle(c.section).dot}
          />
        ))}
      </div>

      {items.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-14 text-center">
            <PartyPopper className="h-10 w-10 text-success" />
            <div>
              <p className="font-medium">Nothing to review here.</p>
              <p className="text-sm text-muted-foreground">
                {filter
                  ? "No misses in this section yet."
                  : "Complete a timed test — any wrong or skipped questions will collect here."}
              </p>
            </div>
            <Link href="/test">
              <Button size="sm">Take a test</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {items.length} question{items.length === 1 ? "" : "s"} to revisit.
          </p>
          {items.map(({ item }, i) => (
            <ReviewQuestion key={item.questionId} item={item} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}

function FilterChip({
  href,
  active,
  label,
  dot,
}: {
  href: string;
  active: boolean;
  label: string;
  dot?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors",
        active ? "border-primary bg-primary/10 text-primary" : "hover:bg-muted",
      )}
    >
      {dot && <span className={cn("h-2 w-2 rounded-full", dot)} />}
      {label}
    </Link>
  );
}
