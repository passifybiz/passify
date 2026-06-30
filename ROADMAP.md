# Platform Roadmap — Passify

Realistic, grounded in the current codebase. Each item lists why it matters,
target users, complexity (S/M/L), dependencies, expected impact, and risks.
Nothing here is a commitment or a dated promise — it is a prioritized plan.

Complexity key: **S** = days, **M** = 1–3 weeks, **L** = 1–2 months (one engineer).

---

## Version 2 — Platform table-stakes (highest impact)

### V2.1 Outbound webhooks
- **Why:** removes polling (`GET /kyc/status`); the #1 DX gap. Events:
  `kyc.status_changed`, `attestation.issued`, `attestation.expiring`,
  `rule.updated`.
- **Users:** platform developers, compliance teams.
- **Complexity:** M. **Depends on:** new `webhook_endpoints` + `webhook_deliveries`
  tables, signing secret per endpoint, retry/backoff worker.
- **Impact:** High — real-time integrations, fewer support questions.
- **Risks:** delivery reliability; mitigate with retries, signature, and a
  deliveries log (reuse the audit-log discipline).

### V2.2 TypeScript SDK
- **Why:** typed client, auth, retries, pagination, error mapping. First-success
  time drops sharply.
- **Users:** developers (TS/JS is the dominant integration language here).
- **Complexity:** M. **Depends on:** a stable, documented API surface +
  versioning policy.
- **Impact:** High. **Risks:** maintenance burden — keep it thin and generated
  where possible.

### V2.3 Per-key test mode + rate-limit headers
- **Why:** today `mock`/`real` is a global env flag. Make it a **per-key mode**
  so developers test against deterministic responses without mainnet. Surface
  `X-RateLimit-Limit/Remaining/Reset`.
- **Users:** developers.
- **Complexity:** S–M. **Depends on:** key schema flag; the mock provider already
  exists.
- **Impact:** High for onboarding. **Risks:** low.

### V2.4 Idempotency keys on write endpoints
- **Why:** safe retries on `/kyc/start`, `/token/*`. Standard for payment-grade APIs.
- **Users:** developers. **Complexity:** S. **Depends on:** a short-lived
  idempotency store (Redis already present).
- **Impact:** Medium-high reliability. **Risks:** low.

### V2.5 Usage analytics per key
- **Why:** `attestation_reads` + usage counters already exist; expose a usage
  view (calls, quota, reuse rate) per key.
- **Users:** developers, finance. **Complexity:** M.
- **Impact:** Medium. **Risks:** none material.

---

## Version 3 — Platform expansion

### V3.1 Organizations & teams
- **Why:** multi-developer adoption and the prerequisite for enterprise. Move
  from single `accounts` to `organizations` → `members` (role per org) → keys
  owned by orgs.
- **Users:** teams, enterprise. **Complexity:** L. **Depends on:** auth refactor,
  data migration, RBAC extension.
- **Impact:** High (unlocks enterprise). **Risks:** migration of existing
  accounts/keys; design carefully, ship behind a flag.

### V3.2 Self-serve billing
- **Why:** monetize the existing tiers. Stripe integration: plan → quota mapping,
  metered overages, invoices.
- **Users:** all paying customers. **Complexity:** L. **Depends on:** orgs (V3.1),
  usage analytics (V2.5).
- **Impact:** High (revenue). **Risks:** billing correctness; start with simple
  fixed tiers before metered billing.

### V3.2 Second KYC provider (e.g. Sumsub)
- **Why:** the provider interface is already abstracted; a second adapter proves
  it and de-risks vendor lock-in for customers.
- **Users:** issuers with jurisdiction-specific provider needs. **Complexity:** M.
- **Impact:** Medium. **Risks:** schema/normalization differences between vendors.

### V3.3 Confirmed on-chain attestation program
- **Why:** today the real write path is best-effort against an assumed program.
  Deploy, audit, and document a canonical attestation program + verifier.
- **Users:** issuers going to mainnet. **Complexity:** L. **Depends on:** Solana
  program development + external audit.
- **Impact:** High (production trust). **Risks:** smart-contract risk — requires
  audit before mainnet claims.

### V3.4 Data export & retention controls
- **Why:** enterprise/compliance requirement. Export audit log, attestations,
  usage; configurable retention.
- **Complexity:** M. **Impact:** Medium. **Risks:** low.

---

## Long-term vision — ecosystem (only after the core is proven)

- **Attestation interoperability:** publish the attestation schema spec so other
  Solana programs/wallets can read Passify attestations natively.
- **Reusable investor identity wallet UX:** an investor-facing surface to see and
  manage their portable attestations.
- **Confidential compliance:** explore confidential transfers (the schema already
  has an `isConfidential` flag) for privacy-preserving holder checks.
- **Marketplace of compliance rule templates** (jurisdiction packs) — only if
  customer demand is demonstrated.

Each long-term item is explicitly **gated on evidence of demand** and a stable,
audited core. None should precede V2/V3 table-stakes.

---

## Sequencing rationale

1. **V2 first** because no amount of vision compensates for missing webhooks/SDK/
   test mode — they block adoption today.
2. **Orgs before billing** because billing without an org model produces an
   awkward single-user product.
3. **On-chain program hardening** is high-trust but high-risk; it runs in parallel
   as an R&D track, not on the critical path to revenue.
