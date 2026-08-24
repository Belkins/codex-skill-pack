---
name: lp-message-map
description: Use when writing or revising landing-page copy, hero positioning, section order, CTAs, proof blocks, comparison language, FAQs, objections, or offer variants after the conversion strategy is known.
metadata:
  short-description: Write conversion-first page narratives
---

# LP Message Map

## Use When

- A landing-page strategy exists and needs copy, section order, proof placement, CTA language, or objection handling.
- The page has too many competing CTAs, broad claims, weak proof, duplicated testimonials, or unclear offer framing.
- The user asks to improve conversion copy without yet touching frontend implementation.

## Workflow

1. Start from `$lp-conversion-strategy` output or infer the missing strategy briefly.
2. Map the page as a persuasion sequence, not a list of features.
3. Produce the output contract below.
4. Run `node scripts/lint-copy.mjs <message-map.json>` when a machine-readable map exists.
5. Hand off to `$lp-design-build` only after the primary CTA, proof claims, and objections are coherent.

## Output Contract

Return a message map with:

- `hero`: eyebrow, H1, subhead, primary CTA, secondary CTA, above-fold proof.
- `sections`: ordered list where each section has a job, headline, key copy, proof asset, and CTA role.
- `proofClaims`: every major claim with evidence type and source/status.
- `offer`: price/trial/demo terms, risk reversal, upgrade or lead-capture moment.
- `objections`: at least five objections with exact page copy or FAQ answers.
- `comparisonFrame`: what alternatives users consider and how the page handles them.
- `analyticsHypothesis`: primary metric, secondary metric, activation event, and expected behavior change.

## Hard Rules

- H1 must name a concrete category, user moment, or outcome. Avoid empty claims like "master anything".
- Keep one primary CTA label for the page. Repeated instances are fine; competing primary labels are not.
- Every proof claim must have an evidence type. Mark missing proof as `needed`, not as fact.
- Do not invent users, ratings, counts, app-store claims, or customer names.
- Objection copy must answer real hesitation: time, price, trust, quality, privacy, setup, risk, cancellation, or fit.

## References

- Load `references/section-patterns.md` for conversion-safe section sequences.
- Load `references/cta-taxonomy.md` when the CTA stack is unclear.
- Load `references/objection-patterns.md` when the page needs FAQs or trust copy.
