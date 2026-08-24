---
name: audit
description: Run a parallel codebase security and quality audit with specialized reviewer agents.
---

# /audit — Parallel Codebase Security & Quality Audit

Run six specialized review lenses, in parallel waves sized to the environment's
concurrency limit, to find bugs, security issues, and silent failures across a
codebase.

## When to Use
- Before deploying to production
- After major feature sprints
- When suspicious bugs keep appearing (signals deeper issues)
- On demand: `/audit`

## Agent Configuration

Use `code-reviewer` sub-agents when available. Keep every reviewer read-only,
assign one lens per agent, and run additional waves when all six cannot execute
at once. If sub-agents are unavailable, apply the lenses sequentially.

### Agent 1: Auth & User Repository
**Focus:** Authentication, authorization, user management
- Check every repository method — are all destructured params actually used in the query?
- Check password/token flows — are tokens validated, stored, and looked up correctly?
- Check role guards — can deactivated users still authenticate?

### Agent 2: Email & Notifications
**Focus:** Mailgun, email templates, notification delivery
- Check FormData construction — are all message fields (to, cc, bcc, html, text) forwarded?
- Check template compilation — do all templates exist? Would a missing file crash the app?
- Check error handling — which email failures are swallowed vs thrown?

### Agent 3: All Repositories
**Focus:** Data access layer across ALL modules
- The #1 bug pattern: method accepts `Partial<Model>` but destructures only a subset of fields
- Check every `getOne`, `getMany`, `getWithPassword` — compare destructured params vs type definition
- Check `updateById` — does it pass through all fields?

### Agent 4: Configuration & Secrets
**Focus:** Environment variables, Docker, K8s secrets
- Is `.env` excluded from `.dockerignore`?
- Do any services use `process.env` directly instead of `ConfigService`?
- Are all required env vars validated at startup?
- Could baked-in `.env` values override K8s secrets?

### Agent 5: Business Logic (Marketplace, Billing, Sync)
**Focus:** Core business modules
- Check for race conditions in reservation/purchase flows
- Check Stripe integration — optimistic status updates, webhook idempotency
- Check sync flows — null checks on populated fields, conflict resolution

### Agent 6: Test Coverage
**Focus:** Test quality and gaps
- Find tests that reference removed code (broken assertions)
- Find critical flows with zero test coverage
- Find tests that pass but don't assert the right thing (mock returns whatever)

## Execution Template

```
Launch 6 agents in parallel:
- auth-auditor (Agent 1)
- email-auditor (Agent 2)
- repo-auditor (Agent 3)
- config-auditor (Agent 4)
- business-auditor (Agent 5)
- test-auditor (Agent 6)

Wait for all to complete.

Compile findings into severity tiers:
- CRITICAL: Security bypasses, data loss, silent failures
- IMPORTANT: Wrong behavior, dead code, test gaps
- LOW: Style issues, inconsistencies

Report all findings with evidence. Do not modify code unless the user separately
asks for fixes.
```

## Expected Output

- Findings grouped by severity and deduplicated across lenses
- Concrete file and line evidence for each actionable finding
- A short risk summary and recommended verification steps
