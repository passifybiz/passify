# Master Execution Plan — Passify

Consolidates every proposal from the strategy set into one prioritized plan.
Each item is categorized with reasoning. Principle: **table-stakes before
expansion, evidence before bets, focus over bloat.**

Effort key: **S** days · **M** 1–3 weeks · **L** 1–2 months (one engineer).

---

## 🟢 Build Now — high impact, low risk

| Item | Effort | Why now |
|---|---|---|
| **OpenAPI 3.1 spec** | S–M | Foundational: powers SDK, interactive docs, customer codegen. Small API → cheap to describe. |
| **Per-key test mode** | S–M | The mock provider already exists; promoting it to a per-key sandbox unblocks confident integration with near-zero new risk. |
| **Rate-limit response headers** | S | Quota already enforced; just surface `X-RateLimit-*`. Expected by every API consumer. |
| **Idempotency keys (write endpoints)** | S | Redis already present; payment-grade reliability for `/kyc/start`, `/token/*`. |
| **Security P0:** `SECURITY.md` + disclosure policy + `security.txt` + CI `npm audit` | S | Pure trust/process win; mostly docs + one CI step. |
| **Docs: "Run locally in 60s", full error reference, versioning policy** | S | Surfaces existing strengths; reduces support load. |
| **Atomic lockout counter (Redis INCR)** | S | Closes a known non-atomic race in the existing lockout. |

## 🟡 Build Next — important platform capabilities

| Item | Effort | Why next |
|---|---|---|
| **Outbound webhooks** (signed, retried, delivery log) | M | Removes polling — the biggest DX gap. Depends on nothing blocking; high impact. |
| **TypeScript SDK** (generated from OpenAPI + signing helper) | M | Major first-success improvement. Depends on OpenAPI. |
| **Organizations & teams** | L | The unlock for multi-user and enterprise; prerequisite for billing/SSO. Ship behind a flag with careful migration. |
| **Per-key/org usage analytics** | M | Uses data already captured; needed for billing and customer trust. |
| **Self-serve billing (Stripe, fixed tiers first)** | L | Monetizes existing tiers. Depends on orgs + analytics. |
| **2–3 example repos + core tutorials** | S each | Multiply the SDK's value; keep few and maintained. |
| **MFA/TOTP for dashboard** | M | Compliance staff are high-value targets. |

## 🟠 Build Later — long-term investments (gated on evidence)

| Item | Effort | Gate |
|---|---|---|
| **Confirmed on-chain attestation program + external audit** | L | Required before claiming a production on-chain write path; high-trust, high-risk R&D track. |
| **Second KYC provider (e.g. Sumsub)** | M | When a customer needs jurisdiction-specific verification. |
| **CLI** | M | After SDK adoption justifies it. |
| **Interactive playground** | M | After test mode + OpenAPI. |
| **Data export & retention controls** | M | When an enterprise deal requires it. |
| **SSO (SAML/OIDC) → SCIM** | L | Only on demonstrated enterprise demand. |
| **SOC 2 Type II** | — | Only when a concrete deal justifies cost; never claimed pre-audit. |
| **Attestation schema spec for ecosystem interop** | M–L | After the core is proven and stable. |

## 🔴 Do Not Build (now) — attractive but not value-additive

| Item | Why not |
|---|---|
| **Required token for API usage** | Adds buyer friction and regulatory irony to a compliance product; fiat billing is better. (See `TOKEN_STRATEGY.md`.) |
| **Token speculation/marketing** | Off-mission; undermines the trust positioning. |
| **Multi-chain expansion** | Dilutes the focused Solana-RWA edge before it's proven. |
| **On-chain-embedded compliance rules** | Forfeits the no-redeploy advantage that is a core differentiator. |
| **Becoming a general identity provider** | Direct competition with Auth0/Clerk; abandons the defensible niche. |
| **Marketplace / app store** | Premature; no ecosystem yet. |
| **UI redesign / more visual polish** | Verified production-ready (Lighthouse 96–100); no evidence of a usability problem. |
| **Pre-writing migration guides / speculative docs** | Document capabilities when they ship, not before. |

---

## Recommended 12–24 month arc

1. **Quarter 1 (DX foundation):** OpenAPI, test mode, rate-limit headers,
   idempotency, Security P0, error/versioning docs. → developers can integrate
   confidently.
2. **Quarter 2 (platform):** Outbound webhooks + TypeScript SDK + example repos
   + tutorials. → real-time, low-friction integration; begin developer launch.
3. **Quarter 3 (multi-user):** Organizations/teams + usage analytics + MFA.
   → multi-developer adoption; enterprise foundation.
4. **Quarter 4 (monetize):** Self-serve billing + data export. → revenue.
5. **Parallel R&D (no fixed date):** on-chain attestation program + audit;
   second KYC provider when demanded.
6. **Token:** decoupled from the above; optional, governance-first, only if it
   earns its place (see `TOKEN_STRATEGY.md`).

## Guiding rules (restated)
- Prefer simple, maintainable systems; resist feature bloat.
- Never build a feature only because a competitor has it.
- Keep current vs. roadmap clearly separated in all docs and marketing.
- Make marketing trail shipped capability — never lead it.
