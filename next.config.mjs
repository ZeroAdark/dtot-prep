/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // No ESLint config is shipped; skip lint during `next build` (type-checking
  // still runs and will fail the build on real type errors).
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
