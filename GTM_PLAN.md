# Go-To-Market Plan — Passify (technical launch strategy)

Developer-first, honesty-first. No fabricated traction. The goal is credible
adoption by the narrow audience that actually has this problem: teams building
tokenized real-world assets on Solana.

## Positioning
"**The identity & compliance layer for Solana RWA. Verify once; every platform
reads the same on-chain attestation. No PII on-chain, no contract redeploys.**"
This is already the site's message — keep it consistent everywhere.

## Audience & channels (targeted, not broad)
- **Primary:** Solana RWA / tokenization teams, fund-tokenization platforms,
  compliance engineers in web3.
- **Channels:** Solana developer ecosystem (hackathons, RWA-focused communities),
  technical content, and direct outreach to teams already shipping RWA. Avoid
  generic crypto-hype channels — they attract the wrong audience for a compliance
  product.

## Pre-launch readiness checklist (technical)
Ship these before any public push (most are already done):
- [x] Production site, docs, Lighthouse 96–100, no broken routes.
- [ ] OpenAPI spec + interactive reference.
- [ ] Per-key test mode (lets people try without sales).
- [ ] TypeScript SDK + one runnable example repo.
- [ ] Outbound webhooks (removes the polling caveat from demos).
- [x] Honest security & architecture docs.
- [ ] Public changelog process (the `/docs/changelog` page exists — formalize the
      cadence and feed it from real PRs).

## Open-source strategy
- **Open-source the SDK(s), example repos, and the OpenAPI spec.** These build
  trust and reduce integration friction with low IP risk.
- Keep the core platform source private (it holds the attester/compliance logic).
- A public **`SECURITY.md` + disclosure policy** signals maturity (see
  `SECURITY_ROADMAP.md` P0).

## GitHub presence
- A clean public org (`passifybiz`) with: SDK repo, examples repo, OpenAPI repo,
  and a docs-issues repo for feedback. README badges that are *true* (build, npm
  version) — never fake "used by" logos.

## Content (technical, useful, non-hype)
Blog/changelog topics grounded in what's real or shipping:
- "Why we store zero PII on-chain (and how attestations work)."
- "Changing compliance rules without redeploying a Solana program."
- "Designing a fail-closed rate limiter."
- "Verify-once identity for RWA: the attestation model."
- Launch posts *per shipped capability* (webhooks, SDK, test mode).
Avoid: price/market posts, speculative token content, invented case studies.

## Feedback collection
- GitHub issues on the SDK/examples/docs repos.
- A `support@`/`security@` path (already present).
- Lightweight changelog → "what shipped" cadence to show momentum honestly.

## Product Hunt / public launch readiness
Only launch publicly once test mode + SDK + webhooks exist, so visitors can go
from "interesting" to "first successful call" the same day. A launch without a
self-serve try-it path wastes the spike. Demo assets: a 60–90s screencast of
verify→gate-a-mint end-to-end (the existing `/video` workspace can produce this),
and the runnable example repo.

## Honesty guardrails (non-negotiable)
- No fabricated customers, logos, partnerships, funding, or usage numbers.
- No certifications (SOC 2/ISO) or uptime guarantees until real.
- Token content stays disclaimer-first and never speculative (see
  `TOKEN_STRATEGY.md`).
- Marketing claims must trail shipped capability, never lead it.

## Sequenced launch plan
1. **Quiet beta:** SDK + test mode + a design-partner or two found via direct
   outreach; gather real integration feedback.
2. **Developer launch:** open-source SDK/examples/OpenAPI, publish webhook + SDK
   docs, start the changelog cadence.
3. **Public launch (Product Hunt / community):** once self-serve try-it works
   end-to-end and at least one honest reference integration exists.
