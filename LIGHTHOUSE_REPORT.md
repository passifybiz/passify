# Lighthouse Report — Passify

All results are **measured**, not estimated. Audits were run with the Lighthouse
CLI (Chrome, headless, mobile emulation defaults) against the live production
site `https://passify.biz` before and after this hardening pass.

Tool: `lighthouse` (npx), Chrome stable, categories: Performance, Accessibility,
Best Practices, SEO.

## Scores

### Landing page — `/`

| Category | Before | After |
|---|---|---|
| Performance | 95 | **96** |
| Accessibility | 95 | **100** |
| Best Practices | 100 | **100** |
| SEO | 100 | **100** |

### Documentation page — `/docs/api`

| Category | Before | After |
|---|---|---|
| Performance | 99 | **99** |
| Accessibility | 100 | **100** |
| Best Practices | 100 | **100** |
| SEO | 92 | **100** |

## Core Web Vitals (after)

### `/`
| Metric | Value |
|---|---|
| First Contentful Paint | 1.5 s |
| Largest Contentful Paint | 1.8 s |
| Total Blocking Time | 170 ms |
| Cumulative Layout Shift | 0.002 |
| Speed Index | 3.5 s |

### `/docs/api`
| Metric | Value |
|---|---|
| First Contentful Paint | 1.0 s |
| Largest Contentful Paint | 2.0 s |
| Total Blocking Time | 20 ms |
| Cumulative Layout Shift | 0 |
| Speed Index | 1.8 s |

## Optimizations performed this pass

1. **Accessibility 95 → 100 (landing).** Fixed the two failing audits Lighthouse
   reported:
   - `color-contrast`: success/warning text colors failed 4.5:1 as small text
     (`#16a34a` → 3.29:1, `#d97706` → 3.18:1). Darkened the semantic tokens to
     `#15803d` and `#b45309` (both measured at **5.02:1** on white), the CA chip
     to `#92400e` (**6.78:1**), and the CTA caption to white at 85% opacity
     (**6.80:1** on the dark-green background).
   - `svg-img-alt`: the identity-network diagram (`role="img"`) had a description
     but no accessible name. Added `aria-label`.
2. **SEO 92 → 100 (docs).** Fixed the failing `canonical` audit. The root layout
   hard-coded `canonical: https://passify.biz`, which every page inherited — so
   all docs/sub-pages declared the homepage as their canonical (a duplicate-content
   signal). Removed the global canonical and added correct self-canonicals to the
   home and standalone marketing pages. Docs pages now emit no conflicting
   canonical; per-page `TechArticle` + `BreadcrumbList` JSON-LD provide the correct
   self URL.

## Notes on existing performance (already strong; left intact)

The bundle was already lean and well-built; no churn was introduced for marginal
gains (per the "never sacrifice maintainability for tiny gains" rule):

- First Load JS ≈ 102 kB shared; most pages ≈ 106–107 kB.
- CLS is effectively zero (0–0.002) — layout is stable, fonts use `display: swap`.
- Fonts loaded via `next/font` (self-hosted, preconnect-free, no layout shift).
- Static prerendering for all marketing and documentation routes.
- `next/font` + system fallbacks; no render-blocking third-party CSS/JS.

## How to reproduce

```bash
npx lighthouse https://passify.biz/ \
  --only-categories=performance,accessibility,best-practices,seo \
  --chrome-flags="--headless"

npx lighthouse https://passify.biz/docs/api \
  --only-categories=performance,accessibility,best-practices,seo \
  --chrome-flags="--headless"
```
