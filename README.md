# Review Engine

**Turn Great Customer Experiences Into Powerful Reviews.**

A multi-tenant SaaS platform that helps businesses collect genuine, authentic customer reviews through
automated review-request campaigns, a visual automation builder, AI review analytics, and a full Super Admin
portal. Built with Next.js 16 (App Router) and PostgreSQL/Prisma — deploys cleanly to Vercel with no other
infrastructure required.

The platform never generates fake reviews, never auto-submits reviews on a customer's behalf, and never hides
legitimate negative feedback — it only makes it easier for real customers to leave real reviews.

## Tech stack

- **App**: Next.js 16 (App Router, TypeScript, Turbopack) — route handlers under `src/app/api/*` serve as the backend.
- **Database**: PostgreSQL via Prisma 7 (`prisma/schema.prisma`), driver adapter (`@prisma/adapter-pg`).
- **Auth**: Auth.js (NextAuth v5) — Google OAuth + email/password credentials, email verification, password reset.
- **Background jobs**: no queue infrastructure needed. Single-item actions (sending a review request, AI analysis,
  a manual review sync) run inline in the request that triggers them. Periodic work (advancing campaigns/automations,
  fanning out review syncs) runs via **Vercel Cron** hitting `/api/cron/tick` (see `vercel.json`) — or, if you're
  self-hosting somewhere that supports a long-lived process, `src/worker.ts` runs the same periodic logic on a
  plain `setInterval` loop. Same underlying job functions either way (`src/lib/jobs/*`).
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

### 1. Start Postgres

Either run it via Docker Compose:

```bash
docker compose up -d
```

...or use a local install (e.g. Homebrew). If you use Docker Compose, Postgres is exposed on `localhost:5433`
with user/password `reviewengine` / `reviewengine`.

### 2. Configure environment

Edit `.env` (copy from `.env.example` if you're starting fresh). At minimum, set `DATABASE_URL` to match step 1,
plus `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `APP_URL`, and `INTEGRATION_TOKEN_ENCRYPTION_KEY` (any non-empty values
work for local dev). Every other variable can stay blank — the app runs entirely in mock mode.

### 3. Install, migrate, seed

```bash
npm install
npm run db:migrate   # applies prisma/migrations and generates the client
npm run seed         # demo orgs, businesses, customers, reviews, campaigns, automation
```

The seed script prints login credentials for a super admin and two demo business owners on completion.

### 4. Run the app

```bash
npm run dev      # Next.js app on http://localhost:3000
```

Campaigns and automations advance on a schedule (`/api/cron/tick`) rather than instantly — call that route
manually during local testing (`curl http://localhost:3000/api/cron/tick`), or run `npm run worker` in a second
terminal to tick every 60 seconds automatically. Review request sends and AI analysis happen inline and don't
need either.

## Deploying to Vercel

1. **Database**: provision a hosted Postgres reachable from Vercel — Vercel Postgres, [Neon](https://neon.tech), or
   [Supabase](https://supabase.com) all work. Use the **pooled** connection string if offered (serverless functions
   open many short-lived connections).
2. **Push this repo to GitHub** and import it in the Vercel dashboard.
3. **Set environment variables** in Project → Settings → Environment Variables: `DATABASE_URL`, `NEXTAUTH_SECRET`
   (any long random string), `NEXTAUTH_URL` and `APP_URL` (your production domain, e.g. `https://your-app.vercel.app`),
   `INTEGRATION_TOKEN_ENCRYPTION_KEY` (any long random string), and `CRON_SECRET` (any long random string — Vercel
   automatically sends it as the `Authorization` header on cron requests to `/api/cron/tick`, which the route
   checks). Add any real integration keys from the table above if you have them; leave the rest blank for mock mode.
4. **Run migrations against the production database** before or right after first deploy:
   ```bash
   DATABASE_URL="<your production URL>" npx prisma migrate deploy
   DATABASE_URL="<your production URL>" npm run seed   # optional — demo data
   ```
5. **Deploy.** `vercel.json` already configures the cron job that advances campaigns/automations every 5 minutes —
   check your Vercel plan's minimum cron interval and adjust the schedule in `vercel.json` if needed.

No Redis, no separate worker process, and nothing else to provision — the whole app runs on Vercel + one Postgres
database.

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
  jobs/                      Background job implementations — called inline from API routes
                             for single-item actions, or periodically from /api/cron/tick
                             (Vercel Cron) / src/worker.ts (self-hosted)
  tenant.ts, rbac.ts, api.ts Multi-tenant auth/RBAC/audit/rate-limit plumbing
src/components/            Design system (ui/), and feature components per module
src/worker.ts               Optional self-hosted alternative to Vercel Cron (npm run worker)
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
