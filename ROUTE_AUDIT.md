# Route Audit — Passify

Every public route enumerated from the Next.js App Router build output and the
docs nav source of truth. Status verified against the live site
(`https://passify.biz`) and the production build manifest.

Legend: ✅ verified 200 / works · ↪ redirect · 🔒 auth-gated (login redirect)

## Public marketing & legal

| Route | Status | Purpose | Linked from | Metadata | Canonical |
|---|---|---|---|---|---|
| `/` | ✅ | Landing page | — (root) | title/OG/Twitter/JSON-LD | `/` |
| `/enterprise` | ✅ | Enterprise plan + FAQ | navbar/footer/pricing | title | `/enterprise` |
| `/security` | ✅ | Security & data architecture | footer/docs/trust | title | `/security` |
| `/privacy` | ✅ | Privacy policy | footer | title | `/privacy` |
| `/terms` | ✅ | Terms of service | footer | title | `/terms` |
| `/login` | ✅ | Sign in | navbar/CTAs | inherited | — |

## Documentation (29 routes)

| Route | Status | Purpose |
|---|---|---|
| `/docs` | ✅ | Documentation home / introduction |
| `/docs/quickstart` | ✅ | Five-minute integration |
| `/docs/authentication` | ✅ | API keys & bearer auth |
| `/docs/concepts/how-it-works` | ✅ | End-to-end flow |
| `/docs/concepts/attestations` | ✅ | Attestation model |
| `/docs/concepts/schemas` | ✅ | Schema registry |
| `/docs/concepts/compliance-rules` | ✅ | Runtime transfer rules |
| `/docs/concepts/architecture` | ✅ | Services & data flow |
| `/docs/guides/verify-investor` | ✅ | KYC session walkthrough |
| `/docs/guides/mint-and-transfer` | ✅ | Token-2022 build flow |
| `/docs/guides/manage-rules` | ✅ | Editing rules + audit trail |
| `/docs/api` | ✅ | API reference overview |
| `/docs/api/kyc` | ✅ | KYC endpoints |
| `/docs/api/attestation` | ✅ | Attestation endpoint |
| `/docs/api/token` | ✅ | Token endpoints |
| `/docs/tokenomics` | ✅ | $PASS overview |
| `/docs/tokenomics/utility` | ✅ | Token utility |
| `/docs/tokenomics/supply` | ✅ | Supply & distribution |
| `/docs/tokenomics/treasury` | ✅ | Treasury & revenue |
| `/docs/tokenomics/governance` | ✅ | Governance |
| `/docs/tokenomics/faq` | ✅ | Token FAQ & risk disclaimer |
| `/docs/security` | ✅ | Security (docs) |
| `/docs/production-checklist` | ✅ | Go-live checklist |
| `/docs/troubleshooting` | ✅ | Common errors |
| `/docs/faq` | ✅ | General FAQ |
| `/docs/glossary` | ✅ | Term definitions |
| `/docs/roadmap` | ✅ | Shipped vs planned |
| `/docs/changelog` | ✅ | Platform changes |

All docs pages: per-page `metadata` (title/description), breadcrumbs, prev/next
pager, right-rail TOC, "Last updated" date, and `TechArticle` + `BreadcrumbList`
JSON-LD. Every internal docs link was cross-checked against this route list — no
dead links.

## Redirects

| From | To | Code | Reason |
|---|---|---|---|
| `/api` | `/docs/api` | 307 | API base URL is not browsable; send users to the reference |
| `/api/v1` | `/docs/api` | 307 | Versioned base URL is not browsable |

Versioned API **calls** (`/api/v1/:path*`) are rewritten to `/api/:path*` and are
unaffected by the above redirects.

## Auth-gated application routes (🔒 redirect to `/login` when unauthenticated)

| Route | Purpose |
|---|---|
| `/dashboard` | Account overview |
| `/dashboard/account` | Account settings / password |
| `/dashboard/audit` | Audit log |
| `/keys` | API key management |
| `/rules` | Compliance rule editor |
| `/kyc` | KYC session UI |
| `/attestation/[id]` | Attestation detail |

## API routes (REST, `Authorization: Bearer` required except `/health`)

`/api/health` · `/api/auth/{login,logout,password}` ·
`/api/kyc/{start,status/[pubkey],webhook,start-internal}` ·
`/api/attestation/[id]` · `/api/keys` · `/api/rules/[slug]` ·
`/api/token/{mint,transfer}`

Disallowed in `robots.txt`: `/api/`, `/dashboard/`, `/login`.

## SEO infrastructure

- `robots.txt` — allow all except `/api/`, `/dashboard/`, `/login`; sitemap link.
- `sitemap.xml` — generated from the docs nav source of truth + marketing routes.
- Open Graph + Twitter cards (root) and dynamic `/opengraph-image`.
- `icon` / `apple-icon` generated.

## Result

- Zero broken internal links.
- Zero unexpected 404/500 on public routes (the previously-404 `/api` and
  `/api/v1` now redirect to the reference).
- Every public route returns the expected status (verified live).
