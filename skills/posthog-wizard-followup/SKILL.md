---
name: posthog-wizard-followup
description: Run the PostHog wizard on a Nuxt or Vitest-tested codebase with baseline-test capture before/after — auto-applies the defensive trackEvent() wrapper if the wizard's `useNuxtApp()` injections break unit tests.
---

# PostHog Wizard Follow-up

`npx posthog-wizard@latest` instruments business-event hooks (sign-in, purchase, onboarding, etc.) with raw `useNuxtApp().$posthog?.capture(...)` calls. In Nuxt runtime this works via auto-import; in **Vitest unit tests** `useNuxtApp` is unmocked and every instrumented method throws `ReferenceError`. This skill wraps the wizard run with a before/after test gate and auto-applies the `trackEvent()` defensive wrapper to any file the wizard touched that introduces failures.

This workflow captures a recurring failure mode where wizard-added Nuxt calls break otherwise isolated Vitest unit tests.

## When to use
- About to run `npx posthog-wizard@latest` on a Nuxt 4 / Vue 3 SPA that has a Vitest test suite.
- Already ran the wizard and now have new test failures referencing `useNuxtApp is not defined`.

## Parameters
- `<client-app-path>` — absolute path to the Nuxt app root (for example, `/path/to/project/client`). It must contain `package.json` and a `pnpm test:unit` script.

## Flow

### 1. Capture pre-wizard baseline
```bash
cd <client-app-path>
pnpm test:unit 2>&1 | tail -5 > /tmp/posthog-pre.txt
```
Record `Tests:` line: `<N> passed (<N>)`. If anything fails pre-wizard, STOP — fix existing failures first so post-wizard diff is clean signal.

### 2. Run the wizard (interactive — user picks framework `nuxt` + project)
```bash
npx posthog-wizard@latest
```
This is interactive. Pick `nuxt` if the wizard can't auto-detect. The wizard:
- Adds `posthog-js` dep (skip if already present)
- Adds `NUXT_PUBLIC_POSTHOG_KEY` + `NUXT_PUBLIC_POSTHOG_HOST` to all `.env.*` files
- Adds `posthog.publicKey/host` to `nuxt.config.ts runtimeConfig`
- Builds on top of any existing `app/plugins/posthog.client.ts` (won't overwrite)
- Instruments 5–7 business-event captures across stores + pages

### 3. Capture which files the wizard touched
```bash
git status -s | awk '$1 == "M" {print $2}'
```
Note the files with `useNuxtApp().$posthog?.capture()` injections — typically:
- `app/stores/user/user.ts` (sign-in/out, password setup)
- `app/pages/marketplace/checkout/[id].vue`
- `app/pages/onboarding.vue`

### 4. Re-run tests
```bash
pnpm test:unit 2>&1 | tail -5 > /tmp/posthog-post.txt
```
Compare `Tests:` line vs baseline.

**If pass count unchanged**, wizard didn't break anything → skip step 5.

**If failures appeared**, grep for the error pattern:
```bash
pnpm test:unit 2>&1 | grep -E "useNuxtApp is not defined" | head -3
```
Each match maps to a file the wizard injected into.

### 5. Apply the `trackEvent()` defensive wrapper (only to files that broke tests)

For each broken file (typically a **store** file — pages usually destructure `$posthog` at setup time and unit tests don't mount pages), add this helper near the top of the file (after imports, before exports):

```typescript
// Defensive wrapper: useNuxtApp() is auto-imported in Nuxt runtime but not
// available in Vitest unit tests. Capture failures are non-critical
// (analytics), so we swallow any error rather than break business logic
// or unit tests.
const trackEvent = (name: string, props?: Record<string, unknown>) => {
  try {
    useNuxtApp().$posthog?.capture(name, props)
  } catch {
    // useNuxtApp not available (unit test / non-Nuxt context) — skip
  }
}
```

Then replace every `useNuxtApp().$posthog?.capture(...)` call in that file with `trackEvent(...)`. The wrapper accepts identical args, so it's a 1:1 swap.

**Don't** apply the wrapper to page files (`*.vue` `<script setup>` files) unless those pages have unit tests that fail. Pages typically work because no Vitest config mounts them.

### 6. Re-run tests + confirm green
```bash
pnpm test:unit 2>&1 | tail -5
```
Pass count should now match baseline + (wizard's new tests, if any). If still failing, surface specific error.

### 7. Mirror env to backend + Vercel (separate concern, document only)

The wizard only sets `.env.*` for the client. For full operation:
- Copy `NUXT_PUBLIC_POSTHOG_KEY` value into the backend's `POSTHOG_API_KEY` env (same Project Key works for `posthog-node`).
- Mirror `NUXT_PUBLIC_POSTHOG_KEY` + `NUXT_PUBLIC_POSTHOG_HOST` to Vercel via `vercel env add` for production + development (preview hits CLI v50 dance — see `vercel-env-flip`).

## Report format

```
posthog-wizard-followup: <client-app-path>
  baseline: <N> tests passing
  wizard touched: <list of files>
  post-wizard: <M> tests passing (Δ = <diff>)
  wrapper applied to: <files where applied>
  final: <P> tests passing
  verdict: PASS | NEEDS_REVIEW
```

## Anti-patterns
- Don't mock `useNuxtApp` in test setup — invasive, breaks if Nuxt's auto-import shape changes.
- Don't strip your existing manual `posthog.client.ts` plugin pre-wizard — wizard detects it and cooperates, preserving your masking config.
- Don't apply the wrapper to ALL wizard-touched files preemptively — pages don't break tests in most setups; only fix what's actually red.
- Don't skip the baseline capture — without it you can't distinguish wizard-caused failures from pre-existing ones.
