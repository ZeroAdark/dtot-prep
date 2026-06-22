# DTOT Prep — production image (Next.js 15 + Prisma/SQLite)
FROM node:22-slim

# OpenSSL + CA certs are required by Prisma's query engine.
RUN apt-get update \
 && apt-get install -y --no-install-recommends openssl ca-certificates \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# SQLite database lives on a mounted volume at /data (see docker-compose.yml).
ENV DATABASE_URL="file:/data/app.db"

# Install all dependencies (dev deps are needed for the build and for the
# migrate/seed step the entrypoint runs).
COPY package.json package-lock.json ./
# Schema is needed because the postinstall hook runs `prisma generate`.
COPY prisma/schema.prisma ./prisma/schema.prisma
RUN npm ci --include=dev --no-audit --no-fund

# Build (the build script runs `prisma generate && next build`).
COPY . .
RUN npm run build

ENV NODE_ENV=production
EXPOSE 3000

COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Drop privileges: run as the image's built-in non-root `node` user (UID 1000)
# so a future RCE in Node/Next/Prisma doesn't yield in-container root. /app and
# /data are chowned so the build output and the entrypoint's DB seed/migrate are
# writable; a freshly-created named volume inherits /data's ownership.
RUN mkdir -p /data && chown -R node:node /app /data
USER node

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["node", "node_modules/next/dist/bin/next", "start", "-H", "0.0.0.0", "-p", "3000"]
