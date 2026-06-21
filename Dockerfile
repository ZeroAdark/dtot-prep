# DTOT Prep — production image (Next.js 14 + Prisma/SQLite)
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
RUN npm ci --include=dev --no-audit --no-fund

# Build (the build script runs `prisma generate && next build`).
COPY . .
RUN npm run build

ENV NODE_ENV=production
EXPOSE 3000

COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["node", "node_modules/next/dist/bin/next", "start", "-H", "0.0.0.0", "-p", "3000"]
