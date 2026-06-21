# DTOT Prep — Diplomatic Technology Officer Test study & practice app

A full-stack study and practice environment for the **Diplomatic Technology
Officer Test (DTOT)** — the written assessment in the U.S. Department of State's
selection process for Foreign Service Diplomatic Technology Officers.

It pairs a **timed, server-authoritative test engine** (with instant auto-grading
and a readiness dashboard) with a deep, **interactive study hub** — 71 guides and
1,100+ flashcards spanning every Job Knowledge topic.

> Independent study tool. Not affiliated with or endorsed by any government
> agency. The exam's actual content is confidential; this app is built from the
> public role description and the CompTIA knowledge domains it maps to.

---

## Features

### The four DTOT components
- **Job Knowledge** — scoped to the real test target (**CompTIA A+ / Network+ /
  Security+** level) plus the State-specific infrastructure of the DTO role:
  computer hardware, operating systems, IT & telecommunications/networking,
  structured cabling & site infrastructure, mobile devices, cybersecurity,
  IT troubleshooting, operational procedures, radio systems, PBX/VoIP
  convergence, cloud computing, and data analytics.
- **Situational Judgment** — embassy crisis, ethics, prioritization, teamwork,
  and security-compliance scenarios judged against Foreign Service values.
- **English Expression** — grammar, punctuation, usage, syntax, and professional
  communication.
- **Personal Narratives** — the six required essays with a **STAR-L** self-scoring
  rubric and word-count guidance.

### Test engine
- **Strict timed engine** — a global exam countdown **plus** per-section timers
  that automatically lock and force-submit a section when its time runs out.
- **Refresh-proof timers** — deadlines are absolute timestamps persisted in the
  database (and mirrored to `localStorage`). Refreshing, closing the tab, or
  navigating away never resets the clock; the server enforces expiry independently.
- **Instant auto-grading** for all multiple-choice sections, with correct/incorrect
  breakdown, per-option notes, detailed rationale, and study references.
- **Resume anything** — unfinished tests and narrative drafts autosave.
- **Smart question selection** — a stratified, history-weighted algorithm favors
  unseen and previously-missed questions, so repeated practice keeps surfacing
  fresh material from the pool.

### Interactive study hub
- **71 guides** across all topics, each with three tabs:
  - **Read** — exam-grade notes with key takeaways.
  - **Flashcards** — a flip-card deck (shuffle / next / prev) — **1,100+ cards**.
  - **Quick check** — a self-test drawn live from the question bank for that
    guide's topic, with instant feedback and rationale.
- **Mark-as-studied progress** per profile, with per-section and per-topic
  progress bars, plus guide search.

### Profiles & dashboard
- **Multiple local profiles** — a profile picker to create a new candidate, log
  in to an existing one, or delete one (with confirmation). Proper login/logout.
  No password — these are local practice profiles on your device.
- **Dashboard** — per-section readiness scores, an overall readiness ring,
  accuracy, recent activity, and narrative progress.
- **Mistake review** — every wrong or skipped question collects in one place.

### Content at a glance
| Section | Questions | Study guides |
| ------- | --------: | -----------: |
| Job Knowledge | 399 | 53 |
| Situational Judgment | 36 | 9 |
| English Expression | 76 | 9 |
| **Total** | **511** | **71** (+ 1,114 flashcards) |

---

## Tech stack

- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS** with a shadcn/ui-style component layer
- **Prisma ORM** — **SQLite** by default (zero setup); **PostgreSQL**-ready
- **lucide-react** icons

---

## Getting started

Requirements: **Node.js 18+** (developed on Node 20/24).

```bash
npm install          # installs deps and generates the Prisma client
npm run setup        # creates the SQLite DB schema and seeds questions/study content
npm run dev          # start the dev server
```

Open <http://localhost:3000>, create a candidate profile (or pick an existing
one — no password required), and start practicing. (`npm install` runs
`prisma generate` via `postinstall`; `npm run setup` runs generate + `db push` +
seed.)

### Scripts

| Script                    | What it does                                              |
| ------------------------- | -------------------------------------------------------- |
| `npm run dev`             | Start the development server                              |
| `npm run build`           | Production build (also type-checks)                       |
| `npm start`               | Run the production build                                  |
| `npm run lint`            | Lint the project                                          |
| `npm run setup`           | `prisma generate` + `db push` + full seed                |
| `npm run db:seed`         | Re-seed questions + study materials (keeps users)        |
| `npm run db:reset`        | Drop, recreate, and re-seed the database                 |
| `npm run db:seed:study`   | Refresh **study guides only** (safe on a live DB)        |
| `npm run db:sync:questions` | Add new questions whose prompt is absent (idempotent)  |
| `npm run db:cleanup`      | Prune out-of-scope questions (idempotent)                |

The last three are content-management helpers: they update study/question
content on an existing database **without** wiping candidate data, and the Docker
entrypoint runs them automatically on each deploy (see below).

### Content authoring

Study guides live as JSON in `prisma/study/*.json` (one file per topic) and load
via `prisma/study-data.ts`. Extra question banks live in `prisma/questions/*.json`
(loaded via `prisma/questions-extra.ts`). Add or edit a file, then run the
matching content script — no schema or code changes needed.

---

## Run with Docker

A production `Dockerfile` and `docker-compose.yml` are included. SQLite persists
in the named volume `dtot-data` (the entrypoint seeds it on first run and
preserves it across rebuilds).

The bundled compose is wired for a **multi-app host**: the app publishes **no
host ports** and attaches to a shared external `edge` network, expecting a
reverse proxy (e.g. Caddy) in front of it. Both the network and the data volume
are declared `external`, so create them once:

```bash
docker network create edge          # shared reverse-proxy network
docker volume create dtot-data      # persistent SQLite volume
docker compose up -d --build        # build & start; reach it via your edge proxy → dtot:3000
```

> **Standalone (no edge proxy)?** Add a port mapping to the `app` service —
> `ports: ["3000:3000"]` — and reach it on <http://localhost:3000>. For plain
> local development, `npm run dev` is simpler.

On every start the entrypoint: applies the schema (`prisma db push`), and then —
on a **first run** seeds the database, or on an **existing** database refreshes
study guides, syncs any new questions, and prunes out-of-scope ones. Candidate
data (profiles, responses, narratives) is preserved across deploys.

> **Note:** `docker compose up --build` ships your repo via `git archive`/`tar`,
> which adds and overwrites files but does **not** delete files you removed from
> the repo. If you delete content files (e.g. study/question JSON), remove the
> stale copies from the build context before rebuilding.

Update later with `docker compose up -d --build`; manage with
`docker compose ps`, `docker compose logs -f`, `docker compose restart`.

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

JSON-shaped fields (option lists, key points, flashcards, rubric state) are
stored as serialized JSON in `String` columns, so the schema is identical on both
databases except for the `provider` line.

---

## Architecture

```
prisma/
  schema.prisma            SQLite schema (default)
  schema.postgres.prisma   Identical schema, postgresql provider
  seed.ts                  Base seed: question bank + study materials + demo user
  seed-extra*.ts, jk3-*.ts Additional question banks (spread into the base seed)
  study-data.ts            Loads study guides from prisma/study/*.json
  study/*.json             Study-guide content (one file per topic)
  questions-extra.ts       Loads extra questions from prisma/questions/*.json
  questions/*.json         Topic-matched question banks
  seed-study.ts            Idempotent refresh of study materials only
  seed-questions-sync.ts   Idempotent add of questions whose prompt is absent
  seed-cleanup.ts          Idempotent prune of out-of-scope question topics
src/
  lib/
    constants.ts           Sections, exam timing, competencies, STAR-L rubric
    engine.ts              Session creation, timer enforcement, grading
    selection.ts           Stratified, history-weighted question selection
    grading.ts             MC auto-grading, rubric scoring, readiness bands
    stats.ts               Dashboard aggregation
    auth.ts                Cookie-based local profiles (list / login / delete)
    sectionStyle.ts, types.ts, serialize.ts, useCountdown.ts, prisma.ts, utils.ts
  app/
    page.tsx               Dashboard (signed in) or profile picker (signed out)
    test/                  Test setup + live runner + results
    study/                 Study hub + interactive per-section guides
    narratives/            STAR-L narrative workspace
    review/                Mistake review
    api/                   session, profiles/[id], tests, tests/[id], responses,
                           narratives, study/quiz, study/progress
  components/              UI primitives + feature components (TestRunner,
                          StudyGuide, Flashcards, StudyQuickCheck, profile picker…)
Dockerfile, docker-entrypoint.sh, docker-compose.yml
```

### Data model

`users`, `questions`, `study_materials`, `study_progress` (per-profile
mark-as-studied), `test_sessions` (with `start_time`, `deadline_at`,
`elapsed_time`, `total_duration_sec`), `section_states` (per-section timer + lock
state), `user_responses`, and `narratives`.

### Timer integrity

When a session is created, the server records absolute `deadlineAt` timestamps
for the whole exam and for the active section. The client computes remaining time
from those timestamps (so a refresh can't reset it), while `enforceTimers()` runs
on every load and autosave to lock expired sections and finalize expired exams
server-side — even if the browser is closed.

---

## License

MIT © 2026 Adrian Ortiz. See [LICENSE](LICENSE).
