---
name: growth-scan
description: Pull Ahrefs metrics for any domain — traffic, keywords, backlinks, domain rating — and analyze growth trends.
---

# Growth Scan

Analyze growth metrics for `$ARGUMENTS` using Ahrefs.

## Instructions

### Step 1 — Pull Core Metrics

Use Ahrefs MCP tools (call the `doc` tool first for any tool you haven't used before):

1. **Site Metrics:** `mcp__ahrefs__site-explorer-metrics` with target=`$ARGUMENTS`
   - Organic traffic, keywords, domain rating, referring domains

2. **Traffic History:** `mcp__ahrefs__site-explorer-metrics-history` with target=`$ARGUMENTS`
   - Monthly traffic trend (last 6 months)

3. **DR History:** `mcp__ahrefs__site-explorer-domain-rating-history` with target=`$ARGUMENTS`
   - Domain rating trend

4. **Top Pages:** `mcp__ahrefs__site-explorer-top-pages` with target=`$ARGUMENTS`, limit=10
   - Best performing pages by traffic

5. **Top Keywords:** `mcp__ahrefs__site-explorer-organic-keywords` with target=`$ARGUMENTS`, limit=15
   - Top organic keywords with positions

### Step 2 — Analyze Trends

Compare current metrics vs previous periods:
- Traffic: growing, flat, or declining?
- Keywords: gaining or losing positions?
- Backlinks: acquiring new referring domains?
- DR: improving?

### Step 3 — Report

IMPORTANT: All monetary values from Ahrefs are in USD cents. Divide by 100 to show dollars.

## Growth Report: `$ARGUMENTS`

### Key Metrics
| Metric | Current | Trend |
|--------|---------|-------|
| Organic Traffic | X/mo | up/down X% |
| Organic Keywords | X | +/- X |
| Domain Rating | X | +/- X |
| Referring Domains | X | +/- X |
| Traffic Value | $X/mo | +/- |

### Traffic Trend (6 months)
[Show monthly numbers or simple ASCII trend]

### Top Pages
| Page | Traffic | Keywords |
|------|---------|----------|
| ... | ... | ... |

### Top Keywords
| Keyword | Position | Volume | Traffic |
|---------|----------|--------|---------|
| ... | ... | ... | ... |

### Analysis
- **Strengths:** [what's working]
- **Opportunities:** [untapped potential]
- **Risks:** [declining areas]
- **Recommended Actions:** [3-5 specific actions]
