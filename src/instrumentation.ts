// Next.js runs register() once when the server process starts (Node runtime
// only — not Edge, not the browser). We use it to kick off the recurring
// inactive-account cleanup sweep.
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { startInactiveUserSweep } = await import("./lib/maintenance");
    startInactiveUserSweep();
  }
}
