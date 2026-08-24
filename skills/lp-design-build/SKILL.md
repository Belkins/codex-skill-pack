---
name: lp-design-build
description: Use when turning an approved landing-page strategy or message map into production frontend code, page layout, responsive UI, visual direction, component structure, or polished implementation. Chain with frontend-design for distinctive UI.
metadata:
  short-description: Build distinctive landing-page UI
---

# LP Design Build

## Use When

- The user wants the landing page implemented, redesigned, or materially improved in code.
- A message map exists and needs a visual system, component plan, responsive layout, and production frontend execution.
- The page must feel premium and conversion-focused without becoming generic AI/SaaS UI.

## Workflow

1. Read the message map and existing code/design system before editing.
2. Pick one art direction that fits the audience, product, and proof. Do not default to dark SaaS cards.
3. Produce or infer a page spec with the output contract below.
4. Implement the UI using the repository's existing design system and frontend conventions.
5. Run `node scripts/check-page-spec.mjs <page-spec.json>` when a machine-readable spec exists.
6. After code changes, hand off to `$lp-verification-gate`.

## Output Contract

Return or implement a page spec with:

- `visualDirection`: theme, typography, color, asset style, motion stance, and what should be memorable.
- `firstViewport`: exact content visible on mobile and desktop.
- `components`: sections/components to edit or create with file paths.
- `responsivePlan`: behavior at 390, 430, 768, 1024, and 1440 widths.
- `states`: loading, empty, disabled, error, hover, focus, and mobile nav states relevant to the page.
- `accessibility`: headings, landmarks, labels, focus, contrast, touch targets.
- `performanceBudgets`: JS/CSS/image/font constraints and lazy-loading plan.
- `handoffChecks`: commands and browser checks to run.

## Hard Rules

- Build the actual usable page, not a marketing wrapper around screenshots.
- Use real product visuals, interactive product state, or concrete user outcome visuals.
- Do not use nested cards, decorative gradient blobs, negative letter spacing, or viewport-scaled font sizes.
- Buttons and compact UI must have stable dimensions so labels/icons cannot shift layout.
- Every visible "by segment/market/use case" claim must be visibly encoded or supported in the UI.
- Keep text inside containers at all tested viewports; fix overflow rather than hiding it.

## References

- Load `references/visual-direction-rubric.md` before choosing the art direction.
- Load `references/react-vite-tailwind.md` for React/Vite/Tailwind implementation constraints.
- Load `references/responsive-layout-rules.md` before mobile or browser verification.
