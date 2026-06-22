import { NextRequest } from "next/server";

/**
 * Same-origin check for state-changing API requests (defense-in-depth against
 * CSRF — including login CSRF, which SameSite=lax does NOT prevent because a
 * fresh Set-Cookie on a top-level POST still lands).
 *
 * A cross-origin browser request always carries an Origin header, so we reject
 * when Origin is present and its hostname doesn't match the request host (or an
 * explicitly configured APP_ORIGIN). Requests with no Origin (curl, native
 * apps, some same-origin GETs) are allowed — this guards browsers, not the API
 * contract. Hostnames are compared without the port to stay robust across the
 * proxy chain (Cloudflare Tunnel → Caddy → app).
 */
export function sameOrigin(req: NextRequest): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return true;

  let originHost: string;
  try {
    originHost = new URL(origin).hostname;
  } catch {
    return false;
  }

  const allowed = new Set<string>();
  const host = req.headers.get("host");
  if (host) allowed.add(host.split(":")[0]);
  const appOrigin = process.env.APP_ORIGIN;
  if (appOrigin) {
    try {
      allowed.add(new URL(appOrigin).hostname);
    } catch {
      /* ignore malformed env */
    }
  }
  return allowed.has(originHost);
}
