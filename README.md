# Review Engine

**Turn Great Customer Experiences Into Powerful Reviews.**

A multi-tenant SaaS platform that helps businesses collect genuine, authentic customer reviews through
automated review-request campaigns, a visual automation builder, AI review analytics, and a full Super Admin
portal. Built with Next.js 16 (App Router), PostgreSQL/Prisma, and BullMQ/Redis.

The platform never generates fake reviews, never auto-submits reviews on a customer's behalf, and never hides
legitimate negative feedback — it only makes it easier for real customers to leave real reviews.

## Tech stack

- **App**: Next.js 16 (App Router, TypeScript, Turbopack) — route handlers under `src/app/api/*` serve as the backend.
- **Database**: PostgreSQL via Prisma 7 (`prisma/schema.prisma`), driver adapter (`@prisma/adapter-pg`).
- **Auth**: Auth.js (NextAuth v5) — Google OAuth + email/password credentials, email verification, password reset.
- **Background jobs**: BullMQ + Redis (`src/worker.ts`) — review-request sends, campaign engine, automation engine, AI analysis.
- **UI**: Tailwind CSS v4 + a small custom design system (`src/components/ui`), Recharts, React Flow (automation builder), Framer Motion.

## Integrations — real, with mock fallback

Every third-party integration lives behind an adapter in `src/lib/integrations/*` and runs in a clearly-labeled
**mock mode** until you supply real credentials — no code changes needed later, just set the env var.

| Integration | Env var(s) | Mock behavior without a key |
|---|---|---|
| Google Places (business search) | `GOOGLE_PLACES_API_KEY` | Returns seeded sample businesses, tagged `mock: true` |
| Google OAuth (login) | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | "Continue with Google" is hidden |
| Email (Resend) | `RESEND_API_KEY` | Logs the message and records it as `SIMULATED` |
| SMS / WhatsApp (Twilio) | `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_SMS_FROM`, `TWILIO_WHATSAPP_FROM` | Same as email |
| AI insights (Anthropic) | `ANTHROPIC_API_KEY` | Falls back to a deterministic keyword/rating heuristic, clearly labeled |
| Billing (Stripe) | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PUBLISHABLE_KEY` | Dev-only plan switcher, never touches real money |

## Local setup

### 1. Start Postgres + Redis

Either run them via Docker Compose:

```bash
docker compose up -d
```

...or use local installs (e.g. Homebrew). If you use Docker Compose, Postgres is exposed on `localhost:5433`
with user/password `reviewengine` / `reviewengine`.

### 2. Configure environment

```bash
cp .env.example .env   # if present, otherwise edit .env directly
```

At minimum, set `DATABASE_URL` and `REDIS_URL` to match step 1. Every other variable can stay blank — the app
runs entirely in mock mode.

### 3. Install, migrate, seed

```bash
npm install
npm run db:migrate   # applies prisma/migrations and generates the client
npm run seed         # demo orgs, businesses, customers, reviews, campaigns, automation
```

The seed script prints login credentials for a super admin and two demo business owners on completion.

### 4. Run the app and the worker (two terminals)

```bash
npm run dev      # Next.js app on http://localhost:3000
npm run worker   # background job processor — required for sending review requests,
                  # running campaigns/automations, and AI analysis
```

Background jobs are enqueued by the app but processed by `worker.ts` — review requests, campaign steps, and
automation ticks will queue up but never execute unless the worker is running.

## Golden path to try

1. `/` → **Find My Business** → `/search` (seeded mock businesses if no Google API key)
2. Select a business → `/business/[placeId]` → **Get More Reviews**
3. Create an account (or log in as a seeded demo owner, see below) → onboarding wizard
4. `/dashboard` → Customers → add or import → send a review request
5. `/dashboard/campaigns` → create/launch a campaign, or `/dashboard/automations` → build a node-based follow-up flow
6. `/dashboard/insights` → run AI sentiment analysis on real review text
7. Log in as the seeded super admin at `/admin` → global dashboard, businesses, activity, analytics, system health, audit logs

### Seeded demo accounts (after `npm run seed`)

| Role | Email | Password |
|---|---|---|
| Super Admin | `admin@reviewengine.app` | `Admin123!` |
| Business owner (ABC Restaurant Group) | `owner@abcrestaurant.com` | `Password123!` |
| Business owner (Skyline Realty Group) | `owner@skylinerealty.com` | `Password123!` |

## Project structure

```
prisma/schema.prisma       Full multi-tenant data model + seed script
src/app/                   Pages and API routes (App Router)
  (marketing)               Landing, search, business preview
  auth/                      Signup, login, verify, password reset
  onboarding/                4-step onboarding wizard
  dashboard/                 The product: customers, campaigns, automations, reviews, insights, settings…
  admin/                     Super Admin portal (separate layout + auth guard)
  r/[token]/                 Public review-link landing page customers click
  api/                       Route handlers backing the above
src/lib/
  integrations/              Pluggable provider adapters (see table above)
  jobs/                      Background job implementations, run by src/worker.ts
  tenant.ts, rbac.ts, api.ts Multi-tenant auth/RBAC/audit/rate-limit plumbing
src/components/            Design system (ui/), and feature components per module
src/worker.ts               BullMQ worker entrypoint (npm run worker)
```

## Known simplifications

Given the scope of this build, a few areas are real and functional but intentionally simpler than a mature
product — worth hardening in a follow-up pass:

- **Google Business Profile connection** (onboarding step 3) marks the integration connected without a full
  Google Business Profile OAuth consent flow — the adapter and schema support wiring in the real flow later.
- **Rate limiting** is in-process (per server instance) — swap for a Redis-backed limiter before running more
  than one app instance behind a load balancer.
- **Team invites** create a placeholder `User` row on invite and activate the membership on the invitee's first
  authenticated request, rather than a dedicated invitations table.
