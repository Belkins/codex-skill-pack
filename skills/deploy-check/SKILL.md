---
name: deploy-check
description: Run pre-deployment validation checks
---

# Pre-Deploy Validation

Run deployment readiness checks for `$ARGUMENTS` environment. All agents report findings — no file edits.

## Instructions

Create 2 Agent tool calls in a **single message** (parallel execution):

### Agent 1 — Build & Test Validation
`subagent_type: "test-runner"`
> Run build and test validation for pre-deployment:
>
> 1. Run `pnpm build` in `api-main/` — report any TypeScript compilation errors
> 2. Run `pnpm test` in `api-main/` — report test results (total, passed, failed)
> 3. Check for any `console.log` statements that shouldn't be in production code
> 4. Verify no `.only` or `.skip` in test files (forgotten debug flags)
>
> Report:
> - Build: PASS / FAIL (with error details)
> - Tests: X/Y passing
> - Warnings: any code quality issues found

### Agent 2 — K8s & Config Validation
`subagent_type: "Explore"`, thoroughness: "very thorough"
> Validate Kubernetes manifests and configuration for deploying to: `$ARGUMENTS`
>
> Check:
> 1. **K8s manifests** in `api-main/k8s/`:
>    - Deployment has proper resource limits (CPU, memory)
>    - Health check probes are configured (liveness, readiness)
>    - Image tag strategy (not using `:latest` in production)
>    - Replica count appropriate for environment
>
> 2. **Environment variables**:
>    - Cross-reference env vars read by code (`configService.get()`, `process.env`) with K8s deployment.yaml
>    - Flag any env vars in code that are missing from K8s secrets/configmaps
>    - Check `.env.example` is up to date
>
> 3. **Recent changes** (last 5 commits on current branch):
>    - Any risky changes (database schema, auth logic, payment processing)?
>    - Any new dependencies added?
>    - Any breaking API changes?
>
> Report all findings. Do NOT edit any files.

## Output Format

After both agents complete, present the deployment verdict:

### Deploy Check: `$ARGUMENTS`

| Check | Status | Details |
|-------|--------|---------|
| TypeScript Build | PASS/FAIL | ... |
| Test Suite | X/Y passing | ... |
| K8s Manifests | OK/ISSUES | ... |
| Env Vars | OK/MISSING | ... |
| Recent Changes | SAFE/RISKY | ... |

## Verdict: GO / NO-GO

**Blockers** (if NO-GO):
- [ ] ...

**Warnings** (non-blocking):
- [ ] ...
