# UX Review — Passify

Scope: refinement of an already production-ready product. Every observation is
tied to a UX principle, not taste.

## What changed this pass

| Change | Why | User benefit | Trade-off |
|---|---|---|---|
| Landing reordered to problem → solution → how → see → proof | Story before proof; reduce cognitive load | Visitors understand before being asked to trust/buy | Loses the post-hero stat strip (now lower) |
| Solution heading "What Passify replaces" → "How Passify solves it" | Heading must describe its content; the cards are capabilities, not a list of replaced things | Section title now predicts content; reinforces problem→solution mapping | None |
| Removed dead `HowItWorks` component | Two components shared `id="how-it-works"`; only `ApiFlow` was rendered | Eliminates a latent duplicate-id bug and dead code | The richer 5-step copy is retired (the 3-step visual pipeline is the chosen treatment) |

## Interaction quality (audited; strong, retained)

- **Motion philosophy** matches Linear/Vercel restraint: short translate-only
  entrances, single 2px lift on card hover, no decorative animation, full
  `prefers-reduced-motion` support.
- **Focus states**: global 2px primary `:focus-visible` ring; skip link.
- **Keyboard**: code blocks are focus/scrollable; mobile + docs drawers close on
  Escape and lock body scroll.
- **Copy interactions**: docs code blocks have copy buttons with a screen-reader
  status announcement.
- **Empty/zero states**: dashboard provides an onboarding checklist with direct
  CTAs (create key → verify investor → integrate) rather than a blank screen.
- **Loading**: dashboard has a dedicated `loading.tsx`; route errors have
  `error.tsx` with recovery.

## Heuristic notes (Nielsen)

- *Match between system and real world*: terminology is consistent
  (attestation, schema, compliance rule) and defined in the glossary.
- *Recognition over recall*: sidebar marks the active page (`aria-current`);
  breadcrumbs + pager show position and the next logical step.
- *Error prevention/recovery*: API error reference + troubleshooting table map
  status codes to causes and fixes.

## Remaining opportunities (honest backlog)

- **Landing code snippets** (`CodeExample`) use raw `<pre>` without copy buttons,
  unlike the docs. Unifying them on the `CodeBlock` component would add
  copy-to-clipboard and keyboard scrolling on the landing page too. Deferred to
  avoid restructuring the bespoke two-column snippet layout in this pass.
- **Drawer focus trapping**: drawers close on Escape but don't trap Tab focus.
- **Scroll-spy TOC**: highlight the current section in the right rail on scroll.
- **Success microcopy**: API key creation ("shown once") could add an explicit
  post-copy confirmation toast.
