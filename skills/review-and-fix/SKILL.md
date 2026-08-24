---
name: review-and-fix
description: Implement a change with parallel code review and testing
---

# Review + Implement Swarm

Implement `$ARGUMENTS` with built-in code review and test verification.

## Instructions

### Phase 1 — Implement (sequential)

Launch Agent 1 first:

**Agent 1** (`worker`, with explicit ownership of the implementation files):
> Implement the following change: `$ARGUMENTS`
>
> Follow project conventions:
> - Framework patterns from `AGENTS.md`, `CONTRIBUTING.md`, and nearby modules
> - Language conventions already established in the repository
> - No implicit `any`, proper null checks, use DTOs
>
> Keep changes minimal and focused. Don't refactor surrounding code.
> List all files you modified when done.

### Phase 2 — Review + Test (parallel, after Phase 1)

After Agent 1 completes, launch Agent 2 and Agent 3 in a **single message** (parallel):

**Agent 2** (`code-reviewer`):
> Review the code changes just made for: `$ARGUMENTS`
>
> Check the files modified by the implementation agent. Look for:
> - Logic errors or bugs
> - Security vulnerabilities (injection, auth bypass, data exposure)
> - Missing error handling (null checks, try/catch where needed)
> - TypeScript issues (any types, missing return types)
> - Convention violations (naming, file structure, import order)
>
> Only report issues with confidence >= 80%. Include file:line references.

**Agent 3** (`tdd-guide` or another test-focused agent):
> Run tests to verify the changes for: `$ARGUMENTS`
>
> Steps:
> 1. Detect the affected project root and run its configured build/typecheck command
> 2. Run the relevant focused tests, then the broader suite when proportionate
> 3. If new test files exist for the changed module, report coverage
> 4. If tests fail, identify the root cause and suggest a fix
>
> Report: build status, test count, pass/fail, any regressions.

## Output Format

After all agents complete, present:

### Implementation Summary
- **Changes:** [files modified by Agent 1]
- **Build:** PASS/FAIL (from Agent 3)
- **Tests:** X/Y passing (from Agent 3)
- **Review Issues:** [count by severity from Agent 2]

### Action Items
- [ ] [Any issues that need manual fixing]
