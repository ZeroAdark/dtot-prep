import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getSessionDTO } from "@/lib/engine";
import { TestRunner } from "@/components/TestRunner";
import type { ClientSession } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function TestRunnerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/");

  const { id } = await params;
  const dto = await getSessionDTO(id, user.id);
  if (!dto) notFound();

  // Normalize Dates → ISO strings for the client component.
  const initial = JSON.parse(JSON.stringify(dto)) as ClientSession;

  return <TestRunner initial={initial} />;
}
