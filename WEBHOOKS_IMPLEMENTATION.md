# Webhooks Implementation — Passify

Outbound webhooks for Passify. This document separates **fully implemented**
functionality from **infrastructure-dependent** activation, per the honesty
requirement: background retries are NOT operational until a scheduler is
configured, and the database tables must be migrated before the feature is live.

---

## Fully implemented (code complete, tested, verified)

### Data model
- `webhook_endpoints` (url, signing secret, description, subscribed events, active flag)
- `webhook_events` (event id `evt_…`, type, payload)
- `webhook_deliveries` (status, attempts, response status, error, next_retry_at, last_attempt_at)
- Migration file generated: `drizzle/migrations/0001_robust_zombie.sql` (Postgres) and matching SQLite table defs. **Not applied automatically.**

### Signing & verification (`src/lib/webhooks/signing.ts`)
- HMAC-SHA256, header `Passify-Signature: t=<unix>,v1=<hex>`.
- Signed payload `${t}.${rawBody}`.
- Constant-time comparison; timestamp tolerance (replay protection).
- Secret generation (`whsec_…`).

### Delivery (`src/lib/webhooks/delivery.ts`)
- Signs body; sets `Passify-Signature`, `Passify-Event-Id`, `Passify-Event-Type`, `Passify-Timestamp`.
- `AbortController` timeout; success = `2xx`; returns structured result. `fetch` injectable for tests.

### Dispatch + retry (`src/lib/webhooks/dispatch.ts`, `retry.ts`)
- `dispatchWebhookEvent(type, payload)`: persists the event, fans out to active + subscribed endpoints, creates delivery rows, makes inline attempts. Best-effort (never throws into the request path).
- Exponential backoff (10s→1h cap), up to 6 attempts; `processDueRetries()` worker; `replayDelivery()`.
- Event filtering via `subscriptionMatches` (`"*"` or exact).

### Event emission (real sources)
- `attestation.issued` and `kyc.status_changed` — emitted from `POST /api/kyc/webhook`.
- `rule.updated` — emitted from `PATCH /api/rules/[slug]`.

### Management API (dashboard-authenticated)
- `GET/POST/PATCH/DELETE /api/webhooks` — list, create (secret shown once), enable/disable, rotate secret, change events, delete. Secrets never returned in list responses.
- `GET /api/webhooks/deliveries` — recent deliveries.
- `POST /api/webhooks/replay` — re-queue + attempt a delivery inline (no scheduler needed).

### Dashboard UI (`/webhooks`)
- Create / delete endpoints, rotate signing secret, enable/disable, select events, view delivery history, replay failed deliveries. Shows a clear banner if the tables aren't migrated yet.

### SDK (`@passify/sdk`)
- `webhooks.verifySignature({ secret, payload, signature, toleranceSeconds? })` — Web Crypto, browser + Node, constant-time, replay-window aware.

### Documentation
- `/docs/guides/webhooks` — supported events, payload/headers, signature verification in **curl, TypeScript, JavaScript, Python, Go**, replay protection, retry behavior.

### Tests (23 webhook-related, all passing)
- Valid signature, invalid signature, tampered body, timestamp drift, malformed header, deterministic signature.
- Event filtering (wildcard/exact), event-type validation.
- Retry scheduling (backoff curve, next-retry, exhaustion), success classification.
- Delivery: 2xx success, 5xx failure, network error, canonical body, signed-header round-trip.
- SDK verify: valid, wrong secret, tampered payload, drift, malformed, idempotent, HMAC interop.

---

## Infrastructure-dependent (NOT active until provisioned)

| Capability | Status | What activates it |
|---|---|---|
| Tables exist in production | ❌ not applied | Run the Supabase migration (below). |
| **Automatic** background retries | ❌ not running | Configure a scheduler (Vercel Cron) + `CRON_SECRET`. |

Until the migration is applied, endpoint management and dispatch are inert
(dispatch fails best-effort and is swallowed; the dashboard shows a "tables not
migrated" banner). Until a scheduler runs `/api/cron/webhook-retry`, only
**inline** delivery attempts and **manual replay** occur — failed deliveries
wait in `pending` with a `next_retry_at` but are not retried automatically.

---

## Production deployment checklist

- [ ] Apply the database migration to production (see below).
- [ ] Set `CRON_SECRET` in the Vercel project environment.
- [ ] Confirm `vercel.json` cron is picked up (Vercel → Project → Settings → Cron Jobs).
- [ ] Create a test endpoint in the dashboard pointing at a receiver you control.
- [ ] Trigger an event (e.g. a KYC approval) and confirm a signed delivery arrives.
- [ ] Verify the signature on your receiver using the published secret.
- [ ] Force a failure (return 500) and confirm the delivery is scheduled, then replay it.

## Vercel Cron configuration

`vercel.json` already declares:

```json
{ "crons": [ { "path": "/api/cron/webhook-retry", "schedule": "0 3 * * *" } ] }
```

- The schedule is **daily** because Vercel's Hobby plan limits cron frequency to
  once per day. On a **Pro** plan, change it to `*/5 * * * *` (every 5 minutes)
  for production-grade retry cadence — or point an external scheduler
  (e.g. cron-job.org, GitHub Actions) at the endpoint instead.
- Set `CRON_SECRET` (any long random string) in the Vercel project env. Vercel Cron
  sends it as `Authorization: Bearer <CRON_SECRET>`; the endpoint fails closed
  (503) in production if the secret is unset, and 401 if it doesn't match.
- You can also invoke the worker manually:
  `curl -H "Authorization: Bearer $CRON_SECRET" https://passify.biz/api/cron/webhook-retry`

## Supabase migration instructions

The webhook tables are **not** applied automatically. To apply:

```bash
# Against the production database (Supabase connection string):
DATABASE_URL="postgresql://...supabase..." npm run db:migrate:apply
```

This applies `drizzle/migrations/0001_robust_zombie.sql`, creating
`webhook_endpoints`, `webhook_events`, and `webhook_deliveries`. Review the SQL
before running. The migration is additive (new tables only) and does not alter
existing tables.

## Security considerations

- **Signing secrets** are stored to sign outgoing deliveries (necessary for the
  server to sign). They are shown once at creation/rotation and never returned in
  list responses. Treat the database column as sensitive.
- **Replay protection**: receivers must reject timestamps outside tolerance and
  deduplicate on `Passify-Event-Id` (documented + enforced in examples).
- **Constant-time comparison** on both signing and SDK verification.
- **SSRF surface**: endpoint URLs are operator-provided via the authenticated
  dashboard (not public/self-serve). Before exposing endpoint creation to
  untrusted tenants, add URL allow-listing and block private/link-local ranges.
- **Cron auth**: `/api/cron/webhook-retry` requires `CRON_SECRET` and fails closed
  in production.
- **No PII**: webhook payloads carry the same non-PII fields as the API
  (pubkeys, attestation ids, hashes) — never identity documents.

## Honesty statement

Background retries are **not operational** in any environment until a scheduler
is configured and `CRON_SECRET` is set. The database tables do **not** exist in
production until the migration above is applied. Everything else — signing,
verification, delivery, inline retries, replay, dashboard, SDK, docs, tests — is
fully implemented and verified (`typecheck`, `lint`, 83 tests, production build
all pass).
