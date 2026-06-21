"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  PencilRuler,
  BookOpen,
  FileText,
  ListChecks,
  ShieldCheck,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/test", label: "Practice", icon: PencilRuler },
  { href: "/study", label: "Study Hub", icon: BookOpen },
  { href: "/narratives", label: "Narratives", icon: FileText },
  { href: "/review", label: "Review", icon: ListChecks },
];

export function Nav({ user }: { user: { id: string; name: string } | null }) {
  const pathname = usePathname();
  const [signingOut, setSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState(false);

  async function signOut() {
    setSigningOut(true);
    setSignOutError(false);
    try {
      const res = await fetch("/api/session", { method: "DELETE" });
      if (!res.ok) throw new Error();
      // Hard navigation guarantees a fresh server render with the cookie gone
      // (a soft refresh can keep the stale logged-in tree mounted).
      window.location.assign("/");
    } catch {
      // Only reached if the cookie was NOT cleared, so stay put and let the user retry.
      setSigningOut(false);
      setSignOutError(true);
    }
  }

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

        {user && (
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <div className="text-sm font-medium leading-none">{user.name}</div>
              <div className="text-[11px] text-muted-foreground">Candidate</div>
            </div>
            {signOutError && (
              <span className="hidden text-xs text-destructive md:inline" role="alert">
                Couldn’t log out — retry
              </span>
            )}
            <button
              onClick={signOut}
              disabled={signingOut}
              title="Log out and switch profile"
              className="flex h-9 items-center gap-1.5 rounded-md px-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-60"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">{signingOut ? "Logging out…" : "Log out"}</span>
            </button>
          </div>
        )}
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
