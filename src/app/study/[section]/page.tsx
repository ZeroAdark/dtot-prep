import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { ArrowLeft, PencilRuler } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { StudySectionView } from "@/components/StudySectionView";
import { SECTIONS, SECTION_ORDER, SectionKey } from "@/lib/constants";
import { sectionStyle } from "@/lib/sectionStyle";
import { fromJson } from "@/lib/serialize";
import { cn } from "@/lib/utils";
import type { StudyGuideData, StudyFlashcard } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function StudySectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/");

  const { section: sectionParam } = await params;
  const section = sectionParam as SectionKey;
  if (!SECTION_ORDER.includes(section)) notFound();

  const meta = SECTIONS[section];
  const style = sectionStyle(section);

  const [materials, progress] = await Promise.all([
    prisma.studyMaterial.findMany({
      where: { section },
      orderBy: { order: "asc" },
    }),
    prisma.studyProgress.findMany({
      where: { userId: user.id },
      select: { materialId: true },
    }),
  ]);

  const studied = new Set(progress.map((p) => p.materialId));

  const guides: StudyGuideData[] = materials.map((m) => ({
    id: m.id,
    section,
    topic: m.topic,
    title: m.title,
    summary: m.summary,
    content: m.content,
    keyPoints: fromJson<string[]>(m.keyPoints, []),
    flashcards: fromJson<StudyFlashcard[]>(m.flashcards, []),
    studied: studied.has(m.id),
  }));

  return (
    <div className="mx-auto max-w-3xl animate-fade-in space-y-6">
      <Link
        href="/study"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Study Hub
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold">
            <span className={cn("h-3 w-3 rounded-full", style.dot)} />
            {meta.label}
          </h1>
          <p className="mt-1 max-w-2xl text-muted-foreground">{meta.blurb}</p>
        </div>
        <Link href={`/test?section=${section}`}>
          <Button>
            <PencilRuler className="h-4 w-4" /> Practice this section
          </Button>
        </Link>
      </div>

      {guides.length === 0 ? (
        <p className="rounded-md border p-6 text-center text-sm text-muted-foreground">
          No study material for this section yet.
        </p>
      ) : (
        <StudySectionView section={section} guides={guides} />
      )}
    </div>
  );
}
