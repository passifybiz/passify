# Accessibility Report — Passify

Target: **WCAG 2.2 AA** where realistically achievable.
Verification: Lighthouse accessibility audits (live site) + manual code review.
Result: **Accessibility 100/100** on both the landing page and documentation
(`/docs/api`); all binary accessibility audits pass.

## Issues found and fixed this pass

| # | Issue | WCAG | Fix | Verified |
|---|---|---|---|---|
| 1 | Success/warning text below 4.5:1 contrast as small text (`pm-status`, `terminal-boot`, `ca-chip`) | 1.4.3 Contrast (Minimum) | Darkened `--success` → `#15803d`, `--warning` → `#b45309` (5.02:1); CA chip → `#92400e` (6.78:1) | Contrast computed + Lighthouse `color-contrast` passes |
| 2 | CTA caption (white 50% on dark green) at 3.47:1 | 1.4.3 | Raised to white 85% → 6.80:1 | Contrast computed |
| 3 | Identity-network SVG (`role="img"`) had a description but no accessible name | 1.1.1 Non-text Content | Added `aria-label` (kept `aria-describedby`) | Lighthouse `svg-img-alt` passes |
| 4 | Long code blocks horizontally scrollable but not keyboard-reachable | 2.1.1 Keyboard | Added `tabIndex={0}` + `role="region"` + `aria-label` to `<pre>` | Manual keyboard test |
| 5 | Copy button state change not announced to screen readers | 4.1.3 Status Messages | Added visually-hidden `role="status" aria-live="polite"` region | Code review |
| 6 | Mobile nav + docs drawer (`role="dialog"`) could not be closed via keyboard | 2.1.2 / dialog UX | Added Escape-to-close and body-scroll lock | Manual keyboard test |

## Existing accessibility strengths (verified, left intact)

- **Skip link** to `#main-content` present on every page; visible on focus.
- **Focus visibility**: global `:focus-visible { outline: 2px solid var(--primary) }`.
- **Reduced motion**: comprehensive `@media (prefers-reduced-motion: reduce)`
  disables all entrance animations, transitions, and smooth scroll.
- **Landmarks**: `header`, `nav` (with `aria-label`), `main#main-content`,
  `footer`, and `aside` used semantically across layouts.
- **Headings**: single `h1` per page; logical `h2`/`h3` order in docs and prose.
- **Navigation state**: sidebar links use `aria-current="page"` for the active item.
- **Forms**: inputs have associated `<label>`s and `aria-label`/`aria-invalid`
  where appropriate (login, keys, rules, KYC).
- **Breadcrumbs / pager**: `nav` with `aria-label="Breadcrumb"` / `"Pagination"`.
- **Decorative SVGs** (footer/social, breadcrumb separators) use `aria-hidden`.
- **`.sr-only`** utility added for screen-reader-only content.

## Manual verification performed

- Keyboard-only traversal of landing nav, mobile drawer, docs sidebar drawer,
  and code blocks (tab reaches scrollable `<pre>`; Escape closes drawers).
- Confirmed contrast ratios numerically (sRGB relative luminance):
  `#15803d`/white = 5.02, `#b45309`/white = 5.02, `#92400e`/`#fafaf8` = 6.78,
  CTA caption blended = 6.80.
- Lighthouse a11y category = 100 on `/` and `/docs/api`, zero binary failures.

## Remaining limitations (honest)

- **Focus trapping** inside the mobile/docs drawers is not implemented (focus can
  leave the open drawer via Tab). Escape-to-close and scroll lock are in place;
  full focus-trap is a follow-up enhancement.
- Lighthouse cannot detect every manual WCAG criterion (e.g. meaningful reading
  order in all edge cases). Spot-checked manually; no issues observed.
- Contrast verified on the primary surfaces; bespoke inline-styled sections were
  reviewed but not exhaustively device-tested with assistive tech.
