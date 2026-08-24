# React/Vite/Tailwind Landing Implementation

## Code Rules

- Prefer existing components, tokens, icons, and analytics helpers.
- Keep section edits scoped unless the design system truly needs a shared component.
- Use semantic anchors for navigation CTAs and buttons for modal/actions.
- Preserve existing tracking calls or replace them with equivalent named events.
- Lazy-load heavy interactive media below the first viewport when possible.
- Avoid viewport-width font sizing. Use responsive breakpoints and container constraints.

## Example Project Map

- Landing page: `pages/marketing/LandingPage.tsx`
- Shared landing components: `components/landing/`
- Analytics helper: `services/analytics.ts`
- Build: `npm run build`
- Tests: `npm run test:run`
