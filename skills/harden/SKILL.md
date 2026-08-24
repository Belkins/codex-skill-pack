---
name: harden
description: Audit and harden Supabase edge functions — CORS lockdown, JWT auth, secret cleanup, rate limiting
---

# /harden — Supabase Security Hardening

Audit and fix security issues in Supabase edge functions and environment configuration for `$ARGUMENTS`.

## Instructions

Create 3 Agent tool calls in a **single message** (parallel execution), all with `subagent_type: "security-reviewer"`:

### Agent 1 — CORS & Origin Policy
> Audit CORS configuration across all Supabase edge functions for: `$ARGUMENTS`
>
> Check:
> - Any edge function using `'Access-Control-Allow-Origin': '*'` — should be restricted to specific domains
> - Verify a shared CORS utility exists (`_shared/cors.ts` or similar) with origin allowlist
> - Check that webhook functions (Stripe, Customer.io, RevenueCat) do NOT have CORS headers
> - Verify OPTIONS preflight handling is consistent
> - Check if the origin allowlist includes both production AND localhost for development
>
> Report findings with severity and file:line references.
> For each wildcard CORS, recommend the exact fix using the shared utility pattern.

### Agent 2 — Authentication & Authorization
> Audit JWT authentication on all edge functions for: `$ARGUMENTS`
>
> Check:
> - Which functions accept POST requests without JWT verification?
> - For functions WITH JWT: is `supabase.auth.getUser(token)` used (not just token presence)?
> - Does userId come from JWT (secure) or from request body (spoofable)?
> - Are subscription/payment functions protected? (create-checkout, cancel, etc.)
> - Rate limiting: which functions have it, which need it?
> - Webhook functions: do they verify signatures (Stripe signature, HMAC, Bearer token)?
> - Is there a shared auth utility (`extractBearerToken` or similar)?
>
> Report findings with severity and file:line references.
> For each unprotected function, provide the exact JWT auth block to add.

### Agent 3 — Secrets & Environment
> Audit secrets management for: `$ARGUMENTS`
>
> Check:
> - `.env` files: any server secrets with `VITE_` prefix? (exposes to browser)
> - `.env` files: any `SERVICE_ROLE_KEY`, auth tokens, or webhook secrets present? (should be in Supabase secrets only)
> - `.env.example`: does it document what goes where? (Supabase secrets vs Vercel env vs local)
> - Git history: `git log -p --all -S "AIza" -S "sk_live" -S "whsec_" -S "sntrys_"` for leaked secrets
> - Edge functions: do any hardcode secrets instead of using `Deno.env.get()`?
> - `.gitignore`: are `.env`, `.env.local`, `.vercel/` all listed?
> - Compiled output: search `dist/`, `build/`, `.next/` for API key patterns
>
> Report findings with severity and file:line references.

## Output Format

After all 3 agents complete, compile a hardening report:

### Hardening Report: `$ARGUMENTS`

| Category | Issues Found | Already Secure |
|----------|-------------|----------------|
| CORS | X wildcard, Y correct | Z functions |
| Auth | X unprotected, Y protected | Z functions |
| Secrets | X exposed, Y correct | Z variables |

**Critical Fixes** (with exact code changes)

**Recommended Actions** (ordered by severity)
