import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NarrativeWorkspace } from "@/components/NarrativeWorkspace";

export const dynamic = "force-dynamic";

export default async function NarrativesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/");

  const narratives = await prisma.narrative.findMany({
    where: { userId: user.id },
  });

  return (
    <NarrativeWorkspace
      initial={narratives.map((n) => ({
        competency: n.competency,
        content: n.content,
        rubric: n.rubric,
        status: n.status,
      }))}
    />
  );
}
