# Copywriting Review — Passify

Standard applied to every line: does it increase understanding, build trust, and
remove ambiguity? Plain English, professional, honest, concise, human — no hype,
no buzzwords, no unsupported promises.

## Changes this pass

| Location | Before | After | Why |
|---|---|---|---|
| Solution heading | "What Passify replaces" | "How Passify solves it" | The heading didn't describe its cards (capabilities, not replaced items); new heading predicts content and mirrors the Problem section |

## Verified-honest copy (reviewed, left intact)

The existing copy already meets the bar; no rewriting for its own sake.

- **Hero:** "One identity. Every tokenized asset." — concrete, no hype. Sub
  states the mechanism (verify once; no PII on-chain; no contract redeploys).
- **Problem cards:** factual, specific (re-verification friction, PII regulatory
  exposure, contract-redeploy cost). No fear-mongering.
- **Solution pillars:** map 1:1 to the problems; each names a concrete behavior.
- **Trust stats:** literal facts ("0 PII stored on-chain", "3 API endpoints",
  "REST — no SDK", "Solana Token-2022"), not vanity metrics.
- **Pricing:** plain plan descriptions; "No credit card required" stated once.
- **Security page:** claims are correctly hedged ("TLS in transit (version
  depends on deployment)", "Encryption at rest depends on hosting provider").
- **Token pages:** consistently labelled as a *proposed* pre-launch model with a
  visible risk disclaimer and a "Placeholder" contract address.

## Honesty corrections made in prior passes (still in effect)

- Removed false "Sentry integration" claim (package was removed) → "Structured
  server-side logging with a request ID on every response."
- Removed "All systems operational" (no status page exists).
- Removed the newsletter form that confirmed "you're on the list" but sent
  nothing → honest "Follow development on GitHub" link.

## Microcopy principles confirmed

- Consistent terminology (attestation / schema / compliance rule) across landing,
  docs, and UI; defined in `/docs/glossary`.
- Button labels state outcomes ("Start free", "Read the docs", "Talk to sales").
- Error copy in docs maps codes → cause → fix.

## Remaining opportunities

- A one-line **plain-language definition of "attestation"** on first use on the
  landing page (it appears in docs but the landing assumes familiarity).
- **Empty-state microcopy** in the dashboard could add a single encouraging line
  beyond the checklist.
- Consider a short, honest **"Status & reliability"** sentence on the security
  page (e.g. health endpoint location) now that the fake status link is gone.
