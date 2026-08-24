# QA Rubric

## Browser

- Check mobile and desktop screenshots.
- Fail blank, spinner-only, loading-only, or missing-asset captures.
- Fail horizontal overflow at target widths.
- Fail uncaught console errors.

## Conversion

- First viewport shows brand, promise, CTA, and proof.
- Primary CTA is visible and works.
- Secondary CTA supports evaluation.
- No unsupported proof claims appear as facts.

## Production Hygiene

- No `localhost`, `127.0.0.1`, staging domains, or dev ports in built HTML.
- No obvious secret strings in HTML.
- Asset paths resolve.
