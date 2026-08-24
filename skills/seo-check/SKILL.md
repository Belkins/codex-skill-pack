---
name: seo-check
description: Quick SEO health check for a URL or domain — technical issues, keyword performance, and quick-win opportunities from Ahrefs.
---

# SEO Health Check

Audit SEO health for `$ARGUMENTS`.

## Instructions

### Step 1 — Domain Metrics (Ahrefs)

1. `mcp__ahrefs__site-explorer-metrics` with target=`$ARGUMENTS`
2. `mcp__ahrefs__site-explorer-organic-keywords` with target=`$ARGUMENTS`, limit=20
3. `mcp__ahrefs__site-explorer-top-pages` with target=`$ARGUMENTS`, limit=10

### Step 2 — On-Page Check (open or fetch the page)

If a specific URL was provided, fetch it and check:
- Title tag (exists, length 50-60 chars, contains target keyword)
- Meta description (exists, length 150-160 chars)
- H1 tag (exists, only one, contains keyword)
- Open Graph tags (og:title, og:description, og:image)
- Canonical URL
- Mobile viewport meta tag

### Step 3 — Technical Issues (if Ahrefs project exists)

Try `mcp__ahrefs__site-audit-issues` — if the domain has a site audit configured, pull issues.

### Step 4 — Report

IMPORTANT: All monetary values from Ahrefs are in USD cents. Divide by 100.

## SEO Health Check: `$ARGUMENTS`

### Overview
| Metric | Value |
|--------|-------|
| Domain Rating | X |
| Organic Traffic | X/mo |
| Organic Keywords | X |
| Referring Domains | X |

### On-Page Issues
- [Title tag issues]
- [Meta description issues]
- [H1 issues]
- [Missing structured data]

### Top Keywords
| Keyword | Position | Volume |
|---------|----------|--------|
| ... | ... | ... |

### Quick Wins
1. [Specific actionable recommendations]
2. [Low effort, high impact improvements]
