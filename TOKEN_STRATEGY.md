# Token Strategy — Passify ($PASS)

Utility-first, honest assessment. The token is **pre-launch**: the contract
address is a labelled placeholder and the docs frame supply/utility as a
*proposed* model with a risk disclaimer. This document evaluates whether a token
should exist at all, and if so, on what terms.

## The necessity test (asked first, deliberately)

A token should exist only if it does something a normal SaaS account + Stripe
cannot do better. Applying that test to Passify:

| Proposed use | Does it need a token? | Verdict |
|---|---|---|
| Pay for attestations / API usage | No — fiat billing (Stripe) is simpler, more predictable for B2B buyers, and what compliance-conscious customers expect. | **Token not required** |
| Governance over schemas/default rules/treasury | Plausibly — but only if there is a real decentralized stakeholder base, which does not exist pre-launch. | **Premature** |
| Staking for incentive alignment | Only meaningful with real network participants (issuers/verifiers) to align. | **Premature** |

**Honest conclusion:** at the current stage, the token is **not necessary for the
product to succeed**, and a usage-credit token could actively *harm* enterprise
adoption — compliance and finance teams generally do not want to hold/spend a
volatile asset to pay for a compliance API. The core product is stronger sold as
a straightforward fiat SaaS.

## Where the product weakens if the token is forced

1. **Buyer friction:** requiring $PASS to pay for attestations adds an acquisition
   step and price volatility to a B2B compliance purchase — the opposite of what
   this buyer wants.
2. **Regulatory irony:** a *compliance* product introducing a speculative token
   invites scrutiny that undercuts its trust positioning.
3. **Focus cost:** token launch, liquidity, and market operations consume effort
   better spent on webhooks/SDK/orgs.

## If a token still proceeds — utility-first guardrails

Should the company choose to proceed (a business decision beyond pure product
logic), it should be on these terms only:

1. **Fiat-first, token-optional.** Never require the token to use the API. The
   token can offer *optional* discounts/credits, but USD pricing remains primary.
2. **Real utility before launch, not after.** Ship the thing the token governs
   (e.g. a working governance process over schema additions / default rule
   templates / treasury) *before* listing — not as a roadmap promise.
3. **Governance with genuine scope:** holders vote on schema registry additions,
   default jurisdiction rule packs, and treasury allocation — items where
   decentralized input is legitimately valuable. Platform-internal operations
   stay centralized (already reflected in the docs' governance split).
4. **Abuse prevention:** any token-gated incentive (e.g. staking to run a
   verifier) must have slashing/quality controls to prevent low-quality
   attestations — otherwise the token degrades the core trust product.
5. **Sustainability:** treasury policy and emissions must be modeled so platform
   revenue (fiat) — not token sales — funds operations. The token cannot be the
   business model.
6. **UX:** investors and integrators must be able to ignore the token entirely
   and still get full functionality.

## Disclosure discipline (already good — keep it)
The docs correctly: label the address a placeholder, mark supply/utility as a
*proposed* pre-launch model, and carry a risk disclaimer. Maintain this. Never
publish price targets, "guaranteed" utility, or launch dates.

## Recommendation
- **Primary recommendation:** decouple the roadmap from the token. Build the
  fiat SaaS platform (billing, webhooks, SDK, orgs) as the business. Treat the
  token as an **optional, later, governance-first** layer that must earn its
  place by governing something real.
- **Do not** gate core API usage behind the token.
- **Do not** market the token for speculation.
- Keep the existing honest, disclaimer-first framing on all token pages.
