# Information Architecture Review — Passify

## Product understanding (basis for this review)

- **What it is:** an API-first identity & compliance layer for Solana RWA
  platforms. Investors verify once; every integrated platform reads the same
  on-chain attestation (a SHA-256 hash — no PII on-chain).
- **Primary users:** (1) platform developers integrating compliance, (2) asset
  issuers configuring investor rules, (3) compliance teams needing an audit
  trail, (4) investors who want to verify once.
- **Core journey:** landing → understand value → see how it works → reach docs /
  quickstart → create an API key → integrate.
- **Brand personality:** precise, technical, restrained. Light-first, forest-green
  brand ramp, flat fills, minimal motion.

## Principles applied (learned from Stripe/Vercel/Linear/Cloudflare/Anthropic)

- A landing page is a **story**, not a feature list: problem → solution → proof.
- **Proof belongs after the pitch**, near the decision point — not before the
  reader knows what the product is.
- One canonical source of truth for navigation (already true here: `docsNav`
  drives sidebar, breadcrumbs, pager, and sitemap).

## What changed

### 1. Landing section order
**Before:** Hero → Trust (stats) → Product preview → Problem → Solution → How it
works → Code → Use cases → Pricing → Token → FAQ → CTA.

**After:** Hero → **Problem → Solution → How it works → Code → Product preview →
Use cases → Trust** → Pricing → Token → FAQ → CTA.

- **Why:** the page previously showed trust stats and a product screenshot before
  establishing the problem — proof with nothing to anchor it to. The new order
  follows the intended narrative: *what → problem → why it matters → how it solves
  it → how it works → see it → who it's for → proof → price → next step.*
- **User benefit:** a first-time visitor builds understanding before being asked
  to trust or buy. The three solution pillars now sit directly under the three
  problems they answer (repeated KYC → verify once; PII on-chain → zero PII;
  rules in contracts → update without redeploy).
- **Trade-off:** the "credibility strip right after hero" pattern is lost; the
  factual stats now reinforce the pitch just before pricing instead. Net positive
  because the stats are product facts, not social proof, and read better as
  reinforcement.

## Navigation (audited, already strong — left intact)
- Top nav trimmed previously to 5 focused destinations (How it works, Use cases,
  Pricing, Token, Docs).
- Docs: single source of truth → sidebar + breadcrumbs + prev/next pager +
  sitemap stay in sync automatically.
- Anchor links (`#problem`, `#solution`, `#how-it-works`, `#use-cases`,
  `#pricing`) are id-based and unaffected by the reorder.

## Remaining opportunities
- **Docs search**: there is no in-docs search. For a growing doc set, a client
  search (e.g. over the nav tree + headings) would reduce time-to-answer.
- **"On this page" persistence**: the right-rail TOC could highlight the active
  heading on scroll (scroll-spy) for long pages.
- **Cross-doc "Related pages"**: pages cross-link in prose; an explicit "Related"
  block at the foot of each concept page would aid discovery.
