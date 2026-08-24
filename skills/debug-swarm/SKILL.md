---
name: debug-swarm
description: Investigate a bug with multiple competing hypotheses
---

# Competing Hypotheses Debug Swarm

Investigate `$ARGUMENTS` from 3 different angles simultaneously. All agents are read-only — they gather evidence but do NOT edit files.

## Instructions

Use three `explorer` sub-agents in parallel when the environment allows it. If
delegation is unavailable, investigate the three hypotheses sequentially.

### Agent 1 — Data/State Hypothesis
> Investigate this bug as a **data or state issue**: `$ARGUMENTS`
>
> Look for:
> - Wrong database query (incorrect field, missing filter, wrong ObjectId)
> - Stale cache (Redis returning old data)
> - Missing or null field (undefined check missing, optional field assumed present)
> - Wrong data transformation (DTO mapping, type coercion, enum mismatch)
> - Schema mismatch (code expects field that doesn't exist in DB)
>
> Search the relevant service, repository, and schema files.
> Find concrete evidence: show the exact code line where data could go wrong.
> Rate your confidence: HIGH / MEDIUM / LOW with reasoning.

### Agent 2 — Timing/Async Hypothesis
> Investigate this bug as a **timing or async issue**: `$ARGUMENTS`
>
> Look for:
> - Race condition (parallel requests modifying same resource)
> - Unresolved promise (missing await, fire-and-forget that should be awaited)
> - Queue ordering issue (BullMQ job processed before dependency is ready)
> - Transaction missing (multi-document update without MongoDB session)
> - Webhook replay (duplicate event processed, missing idempotency check)
>
> Search queue processors, webhook handlers, and service methods with multiple awaits.
> Find concrete evidence: show the exact code line where timing could cause the bug.
> Rate your confidence: HIGH / MEDIUM / LOW with reasoning.

### Agent 3 — Integration/Config Hypothesis
> Investigate this bug as an **integration or configuration issue**: `$ARGUMENTS`
>
> Look for:
> - Wrong API call (incorrect endpoint, missing header, wrong HTTP method)
> - Schema mismatch between services (HubSpot, Stripe, ChiliPiper field names changed)
> - Environment config issue (env var missing, wrong value, staging vs production mismatch)
> - CORS or cookie issue (credentials not sent, domain mismatch)
> - Dependency version conflict (package doing something unexpected)
>
> Check `.env.example`, K8s manifests, external API wrapper files.
> Find concrete evidence: show the exact code line where integration could fail.
> Rate your confidence: HIGH / MEDIUM / LOW with reasoning.

## Output Format

After all 3 agents complete, present the verdict:

### Bug Investigation: `$ARGUMENTS`

| Hypothesis | Confidence | Key Evidence |
|-----------|------------|--------------|
| Data/State | HIGH/MED/LOW | ... |
| Timing/Async | HIGH/MED/LOW | ... |
| Integration/Config | HIGH/MED/LOW | ... |

**Most Likely Cause:** [highest confidence hypothesis with explanation]

**Suggested Fix:** [specific code change with file:line]

**Verification:** [how to test the fix]
