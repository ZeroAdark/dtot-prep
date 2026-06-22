import { prisma } from "./prisma";

// Accounts with no authenticated activity for this many days are deleted. A
// user's lastSeenAt is bumped on login/registration and (throttled) on every
// authenticated request, so "inactive" means genuinely unused — not merely
// "hasn't logged in again" (a live 30-day session still counts as activity).
export const INACTIVE_DAYS = 30;

const DAY_MS = 24 * 60 * 60 * 1000;
const SWEEP_INTERVAL_MS = DAY_MS; // run daily

/**
 * Delete accounts inactive for more than INACTIVE_DAYS. Cascades (per the schema)
 * to the user's sessions, test sessions, responses, narratives, and study
 * progress. Rows with a null lastSeenAt are NOT matched (so a brand-new account
 * mid-registration can never be swept).
 */
export async function deleteInactiveUsers(): Promise<number> {
  const cutoff = new Date(Date.now() - INACTIVE_DAYS * DAY_MS);
  const { count } = await prisma.user.deleteMany({
    where: { lastSeenAt: { lt: cutoff } },
  });
  return count;
}

let started = false;

/**
 * Start the recurring inactive-account sweep. Call once at server startup
 * (from instrumentation.ts). Idempotent.
 */
export function startInactiveUserSweep(): void {
  if (started) return;
  started = true;

  const run = async () => {
    try {
      // Backfill any rows that never recorded activity (e.g. existing accounts
      // the moment this column was added) so they get a fair INACTIVE_DAYS
      // window from now rather than being deleted immediately. After the first
      // pass this is a no-op.
      await prisma.user.updateMany({
        where: { lastSeenAt: null },
        data: { lastSeenAt: new Date() },
      });
      const removed = await deleteInactiveUsers();
      if (removed > 0) {
        console.log(`[maintenance] removed ${removed} inactive account(s)`);
      }
    } catch (e) {
      console.error("[maintenance] inactive-account sweep failed", e);
    }
  };

  // Run shortly after boot (let the app settle first), then once a day.
  setTimeout(run, 60_000);
  setInterval(run, SWEEP_INTERVAL_MS);
}
