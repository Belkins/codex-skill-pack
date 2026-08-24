---
name: ahrefs-budget-check
description: |
  Preflight check on Ahrefs subscription-info-limits-and-usage before running
  bulk keyword queries. Prevents 'API units limit reached' errors mid-batch.
  Estimates cost per operation (keywords-explorer-overview ~50 units minimum,
  serp-overview variable, site-explorer-organic-keywords 25+). Warns when
  fewer than 100 units remain before a bulk call that needs 500+.
allowed-tools:
  - Bash
  - Read
---

# /ahrefs-budget-check — Preflight Ahrefs API Budget

Before running any bulk Ahrefs MCP query, check the subscription's unit
budget. Abort if insufficient. Calculate expected cost vs available. Warn
before burning the last of the monthly quota on low-value speculative
queries.

## What this skill does

1. Calls `mcp__ahrefs__subscription-info-limits-and-usage` (free, 0 units).
2. Reads `units_available`, `units_used`, `units_total`, `usage_reset_date`.
3. Estimates the cost of the planned batch using the cost table below.
4. Compares (expected cost + 500 buffer) against (units available).
5. If insufficient: stops the Ahrefs batch and falls back to public web research.
6. If close to the edge: asks whether this is the one strategic query
   worth burning the last of the budget on.

## Cost table

Approximate costs observed in practice. Actual numbers vary by plan,
country, date range, result size, and endpoint changes. Check current Ahrefs
documentation and the live usage response before relying on these estimates.

| Endpoint | Cost per call | Notes |
|----------|---------------|-------|
| `subscription-info-limits-and-usage` | 0 | Free check, always safe |
| `keywords-explorer-overview` | ~50 units minimum (fixed) | Cost is per-call, not per-keyword — batch your keywords |
| `serp-overview` | ~25 units per keyword | Scales linearly with keyword count |
| `keywords-explorer-matching-terms` | ~10-30 units per call | Depends on result set size |
| `keywords-explorer-related-terms` | ~10-30 units per call | Similar to matching-terms |
| `site-explorer-organic-keywords` | ~25 units per call | Per domain |
| `site-explorer-top-pages` | ~25 units per call | Per domain |
| `site-explorer-domain-rating` | ~5 units per call | Cheap |
| `site-explorer-backlinks-stats` | ~25 units per call | Per domain |
| `site-audit-issues` | Variable | Depends on project size |

Cost expectations for common workflows:

- **Quick KD check (1 keyword):** ~50 units (one keywords-explorer-overview)
- **Cluster analysis (10 keywords + SERP):** 50 + 10×25 = ~300 units
- **Full idea audit (cluster + 3 competitors):** ~500-700 units
- **Portfolio pass (9 ideas × full audit):** 4,500-6,500 units

## Rules of thumb

1. **Keep a 500-unit buffer.** Never start a bulk call that would leave
   you under 500 remaining. Other skills, sessions, and ad-hoc checks need
   headroom.
2. **Never burn the last 100 units on speculative queries.** Save that
   quota for the ONE strategic query that actually matters — the one
   where the answer directly drives a go/no-go decision.
3. **Fallback to public web research when exhausted.** Triangulation via search
   snippets ("<keyword> keyword difficulty", "<keyword> monthly searches
   site:ahrefs.com") gets you directionally correct numbers with zero
   Ahrefs units. The 10k-mrr-ideas SEO_OPPORTUNITY.md templates document
   this pattern.
4. **Batch where possible.** `keywords-explorer-overview` accepts an
   array — 10 keywords in one call costs the same ~50 units as 1 keyword.
5. **Check before, not during.** The error "API units limit reached"
   mid-batch wastes everything already sent; the batch is not refunded.

## Why the preflight matters

Bulk research can exhaust a monthly quota before the highest-value queries
run. Estimate the whole batch first, reserve headroom, and prioritize the
queries whose answers can change a decision. When the quota is too low,
reduce the batch or use lower-cost public-source research with appropriately
lower confidence.

## Reset timing

Ahrefs billing is monthly on the subscription's renewal date (NOT calendar
month 1st). Check `usage_reset_date` in the `subscription-info-limits-and-usage`
response to know when the quota refills.

Rule: if `usage_reset_date` is within 3 days, it's often worth waiting
rather than falling back to public web research — unless the analysis is blocking
something time-sensitive.

## Workflow

1. Before any bulk Ahrefs call, run `mcp__ahrefs__subscription-info-limits-and-usage`.
2. Read `units_available`.
3. Estimate batch cost from the cost table.
4. If `(cost + 500) > available`: abort, ask the user whether to proceed
   anyway, or fall back to public web research.
5. If close to `usage_reset_date`, offer to wait.
6. Log the actual cost after the batch to refine the cost table for next
   time.
