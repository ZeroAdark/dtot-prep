"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  PencilRuler,
  BookOpen,
  FileText,
  ListChecks,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AccountMenu } from "@/components/AccountMenu";

const LINKS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/test", label: "Practice", icon: PencilRuler },
  { href: "/study", label: "Study Hub", icon: BookOpen },
  { href: "/narratives", label: "Narratives", icon: FileText },
  { href: "/review", label: "Review", icon: ListChecks },
];

export function Nav({ user }: { user: { id: string; name: string } | null }) {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");

  return (
    <header className="sticky top-0 z-30 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <ShieldCheck className="h-5 w-5" />
          </span>
          <span className="leading-tight">
            <span className="block text-base font-bold tracking-tight">
              DTOT Prep
            </span>
            <span className="block text-[11px] text-muted-foreground">
              Diplomatic Technology Officer Test
            </span>
          </span>
        </Link>

        {user && (
          <nav className="hidden items-center gap-1 md:flex">
            {LINKS.map((l) => {
              const Icon = l.icon;
              const active = isActive(l.href, l.exact);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={cn(
                    "flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {l.label}
                </Link>
              );
            })}
          </nav>
        )}

        {user && <AccountMenu user={user} />}
      </div>

      {/* Mobile nav */}
      {user && (
        <nav className="flex items-center gap-1 overflow-x-auto border-t px-3 py-2 md:hidden">
          {LINKS.map((l) => {
            const active = isActive(l.href, l.exact);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground",
                )}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
      )}
    </header>
  );
}
