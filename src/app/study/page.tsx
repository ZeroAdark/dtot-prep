import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, BookOpen, Layers, GraduationCap } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { SECTIONS, SECTION_ORDER } from "@/lib/constants";
import { sectionStyle } from "@/lib/sectionStyle";
import { fromJson } from "@/lib/serialize";
import { cn } from "@/lib/utils";
import type { StudyFlashcard } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function StudyHubPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/");

  const [materials, progress] = await Promise.all([
    prisma.studyMaterial.findMany({ orderBy: { order: "asc" } }),
    prisma.studyProgress.findMany({
      where: { userId: user.id },
      select: { materialId: true },
    }),
  ]);

  const studied = new Set(progress.map((p) => p.materialId));
  const totalCards = materials.reduce(
    (n, m) => n + fromJson<StudyFlashcard[]>(m.flashcards, []).length,
    0,
  );

  return (
    <div className="animate-fade-in space-y-8">
      <div>
        <h1 className="flex items-center gap-2 text-3xl font-bold">
          <BookOpen className="h-7 w-7 text-primary" /> Study Hub
        </h1>
        <p className="mt-1 text-muted-foreground">
          {materials.length} interactive guides across every DTOT topic — read
          the notes, drill {totalCards} flashcards, then take a quick check drawn
          from the question bank.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {SECTION_ORDER.map((s) => {
          const meta = SECTIONS[s];
          const style = sectionStyle(s);
          const items = materials.filter((m) => m.section === s);
          const topics = Array.from(new Set(items.map((m) => m.topic)));
          const studiedCount = items.filter((m) => studied.has(m.id)).length;
          const cards = items.reduce(
            (n, m) => n + fromJson<StudyFlashcard[]>(m.flashcards, []).length,
            0,
          );
          const pct =
            items.length === 0
              ? 0
              : Math.round((studiedCount / items.length) * 100);
          return (
            <Card key={s} className="flex flex-col">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <span className={cn("h-2.5 w-2.5 rounded-full", style.dot)} />
                  <CardTitle className="text-base">{meta.label}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col">
                <p className="text-sm text-muted-foreground">{meta.blurb}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {topics.slice(0, 7).map((t) => (
                    <Badge key={t} variant="secondary" className="font-normal">
                      {t}
                    </Badge>
                  ))}
                </div>

                <div className="mt-4">
                  <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <GraduationCap className="h-3.5 w-3.5" />
                      {studiedCount}/{items.length} studied
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Layers className="h-3.5 w-3.5" />
                      {cards} cards
                    </span>
                  </div>
                  <Progress value={pct} indicatorClassName={style.bar} />
                </div>

                <div className="mt-auto flex items-center justify-between pt-4">
                  <span className="text-xs text-muted-foreground">
                    {items.length} {items.length === 1 ? "guide" : "guides"}
                  </span>
                  <Link
                    href={`/study/${s}`}
                    className={cn(
                      "flex items-center gap-1 text-sm font-medium",
                      style.text,
                    )}
                  >
                    Open <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
