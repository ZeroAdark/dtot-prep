"use client";

import { useState } from "react";
import { LogOut, Trash2, ChevronDown, Loader2, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Panel = "closed" | "menu" | "delete";

export function AccountMenu({ user }: { user: { id: string; name: string } }) {
  const [panel, setPanel] = useState<Panel>("closed");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function close() {
    setPanel("closed");
    setPassword("");
    setError(null);
  }

  async function logout() {
    setBusy(true);
    try {
      await fetch("/api/session", { method: "DELETE" });
    } finally {
      window.location.assign("/");
    }
  }

  async function deleteAccount(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/account", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Could not delete the account.");
        setBusy(false);
        return;
      }
      window.location.assign("/");
    } catch {
      setError("Network error. Please try again.");
      setBusy(false);
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setPanel(panel === "closed" ? "menu" : "closed")}
        className="flex h-9 items-center gap-2 rounded-md px-2 text-left transition-colors hover:bg-muted"
        aria-haspopup="menu"
        aria-expanded={panel !== "closed"}
      >
        <span className="hidden leading-none sm:block">
          <span className="block text-sm font-medium">{user.name}</span>
          <span className="block text-[11px] text-muted-foreground">Candidate</span>
        </span>
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary sm:hidden">
          <UserRound className="h-4 w-4" />
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-muted-foreground transition-transform",
            panel !== "closed" && "rotate-180",
          )}
        />
      </button>

      {panel !== "closed" && (
        <>
          {/* click-away backdrop */}
          <button
            type="button"
            aria-hidden="true"
            tabIndex={-1}
            onClick={close}
            className="fixed inset-0 z-40 cursor-default"
          />
          <div className="absolute right-0 z-50 mt-2 w-72 overflow-hidden rounded-lg border bg-card shadow-lg">
            {panel === "menu" ? (
              <div className="p-1.5">
                <div className="px-3 py-2">
                  <div className="truncate text-sm font-medium">{user.name}</div>
                  <div className="text-xs text-muted-foreground">Signed in</div>
                </div>
                <div className="my-1 border-t" />
                <button
                  onClick={logout}
                  disabled={busy}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-muted disabled:opacity-60"
                >
                  {busy ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <LogOut className="h-4 w-4" />
                  )}
                  Log out
                </button>
                <button
                  onClick={() => {
                    setError(null);
                    setPanel("delete");
                  }}
                  disabled={busy}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-60"
                >
                  <Trash2 className="h-4 w-4" /> Delete account
                </button>
              </div>
            ) : (
              <form onSubmit={deleteAccount} className="p-4">
                <div className="text-sm font-semibold text-destructive">
                  Delete your account?
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  This permanently erases this profile and all of its tests,
                  answers, and narratives. Enter your password to confirm.
                </p>
                <input
                  type="password"
                  value={password}
                  autoComplete="current-password"
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  disabled={busy}
                  className="mt-3 h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
                  autoFocus
                />
                {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
                <div className="mt-3 flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setPanel("menu")}
                    disabled={busy}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="destructive"
                    size="sm"
                    disabled={busy || !password}
                  >
                    {busy ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Deleting…
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4" /> Delete
                      </>
                    )}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </>
      )}
    </div>
  );
}
