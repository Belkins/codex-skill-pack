---
name: lp-verification-gate
description: Use after landing-page implementation or before launch/deploy to verify conversion quality, responsive layout, accessibility basics, CTA paths, browser rendering, performance budgets, and production hygiene.
metadata:
  short-description: QA landing pages before launch
---

# LP Verification Gate

## Use When

- A landing page has been changed and needs pre-launch verification.
- The user asks for browser QA, conversion audit, responsive QA, performance check, CTA smoke, visual polish review, or deploy readiness.
- A screenshot, local preview, or production page may be blank, spinner-only, clipped, overflowing, or visually inconsistent.

## Workflow

1. Run local build/test commands appropriate to the repo.
2. Start a local preview server when the page needs a browser.
3. Run browser checks at 390, 430, 768, 1024, and 1440 widths.
4. Verify CTA paths, forms, demo affordances, console errors, and no horizontal overflow.
5. Scan built or production HTML for `localhost`, `127.0.0.1`, staging URLs, leaked keys, or broken asset references.
6. Report pass/fail with exact commands, artifacts, and residual risk.

## Required Checks

- First viewport has brand, promise, primary CTA, and proof without mobile clipping.
- Screenshots are not blank, spinner-only, or loading-only after a delayed render.
- `document.documentElement.scrollWidth <= clientWidth + 1` at every target width.
- Primary CTA and secondary CTA paths work or intentionally open modals.
- Button text, nav labels, hero text, and compact cards fit at mobile widths.
- Console has no uncaught runtime errors.
- Production/build HTML has no localhost or staging references.
- Bundle/performance budgets are checked when the repo exposes a command.

## Scripts

- `node scripts/verify-landing-page.mjs <url> [--out <dir>]`
- `node scripts/check-cta-paths.mjs <file-or-url>`
- `node scripts/check-html-leaks.mjs <file-or-url>`

## References

- Load `references/qa-rubric.md` for pass/fail criteria.
- Load `references/conversion-review-rubric.md` for reviewer-style findings.
