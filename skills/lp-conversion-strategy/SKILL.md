---
name: lp-conversion-strategy
description: Use when planning, redesigning, auditing, or building a landing page where conversion, ICP fit, positioning, offer clarity, proof, or launch readiness matters. Run before copywriting or visual implementation.
metadata:
  short-description: Plan high-converting landing pages
---

# LP Conversion Strategy

## Use When

- The user asks for a landing page, website redesign, launch page, product page, waitlist page, demo page, or high-converting homepage.
- The request includes conversion, sales, signups, demos, paid trials, waitlists, lead capture, pricing, or "make it better".
- The product is broad and needs a sharper buyer/user segment before design work starts.

Do not use this for purely internal app screens, dashboards, or style-only tweaks with no conversion surface.

## Workflow

1. Inspect the current site, repo, brief, analytics notes, and brand/project documentation when available.
2. Choose one primary page job. If the user asks for "everyone", split into segment pages and pick the highest-intent page first.
3. Produce the output contract below. Ask at most one blocking question only when ICP, offer, or CTA cannot be inferred safely.
4. Run `node scripts/validate-brief.mjs <brief.json>` when a machine-readable brief exists.
5. Hand off to `$lp-message-map`. For complex or high-stakes work, use `$swarm` when parallel specialist analysis would materially improve the result.

## Output Contract

Return a concise strategy brief with:

- `page`: URL/path or intended page.
- `primaryAudience`: concrete user/buyer segment.
- `jobToBeDone`: the progress they are trying to make.
- `triggerMoment`: why they are looking now.
- `outcome`: measurable or observable result the page promises.
- `positioningSentence`: one sentence with category, audience, outcome, and key differentiator.
- `primaryConversion`: one conversion action.
- `secondaryConversion`: optional proof/demo action that supports the primary action.
- `proofRequirements`: evidence needed for the page to be credible.
- `offerFrame`: free trial, demo, audit, purchase, lead magnet, consultation, or other.
- `antiAudience`: who the page should not optimize for.
- `risks`: conversion, legal, product, proof, or technical risks.

## Hard Rules

- The first viewport must answer: what is it, who is it for, why now, why trust it, and what action to take.
- One page gets one primary conversion action. Secondary CTAs must support proof or lower-friction evaluation.
- Claims must map to evidence: product demo, metric, screenshot, testimonial, pricing math, customer story, or source.
- Do not ship vague page goals such as "drive engagement" or "make it premium" without a measurable conversion.
- If pricing or proof appears across multiple pages, flag consistency checks before handoff.

## References

- Load `references/conversion-principles.md` for the page strategy rubric.
