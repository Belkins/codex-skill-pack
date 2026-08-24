---
name: monetize-idea
description: Generate monetization strategy for a product — revenue models, pricing tiers, financial projections, and go-to-market plan.
---

# Monetization Strategy

Develop monetization plan for `$ARGUMENTS`.

## Instructions

Launch 2 agents in parallel:

### Agent 1 — Revenue Model Analysis
`subagent_type: "monetization-strategist"`
> Analyze monetization options for: `$ARGUMENTS`
>
> Evaluate these revenue models:
> 1. **Subscription/SaaS** — monthly/annual tiers
> 2. **Usage-based** — pay per API call, per user, per feature
> 3. **Freemium** — free tier + premium upsell
> 4. **Marketplace/Commission** — take a cut of transactions
> 5. **One-time purchase** — lifetime deals
> 6. **Advertising** — if audience-based
> 7. **Data/API licensing** — if data is valuable
>
> For the top 2-3 models, provide:
> - Pricing structure with specific numbers
> - Pros and cons
> - Revenue projections (100, 1K, 10K customers)
> - Examples of similar products using this model

### Agent 2 — Market & GTM Analysis
`subagent_type: "business-planner"`
> Analyze the market opportunity for: `$ARGUMENTS`
>
> Research:
> 1. **Target market size** — TAM, SAM, SOM estimates
> 2. **Customer segments** — who pays, how much, why
> 3. **Competitive pricing** — what do alternatives cost?
> 4. **Distribution channels** — where to find customers
> 5. **First 100 customers plan** — specific tactics
>
> Provide specific numbers, not generic advice.

## Output Format

## Monetization Strategy: `$ARGUMENTS`

### Recommended Revenue Model
[Primary model with reasoning]

### Pricing Tiers
| Tier | Price | Features | Target |
|------|-------|----------|--------|
| Free | $0 | ... | Lead gen |
| Pro | $X/mo | ... | SMBs |
| Enterprise | $X/mo | ... | Large orgs |

### Revenue Projections
| Milestone | Customers | MRR | ARR |
|-----------|-----------|-----|-----|
| 6 months | X | $X | $X |
| 12 months | X | $X | $X |
| 24 months | X | $X | $X |

### Go-to-Market
1. [First 100 customers tactics]
2. [Scaling tactics]

### Risks & Mitigations
- [Key risks with specific mitigations]
