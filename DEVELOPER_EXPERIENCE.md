# Developer Experience — Passify

A review of the end-to-end developer journey against what exists in the codebase,
plus a grounded improvement plan.

## Journey audit

| Step | Can a developer do it today? | Notes |
|---|---|---|
| Understand the product quickly | ✅ | Strong landing + docs (quickstart, concepts, guides). |
| Obtain credentials | ⚠️ | API keys are created in the dashboard after login. There is **no self-serve signup→key flow tied to billing**, and no programmatic key issuance. |
| Make the first request | ✅ | `POST /kyc/start` documented with curl + example payloads. |
| Debug errors | ✅ | Single error shape (`error`, `detail`, `request_id`) + status-code table + troubleshooting page. |
| Read examples | ✅ | Docs guides, landing snippets (now with copy buttons). |
| Explore the API | ⚠️ | Reference is good prose, but there is **no interactive/OpenAPI explorer** and **no machine-readable spec**. |
| Integrate successfully | ⚠️ | Possible via raw REST, but no SDK; transaction signing is left entirely to the developer. |
| Test before mainnet | ⚠️ | A `mock` mode exists globally; not framed as a per-key sandbox. |

**Net:** the *learning* experience is excellent; the *building* experience lacks
the tooling (spec, SDK, webhooks, sandbox) that reduces real integration friction.

## Highest-leverage DX improvements (grounded)

### 1. Publish an OpenAPI 3.1 spec (Build Now, S–M)
The API is small and stable enough to describe precisely. Benefits compound:
- Powers an interactive reference ("try it") in the docs.
- Generates the SDK (don't hand-write it).
- Lets customers generate their own clients in any language.

### 2. TypeScript SDK (Build Next, M)
Thin, generated-from-OpenAPI core plus ergonomic helpers:
- `passify.kyc.start({...})`, `passify.kyc.status(pubkey)`, `passify.attestations.get(id)`,
  `passify.token.mint({...})`.
- Built-in: auth header, retries with backoff, idempotency keys, typed errors,
  rate-limit header parsing.
- Optional `@passify/solana` companion for signing the returned unsigned txs with
  `@solana/web3.js` (the heaviest current burden on integrators).

### 3. Per-key test mode (Build Now/Next, S–M)
Promote the existing mock provider to a **per-key sandbox**: a `test`-tier key
returns deterministic attestations/txs so developers integrate end-to-end without
mainnet or KYC vendor credentials.

### 4. CLI (Build Later, M)
`passify` CLI for: `keys create/list/revoke`, `kyc start`, `status <pubkey>`,
`rules get/set`, `logs tail`. Wraps the SDK. Valuable but secondary to SDK + webhooks.

### 5. Starter templates & example repos (Build Next, S each)
- `examples/next-rwa-gate` — gate a mint behind a valid attestation.
- `examples/webhook-receiver` — verify + handle outbound webhooks (after V2.1).
- `examples/node-quickstart` — the docs quickstart as a runnable repo.
Keep them few and maintained; stale examples hurt more than help.

### 6. Tutorials (Build Next)
- "Verify an investor and gate a token mint end-to-end."
- "Handle attestation expiry and re-verification."
- "Change a compliance rule safely (with audit trail)."

### 7. Interactive playground (Build Later, M)
An in-docs console that calls the **test-mode** API with a scoped demo key.
Depends on test mode (#3) and OpenAPI (#1). High delight, lower priority.

## Local development workflow (already a strength — document it)
The repo already falls back to **SQLite + in-memory Redis**, seeded on first run,
so `npm run dev` works with zero infra. This is an underadvertised DX win — make
it a first-class section in the docs ("Run Passify locally in 60 seconds").

## Testing guidance to publish
- How to use test-mode keys in CI.
- How to verify webhook signatures (after V2.1).
- How to assert against the deterministic mock attestations.

## Sequencing
1. OpenAPI spec → unlocks SDK + interactive reference (foundational).
2. Per-key test mode → unblocks confident integration.
3. TS SDK + 2–3 example repos.
4. CLI + playground later.
