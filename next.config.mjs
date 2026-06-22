// Security response headers applied to every route. Note: script-src/style-src
// are intentionally NOT locked here — Next.js injects inline bootstrap scripts
// and Tailwind injects inline styles, so a strict default-src/script-src CSP
// would break hydration without a per-request nonce. The directives below
// (frame-ancestors/base-uri/object-src/form-action) are safe to enforce and
// kill the clickjacking vector; X-Frame-Options backs up frame-ancestors for
// older browsers.
const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Content-Security-Policy",
    value:
      "frame-ancestors 'none'; base-uri 'self'; object-src 'none'; form-action 'self'",
  },
  // Honored only by browsers reaching the origin over HTTPS (the public origin
  // via Cloudflare); harmless over plain-http LAN access.
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains",
  },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // No ESLint config is shipped; skip lint during `next build` (type-checking
  // still runs and will fail the build on real type errors).
  eslint: { ignoreDuringBuilds: true },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
