import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, BookOpen } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SECTIONS, SECTION_ORDER } from "@/lib/constants";
import { sectionStyle } from "@/lib/sectionStyle";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function StudyHubPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/");

  const materials = await prisma.studyMaterial.findMany({
    orderBy: { order: "asc" },
  });

  return (
    <div className="animate-fade-in space-y-8">
      <div>
        <h1 className="flex items-center gap-2 text-3xl font-bold">
          <BookOpen className="h-7 w-7 text-primary" /> Study Hub
        </h1>
        <p className="mt-1 text-muted-foreground">
          Concise, high-yield notes for every DTOT topic. Open a section to read
          the material, then test yourself.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {SECTION_ORDER.map((s) => {
          const meta = SECTIONS[s];
          const style = sectionStyle(s);
          const items = materials.filter((m) => m.section === s);
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
                  {items.slice(0, 6).map((m) => (
                    <Badge key={m.id} variant="secondary" className="font-normal">
                      {m.topic}
                    </Badge>
                  ))}
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
