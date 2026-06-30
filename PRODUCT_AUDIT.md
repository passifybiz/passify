# Product Audit — Passify

Grounded in the current codebase (Next.js App Router, Drizzle/Postgres, Redis,
Solana). This document distinguishes **what exists today** from **what does not**.
No customers, partnerships, certifications, or usage numbers are claimed.

## Core problem

RWA (real-world-asset) platforms on Solana must verify investor identity and
enforce compliance (jurisdiction, accreditation, holder limits) on every token
operation. Building this in-house means: integrating a KYC vendor, deciding what
to persist (and inheriting PII liability), and encoding compliance in smart
contracts (so every rule change is a redeploy).

Passify turns a one-time KYC check into a **portable, on-chain attestation** (a
SHA-256 hash + metadata — never PII) and enforces **mutable compliance rules** at
mint/transfer time via a small REST API. Verify once; every integrated platform
reads the same attestation.

## Users

- **Primary — platform developers:** integrate compliance with a few REST calls;
  no Solana program to write.
- **Primary — asset issuers:** configure per-asset rules (required schema,
  jurisdictions, minimum investment, max holders, transfer lock) from a dashboard.
- **Secondary — compliance teams:** need an immutable audit trail of rule changes
  and attestation actions.
- **Secondary — investors:** verify once, reuse across platforms.
- **Enterprise (aspirational, not yet served):** organizations needing teams,
  SSO, billing, SLAs — see `ENTERPRISE_READINESS.md`.

## Current capabilities (verified in code)

- **Identity → attestation pipeline:** `POST /kyc/start` → hosted KYC → provider
  webhook → SHA-256 hash written as an on-chain attestation → `GET /kyc/status/:pubkey`.
- **Compliance-checked token ops:** `POST /token/mint`, `POST /token/transfer`
  return *unsigned* Token-2022 transactions after checking attestation + rules.
- **Attestation read API:** `GET /attestation/:id`.
- **Mutable compliance rules:** per mint config; changes are runtime, not on-chain.
- **Dashboard auth:** bcrypt passwords, JWT sessions (7d, HS256), httpOnly secure
  cookies, session revocation (jti + revoke-after-timestamp), login lockout (10
  attempts / 15 min), structured security-event logging.
- **RBAC:** three roles — `admin`, `compliance` (write), `viewer` (read).
- **API keys:** SHA-256 hashed (plaintext shown once), prefix identifier,
  per-key tier + monthly quota + usage counter, mint scoping (`allowed_mints`),
  revocable (`is_active`).
- **Rate limiting / quota:** Redis fixed-window counter, **fail-closed in
  production**, in-memory fallback in dev.
- **Audit log:** actor, action, entity, old/new value (JSONB), IP, timestamp.
- **Inbound webhooks:** KYC provider → Passify, HMAC-verified in real mode.
- **Provider abstraction:** Blockpass implemented; interface allows adding others.
- **Operational resilience:** Postgres + Redis in production; SQLite + in-memory
  fallback for zero-config local dev. Health endpoint. Security headers + CSP.
- **Docs + marketing site:** enterprise-grade docs (search, breadcrumbs, pager,
  TOC, copy buttons, structured data), Lighthouse 96–100.

## Strengths

1. **Focused surface.** Three integration endpoints; easy to reason about and
   document. Resists feature bloat.
2. **Honest, defensible security primitives** already in place (hashed keys,
   revocation, lockout, audit log, fail-closed rate limiting).
3. **Zero-PII architecture** is a genuine differentiator and reduces customer
   regulatory burden.
4. **Mutable compliance without redeploys** is a real engineering advantage over
   contract-embedded compliance.
5. **Strong test/build/deploy hygiene** (32 tests, clean typecheck/lint, static
   prerendering, auto-deploy).
6. **Provider-agnostic interface** — not locked to one KYC vendor by design.

## Weaknesses / gaps (today)

1. **No billing.** Tiers/quotas exist as fields but there is no payment
   integration or self-serve upgrade.
2. **No organizations/teams.** A single `accounts` table; no multi-user orgs,
   service accounts, or per-org isolation.
3. **No outbound webhooks.** Customers cannot subscribe to attestation/rule
   events; they must poll `GET /kyc/status`.
4. **No SDKs or CLI.** REST only; integrators hand-roll HTTP + signing.
5. **Single live KYC provider** (Blockpass). The abstraction exists but only one
   adapter is implemented.
6. **Real on-chain write path is best-effort** — it assumes a deployed
   attestation program; mock mode is the fully-working UX.
7. **Shallow analytics & no data export.** Dashboard shows basic counts; no
   per-key usage analytics or export.
8. **Token is pre-launch and unproven** (placeholder address; forward-looking
   utility). See `TOKEN_STRATEGY.md`.

## Competitive position (summary; detail in COMPETITIVE_ANALYSIS.md)

- **Advantage:** purpose-built for Solana RWA compliance; portable attestations;
  no-redeploy rules; zero-PII posture. General identity platforms (Auth0/Clerk/
  WorkOS) do not address on-chain RWA compliance; on-chain identity primitives
  (e.g. attestation services) are not turnkey compliance products.
- **Disadvantage:** missing platform table-stakes that developers now expect from
  any API product — SDKs, outbound webhooks, self-serve billing, org/team
  management, usage analytics. These are the focus of the V2 roadmap.

## One-line conclusion

Passify is a **focused, honestly-built compliance API with a real architectural
edge**, currently lacking the **developer-platform and enterprise table-stakes**
(SDKs, webhooks, billing, orgs) needed to be adopted at scale. The roadmap
should close those gaps without diluting the narrow, defensible core.
