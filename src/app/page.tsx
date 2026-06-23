import Link from "next/link";
import {
  PencilRuler,
  BookOpen,
  FileText,
  ListChecks,
  ArrowRight,
  Target,
  CheckCircle2,
  ClipboardList,
} from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { getDashboardStats, getUserStats } from "@/lib/stats";
import { Welcome } from "@/components/Welcome";
import { ReadinessRing } from "@/components/ReadinessRing";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { SECTIONS, PASS_THRESHOLD } from "@/lib/constants";
import { sectionStyle } from "@/lib/sectionStyle";
import { cn, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

const toneVariant: Record<string, "success" | "warning" | "destructive" | "default"> = {
  success: "success",
  warning: "warning",
  destructive: "destructive",
  primary: "default",
};
const toneBar: Record<string, string> = {
  success: "bg-success",
  warning: "bg-warning",
  destructive: "bg-destructive",
  primary: "bg-primary",
};

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) return <Welcome stats={await getUserStats()} />;

  const stats = await getDashboardStats(user.id);

  return (
    <div className="animate-fade-in space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {user.name.split(" ")[0]}</h1>
          <p className="mt-1 text-muted-foreground">
            Your DTOT readiness at a glance. Keep practicing to raise each section
            above {PASS_THRESHOLD}%.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/test">
            <Button>
              <PencilRuler className="h-4 w-4" /> Start a practice test
            </Button>
          </Link>
        </div>
      </div>

      {/* Readiness overview */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardContent className="flex flex-col items-center justify-center gap-3 p-6 text-center">
            <ReadinessRing
              value={stats.overallReadiness}
              tone={stats.overallBand.tone}
              label="Readiness"
            />
            <div>
              <Badge variant={toneVariant[stats.overallBand.tone]}>
                {stats.overallBand.label}
              </Badge>
              <p className="mt-2 text-sm text-muted-foreground">
                {stats.overallReadiness == null
                  ? "Complete a timed test to generate your readiness score."
                  : "Average accuracy across graded sections."}
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-4 lg:col-span-2">
          <StatTile
            icon={<ClipboardList className="h-5 w-5" />}
            label="Tests completed"
            value={String(stats.finishedSessions)}
            sub={stats.inProgress > 0 ? `${stats.inProgress} in progress` : "timed + practice"}
          />
          <StatTile
            icon={<Target className="h-5 w-5" />}
            label="Questions answered"
            value={String(stats.totalAnswered)}
            sub={`${stats.totalCorrect} correct`}
          />
          <StatTile
            icon={<CheckCircle2 className="h-5 w-5" />}
            label="Overall accuracy"
            value={
              stats.totalAnswered
                ? `${Math.round((stats.totalCorrect / stats.totalAnswered) * 100)}%`
                : "—"
            }
            sub={`${stats.mistakeCount} to review`}
          />
          <StatTile
            icon={<FileText className="h-5 w-5" />}
            label="Narratives drafted"
            value={`${stats.narrativesComplete}/${stats.narrativesTotal}`}
            sub={
              stats.avgRubricPercent != null
                ? `avg STAR-L ${Math.round(stats.avgRubricPercent)}%`
                : "STAR-L rubric"
            }
          />
        </div>
      </div>

      {/* Section readiness */}
      <div>
        <h2 className="mb-3 text-lg font-semibold">Section readiness</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {stats.sections.map((s) => {
            const meta = SECTIONS[s.section];
            const style = sectionStyle(s.section);
            return (
              <Card key={s.section}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={cn("h-2.5 w-2.5 rounded-full", style.dot)} />
                      <CardTitle className="text-base">{meta.label}</CardTitle>
                    </div>
                    <Badge variant={toneVariant[s.band.tone]}>{s.band.label}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-end justify-between">
                    <span className="text-2xl font-bold tabular">
                      {s.percent == null ? "—" : `${Math.round(s.percent)}%`}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {s.total > 0 ? `${s.correct}/${s.total} correct` : "no attempts yet"}
                    </span>
                  </div>
                  <Progress
                    value={s.percent ?? 0}
                    indicatorClassName={toneBar[s.band.tone]}
                  />
                  <div className="flex gap-2 pt-1">
                    <Link href={`/test?section=${s.section}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        Practice
                      </Button>
                    </Link>
                    <Link href={`/study/${s.section}`} className="flex-1">
                      <Button variant="ghost" size="sm" className="w-full">
                        Study
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Quick links + recent activity */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Recent activity</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.recentSessions.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="divide-y">
                {stats.recentSessions.map((s) => (
                  <Link
                    key={s.id}
                    href={`/test/${s.id}`}
                    className="flex items-center justify-between gap-3 py-3 transition-colors hover:bg-muted/50"
                  >
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">
                        {modeLabel(s.mode)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatDate(s.createdAt)} ·{" "}
                        {(JSON.parse(s.sections) as string[])
                          .map((x) => SECTIONS[x as keyof typeof SECTIONS]?.short)
                          .join(" · ")}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={s.status} />
                      <span className="w-12 text-right text-sm font-semibold tabular">
                        {s.score != null ? `${Math.round(s.score)}%` : "—"}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-3">
          <QuickLink href="/test" icon={<PencilRuler className="h-5 w-5" />} title="Take a test" desc="Full exam, single section, or untimed practice" />
          <QuickLink href="/study" icon={<BookOpen className="h-5 w-5" />} title="Study hub" desc="Concise notes across every DTOT topic" />
          <QuickLink href="/narratives" icon={<FileText className="h-5 w-5" />} title="Narratives" desc="Draft the six essays with STAR-L scoring" />
          <QuickLink href="/review" icon={<ListChecks className="h-5 w-5" />} title="Review mistakes" desc={`${stats.mistakeCount} questions to revisit`} />
        </div>
      </div>
    </div>
  );
}

function StatTile({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center gap-2 text-muted-foreground">
          {icon}
          <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
        </div>
        <div className="mt-2 text-3xl font-bold tabular">{value}</div>
        <div className="text-xs text-muted-foreground">{sub}</div>
      </CardContent>
    </Card>
  );
}

function QuickLink({
  href,
  icon,
  title,
  desc,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <Link href={href}>
      <Card className="transition-colors hover:border-primary/40 hover:bg-muted/40">
        <CardContent className="flex items-center gap-3 p-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
            {icon}
          </span>
          <div className="min-w-0 flex-1">
            <div className="font-medium">{title}</div>
            <div className="truncate text-xs text-muted-foreground">{desc}</div>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
        </CardContent>
      </Card>
    </Link>
  );
}

function EmptyState() {
  return (
    <div className="py-8 text-center">
      <p className="text-sm text-muted-foreground">
        No tests yet. Start your first timed practice to populate your dashboard.
      </p>
      <Link href="/test" className="mt-3 inline-block">
        <Button size="sm">
          <PencilRuler className="h-4 w-4" /> Start now
        </Button>
      </Link>
    </div>
  );
}

function modeLabel(mode: string) {
  if (mode === "FULL_EXAM") return "Full mock exam";
  if (mode === "SECTION") return "Single-section test";
  return "Practice set";
}

function StatusBadge({ status }: { status: string }) {
  if (status === "COMPLETED") return <Badge variant="success">Completed</Badge>;
  if (status === "EXPIRED") return <Badge variant="warning">Time expired</Badge>;
  if (status === "IN_PROGRESS") return <Badge variant="default">In progress</Badge>;
  return <Badge variant="muted">Abandoned</Badge>;
}
