import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SECTION_ORDER, SectionKey } from "@/lib/constants";
import { TestSetup } from "@/components/TestSetup";

export const dynamic = "force-dynamic";

export default async function TestPage({
  searchParams,
}: {
  searchParams: { section?: string };
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/");

  const grouped = await prisma.question.groupBy({
    by: ["section"],
    _count: { _all: true },
  });
  const counts = Object.fromEntries(
    SECTION_ORDER.map((s) => [
      s,
      grouped.find((g) => g.section === s)?._count._all ?? 0,
    ]),
  ) as Record<SectionKey, number>;

  const resumable = await prisma.testSession.findMany({
    where: { userId: user.id, status: "IN_PROGRESS" },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      mode: true,
      sections: true,
      createdAt: true,
      totalCount: true,
    },
  });

  const presetSection =
    searchParams.section && SECTION_ORDER.includes(searchParams.section as SectionKey)
      ? (searchParams.section as SectionKey)
      : null;

  return (
    <TestSetup
      counts={counts}
      presetSection={presetSection}
      resumable={resumable.map((r) => ({
        ...r,
        createdAt: r.createdAt.toISOString(),
      }))}
    />
  );
}
