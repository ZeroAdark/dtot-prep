# DTOT Prep — Diplomatic Technology Officer Test study & practice app

A full-stack study and practice environment for the **Diplomatic Technology
Officer Test (DTOT)**. It includes a timed, server-authoritative test engine,
instant auto-grading with rationale, a STAR-L narrative workspace, and a
readiness dashboard.

> Independent study tool. Not affiliated with or endorsed by any government agency.

---

## Features

- **Four DTOT components**
  - **Job Knowledge** — computer hardware, operating systems, IT & telecom/networking, cybersecurity, mobile devices, troubleshooting, operational procedures, radio systems, PBX/VoIP, cloud, and data analytics (CompTIA A+/Network+/Security+ scope).
  - **Situational Judgment** — embassy crisis, ethics, and prioritization scenarios.
  - **English Expression** — grammar, syntax, usage, and professional communication.
  - **Personal Narratives** — the six required essays with a **STAR-L** self-scoring rubric.
- **Strict timed engine** — a global exam countdown **plus** per-section timers that
  automatically lock and force-submit a section when its time runs out.
- **Refresh-proof timers** — deadlines are absolute timestamps persisted in the
  database (and mirrored to `localStorage`). Refreshing, closing the tab, or
  navigating away never resets the clock; the server enforces expiry independently.
- **Instant auto-grading** for all multiple-choice sections, with correct/incorrect
  breakdown, per-option notes, detailed rationale, and study references.
- **Resume anything** — unfinished tests and narrative drafts are saved automatically.
- **Dashboard** — per-section readiness scores, overall readiness ring, accuracy,
  and recent activity.
- **Mistake review** — every wrong or skipped question collects in one place.

## Tech stack

- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS** with a shadcn/ui-style component layer
- **Prisma ORM** — **SQLite** by default (zero setup); **PostgreSQL**-ready
- **lucide-react** icons

---

## Getting started

Requirements: **Node.js 18+** (Node 24 used in development).

```bash
npm install          # installs deps and generates the Prisma client
npm run setup        # creates the SQLite DB schema and seeds questions/study content
npm run dev          # start the dev server
```

Open <http://localhost:3000>, enter a name to create your local candidate
profile, and start practicing. (`npm install` already runs `prisma generate` via
`postinstall`, and `npm run setup` runs generate + `db push` + seed.)

### Useful scripts

| Script             | What it does                                        |
| ------------------ | --------------------------------------------------- |
| `npm run dev`      | Start the development server                         |
| `npm run build`    | Production build (also type-checks)                  |
| `npm start`        | Run the production build                             |
| `npm run setup`    | `prisma generate` + `db push` + seed                |
| `npm run db:seed`  | Re-seed questions and study materials               |
| `npm run db:reset` | Drop, recreate, and re-seed the database            |

---

## Run with Docker

A production image and `docker-compose.yml` are included. The app runs behind a
reverse proxy and publishes only to the host loopback; SQLite persists in the
named volume `dtot-data` (the entrypoint seeds it on first run, and preserves it
across rebuilds).

```bash
docker compose up -d --build
# app is now on http://127.0.0.1:3000  → front it with a reverse proxy
```

Update later with `docker compose up -d --build` (the volume keeps your data).
Manage with `docker compose ps`, `docker compose logs -f`, `docker compose restart`.

---

## Switching to PostgreSQL

The schema is written to be portable — switching is a one-line change.

1. Start Postgres (included as a compose profile):

   ```bash
   docker compose --profile postgres up -d
   ```

2. Point Prisma at Postgres — either edit the `datasource` `provider` in
   `prisma/schema.prisma` to `"postgresql"`, or copy the ready-made variant:

   ```bash
   cp prisma/schema.postgres.prisma prisma/schema.prisma
   ```

3. Set the URL in `.env`:

   ```env
   DATABASE_URL="postgresql://dtot:dtot@localhost:5432/dtot?schema=public"
   ```

4. Re-create and seed:

   ```bash
   npm run setup
   ```

JSON-shaped fields (option lists, key points, rubric state) are stored as
serialized JSON in `String` columns, so the schema is identical on both
databases except for the `provider` line.

---

## Architecture

```
prisma/
  schema.prisma            SQLite schema (default)
  schema.postgres.prisma   Identical schema, postgresql provider
  seed.ts                  DTOT question bank + study materials + demo user
src/
  lib/
    constants.ts           Sections, timing, competencies, STAR-L rubric
    engine.ts              Session creation, timer enforcement, grading
    grading.ts             MC auto-grading, rubric scoring, readiness bands
    stats.ts               Dashboard aggregation
    auth.ts                Cookie-based local candidate profile
    prisma.ts, utils.ts, serialize.ts, useCountdown.ts
  app/
    page.tsx               Dashboard (or welcome/sign-in)
    test/                  Test setup + live runner + results
    study/                 Study hub + per-section guides
    narratives/            STAR-L narrative workspace
    review/                Mistake review
    api/                   session, tests, tests/[id], responses, narratives
  components/              UI primitives + feature components
```

### Data model (execution step 1)

`users`, `questions`, `study_materials`, `test_sessions` (with `start_time`,
`deadline_at`, `elapsed_time`, `total_duration_sec`), `section_states`
(per-section timer + lock state), `user_responses`, and `narratives`.

### Timer integrity (execution step 3)

When a session is created, the server records absolute `deadlineAt` timestamps
for the whole exam and for the active section. The client computes remaining time
from these timestamps (so a refresh can't reset it), while
`enforceTimers()` runs on every load and autosave to lock expired sections and
finalize expired exams server-side — even if the browser is closed.
