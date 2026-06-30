# Documentation Plan — Passify

The docs are already strong (quickstart, concepts, guides, API reference,
tokenomics, security, troubleshooting, glossary, roadmap, changelog; with search,
breadcrumbs, pager, TOC, copy buttons, structured data, "Last updated"). This
plan covers what a maturing platform should add, prioritized by user value.

## Gaps and additions

### Tier 1 — Build Now (unblock integration & trust)
1. **Run locally in 60 seconds.** Document the existing SQLite + in-memory Redis
   zero-config dev path. (Capability exists; docs don't surface it.)
2. **Webhook guide.** Required as soon as outbound webhooks ship: event catalog,
   payload shapes, signature verification, retries/idempotency, a receiver example.
3. **Full error reference.** Expand the status-code table into a per-error-code
   page (cause → fix), aligned with the single error shape already in code.
4. **API versioning & stability policy.** `/api/v1` exists; document what "v1"
   guarantees, deprecation policy, and changelog linkage.

### Tier 2 — Build Next (scale & confidence)
5. **SDK guide(s).** Install, auth, examples, error handling — paired with the
   TypeScript SDK when it ships. Auto-generate API parts from OpenAPI.
6. **Architecture overview (public-facing).** Data flow, statelessness, where PII
   does/does not go — a trimmed, accurate version of the internal model. (Partly
   covered in `/docs/concepts/architecture` and `/security`; consolidate.)
7. **Security model page** for buyers/security reviewers: threat model summary,
   key handling, session model, what's stored. Mirrors `SECURITY_ROADMAP.md` but
   only documents what *exists*.
8. **Cookbook / recipes.** Short task-focused snippets: gate a mint, handle
   expiry + re-verification, change a rule safely, verify a webhook, paginate
   audit logs.
9. **Testing guide.** Using test-mode keys, asserting against deterministic mock
   attestations, CI patterns.

### Tier 3 — Build Later (maturity)
10. **Migration guides.** Only when there's something to migrate (API v2, SDK
    major versions, provider changes). Don't pre-write.
11. **API design principles.** Public statement of conventions (idempotency,
    errors, pagination, naming) — useful once the SDK/OpenAPI exist.
12. **Self-hosting/VPC deployment guide.** The enterprise page mentions Docker/VPC;
    document it properly if self-hosting becomes a supported path.
13. **FAQ expansion** driven by real support questions (don't invent questions).

## Principles
- **Document only what exists.** New capability pages ship *with* the feature, not
  before. Keep the current honesty (placeholders labelled, hedged claims).
- **Single source of truth.** The docs nav tree already drives sidebar/breadcrumbs/
  pager/sitemap — keep new pages wired through it.
- **Every page answers the next question** (the pager + new "Related pages" block
  already support this).
- **Keep it lean.** A focused 3-endpoint API does not need sprawling docs; depth
  on the few things that matter beats breadth.

## Suggested nav additions (when features land)
- Get started → "Run locally"
- Guides → "Receive webhooks", "Handle attestation expiry", "Test your integration"
- API reference → "Errors" (full), "Versioning", "Webhooks", "OpenAPI spec"
- Platform → "Architecture", "Security model"
