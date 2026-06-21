import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { ArrowLeft, PencilRuler, ListChecks } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SECTIONS, SECTION_ORDER, SectionKey } from "@/lib/constants";
import { sectionStyle } from "@/lib/sectionStyle";
import { fromJson } from "@/lib/serialize";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function StudySectionPage({
  params,
}: {
  params: { section: string };
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/");

  const section = params.section as SectionKey;
  if (!SECTION_ORDER.includes(section)) notFound();

  const meta = SECTIONS[section];
  const style = sectionStyle(section);
  const materials = await prisma.studyMaterial.findMany({
    where: { section },
    orderBy: { order: "asc" },
  });

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

      {materials.length === 0 ? (
        <p className="rounded-md border p-6 text-center text-sm text-muted-foreground">
          No study material for this section yet.
        </p>
      ) : (
        <div className="space-y-3">
          {materials.map((m, i) => {
            const keyPoints = fromJson<string[]>(m.keyPoints, []);
            return (
              <details
                key={m.id}
                open={i === 0}
                className={cn(
                  "group rounded-lg border bg-card transition-colors",
                  style.border,
                )}
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-5">
                  <div>
                    <div className="font-semibold">{m.title}</div>
                    <div className="text-sm text-muted-foreground">{m.summary}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{m.topic}</Badge>
                    <span className="text-muted-foreground transition-transform group-open:rotate-90">
                      ›
                    </span>
                  </div>
                </summary>
                <div className="border-t px-5 pb-5 pt-4">
                  <div className="whitespace-pre-line text-sm leading-relaxed text-foreground/90">
                    {m.content}
                  </div>
                  {keyPoints.length > 0 && (
                    <div className={cn("mt-4 rounded-md p-4", style.soft)}>
                      <div className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
                        <ListChecks className={cn("h-4 w-4", style.text)} /> Key
                        takeaways
                      </div>
                      <ul className="space-y-1.5 text-sm">
                        {keyPoints.map((kp, k) => (
                          <li key={k} className="flex gap-2">
                            <span className={cn("mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full", style.dot)} />
                            <span>{kp}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </details>
            );
          })}
        </div>
      )}
    </div>
  );
}
