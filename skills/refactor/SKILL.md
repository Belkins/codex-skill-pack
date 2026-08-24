---
name: refactor
description: Safe refactoring with test baseline before and after — ensures no regressions while improving code quality.
---

# Safe Refactor

Refactor `$ARGUMENTS` with a safety net of tests before and after.

## Instructions

### Phase 1 — Baseline

Run the project's test suite FIRST to establish a baseline:
1. Detect test runner from package.json or project config
2. Run full test suite
3. Record: total tests, passing, failing
4. If tests already fail, note which ones (pre-existing failures)

### Phase 2 — Analyze & Refactor

Launch Agent 1 (`refactor-cleaner`) when delegation is available:
> Refactor the following: `$ARGUMENTS`
>
> Before making changes:
> 1. Read all relevant files
> 2. Understand the current structure and dependencies
> 3. Identify what to improve (dead code, duplication, naming, structure)
>
> Then refactor:
> - Make focused, incremental changes
> - Maintain all public interfaces (don't break callers)
> - Follow existing project conventions
> - Keep changes minimal and purposeful
>
> List all files modified and what changed.

### Phase 3 — Verify (parallel)

Launch 2 agents in parallel:

**Agent 2** (`tdd-guide` or another test-focused agent):
> Run the test suite again after refactoring.
> Compare results against baseline.
> Flag any NEW test failures (regressions).

**Agent 3** (`code-reviewer`):
> Review the refactored code.
> Check: did the refactor improve quality? Any bugs introduced?
> Only report issues with confidence >= 80%.

## Output Format

### Refactor: `$ARGUMENTS`

**Baseline Tests:** X/Y passing
**After Refactor:** X/Y passing
**Regressions:** None / [list]
**Changes:** [files modified with brief description]
**Review:** [findings or "Clean"]
