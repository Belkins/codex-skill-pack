---
name: quick-fix
description: Rapid bug fix — finds root cause, implements minimal fix, and verifies with tests. From bug report to verified fix.
---

# Quick Fix

Fix `$ARGUMENTS` with investigation, implementation, and verification.

## Instructions

### Phase 1 — Investigate (read-only)

Launch one `explorer` sub-agent when delegation is available. Otherwise perform
the same read-only investigation in the main thread.

**Agent 1** (`explorer`):
> Find the root cause of: `$ARGUMENTS`
>
> 1. Search for relevant code (grep for keywords, trace the code path)
> 2. Identify the exact file and line where the bug occurs
> 3. Determine the root cause (not just the symptom)
> 4. Check for related test files
>
> Report:
> - Root cause with file:line reference
> - Suggested fix approach
> - Related test files
> - Confidence: HIGH / MEDIUM / LOW

### Phase 2 — Implement Fix

Based on Agent 1's findings, implement the minimal fix:
- Change ONLY what's necessary to fix the bug
- Don't refactor surrounding code
- Add null checks or validation if that's the fix
- Follow existing code patterns and conventions

### Phase 3 — Verify (parallel)

Launch 2 agents in parallel:

**Agent 2** (`tdd-guide` or another test-focused agent):
> Run the project's test suite to verify the fix:
> 1. Detect test runner (look for package.json scripts: test, jest, vitest, pytest)
> 2. Run the full test suite
> 3. If tests fail, identify if the failure is related to our change
> Report: test count, pass/fail, any regressions

**Agent 3** (`code-reviewer`):
> Review the fix just made for: `$ARGUMENTS`
> Check for: logic errors, security issues, missing edge cases, type safety
> Only report issues with confidence >= 80%

## Output Format

### Quick Fix: `$ARGUMENTS`

**Root Cause:** [one-line summary]
**Fix:** [files changed with brief description]
**Tests:** PASS/FAIL (X/Y)
**Review:** [any issues found, or "Clean"]
**Confidence:** HIGH / MEDIUM / LOW
