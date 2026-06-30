# Competitive Analysis — Passify

Purpose: learn the **principles and expectations** set by leading developer
platforms, identify which capabilities are now table-stakes, and find what is
underserved for Passify's specific niche (Solana RWA compliance). Not a feature
copy list.

## Reference products and what each teaches

| Product | Principle worth adopting |
|---|---|
| **Stripe** | Obsessive API consistency, idempotency keys, first-class webhooks, test mode, fantastic errors, versioned API, SDKs in every language. |
| **Auth0 / Clerk** | Frictionless onboarding, drop-in components, clear quotas, generous free tier, self-serve dashboard. |
| **WorkOS** | "Enterprise-ready" as a product: SSO, SCIM, audit logs, directory sync — sold as the boring-but-required layer. Mirrors Passify's "compliance layer" positioning. |
| **Supabase / Vercel** | Zero-config local dev, instant first success, generous docs, open-source trust, transparent changelog. |
| **Cloudflare** | Fail-closed safety, security defaults, status transparency, deep docs. |
| **GitHub** | Fine-grained tokens, scopes, org/team model, service accounts, granular audit. |
| **OpenAI** | Usage dashboards, per-key spend visibility, rate-limit headers, clear error taxonomy. |

## Developer expectations that are now industry standard

These are the things a developer assumes any serious API product has. Passify's
current status is marked.

| Expectation | Industry standard | Passify today |
|---|---|---|
| REST + JSON, bearer auth | ✅ | ✅ |
| Predictable error shape + codes | ✅ | ✅ (single shape, request_id) |
| Test / sandbox mode | ✅ | ⚠️ partial — `mock` provider mode exists but isn't framed as a per-key test mode |
| Idempotency keys on writes | ✅ | ❌ |
| **Outbound webhooks** + signed payloads | ✅ | ❌ (only inbound) |
| Rate-limit headers (`X-RateLimit-*`) | ✅ | ⚠️ quota enforced, not surfaced in headers |
| Official **SDKs** (TS first) | ✅ | ❌ |
| **CLI** | common | ❌ |
| Self-serve **API keys + billing** | ✅ | ⚠️ keys yes (dashboard), billing ❌ |
| **Org / team** model + roles | ✅ | ⚠️ 3 roles, no orgs/teams |
| Usage dashboard per key | ✅ | ⚠️ basic counts only |
| Versioned API | ✅ | ⚠️ `/api/v1` path exists; no documented version policy |
| Status page / uptime transparency | ✅ | ❌ (intentionally removed fake one) |
| Audit logs | enterprise | ✅ |
| API key scoping | ✅ | ✅ (`allowed_mints`) |

## Where Passify is genuinely differentiated

- **Solana RWA compliance is unserved by the generalists.** Auth0/Clerk/WorkOS do
  human-identity for web apps; none produce a portable **on-chain attestation**
  or enforce **token-transfer compliance**.
- **Zero-PII attestation model** — most identity products hold PII; Passify's
  design explicitly does not. That is a positioning and liability advantage.
- **Mutable compliance without contract redeploys** — on-chain-native competitors
  that embed rules in programs cannot match this operationally.

## Underserved opportunities (high value for Passify's vision)

1. **A real test mode per API key** (not just a global mock flag) — lets
   developers build confidently before going to mainnet.
2. **Outbound webhooks** for `attestation.issued`, `attestation.expiring`,
   `kyc.status_changed`, `rule.updated` — removes polling, the single biggest DX
   gap.
3. **A TypeScript SDK** that wraps auth, retries, types, and (later) transaction
   signing helpers.
4. **Per-key usage analytics + rate-limit headers** — visibility developers
   expect from OpenAI/Stripe.
5. **Org/team model** — the unlock for multi-developer and enterprise adoption.

## What to deliberately NOT chase

- **Becoming a general identity provider** (competing with Auth0/Clerk). Off-mission.
- **Multi-chain before nailing Solana.** Dilutes the focused edge prematurely.
- **Embedding compliance on-chain** to look "more web3." It would forfeit the
  no-redeploy advantage.
- **A marketplace / app store.** Premature for the current stage.

## Takeaway

Passify's *domain* edge is strong and defensible. Its *platform* maturity trails
the bar developers now set. The highest-leverage competitive moves are the boring
table-stakes — webhooks, an SDK, test mode, usage visibility, and an org model —
delivered with the same restraint and honesty the product already shows.
