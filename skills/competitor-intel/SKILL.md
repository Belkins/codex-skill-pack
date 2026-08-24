---
name: competitor-intel
description: Compare a domain against competitors using Ahrefs — keyword gaps, traffic comparison, backlink analysis, and content opportunities.
---

# Competitive Intelligence

Compare `$ARGUMENTS` using Ahrefs data.

## Instructions

### Step 1 — Parse Input

Extract the main domain and competitors from `$ARGUMENTS`:
- Format: "domain.com vs competitor1.com, competitor2.com"
- If no competitors specified, use `mcp__ahrefs__site-explorer-organic-competitors` to find top 5

### Step 2 — Pull Metrics for All Domains

For each domain (main + competitors), use Ahrefs MCP:
1. `mcp__ahrefs__site-explorer-metrics` — traffic, keywords, DR
2. `mcp__ahrefs__site-explorer-domain-rating` — current DR
3. `mcp__ahrefs__site-explorer-backlinks-stats` — total backlinks, referring domains

### Step 3 — Keyword Gap Analysis

Use `mcp__ahrefs__site-explorer-organic-keywords` for each domain to find:
- Keywords competitors rank for that the main domain doesn't
- Keywords where competitors outrank the main domain
- Shared keywords where main domain has lower positions

### Step 4 — Report

IMPORTANT: All monetary values from Ahrefs are in USD cents. Divide by 100 for dollars.

## Competitive Intelligence: `$ARGUMENTS`

### Head-to-Head Comparison
| Metric | [Main] | [Comp 1] | [Comp 2] |
|--------|--------|----------|----------|
| DR | X | X | X |
| Traffic | X | X | X |
| Keywords | X | X | X |
| Ref Domains | X | X | X |
| Traffic Value | $X | $X | $X |

### Keyword Gaps
[Keywords competitors have that main domain doesn't]

### Content Opportunities
[Pages/topics competitors cover that main domain should target]

### Strengths & Weaknesses
- **Main domain wins at:** [areas of advantage]
- **Main domain loses at:** [areas of disadvantage]
- **Quick wins:** [low-hanging fruit to close the gap]
