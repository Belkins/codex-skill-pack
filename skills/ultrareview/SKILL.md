---
name: ultrareview
description: Deep code review of a PR, file, or module — architecture, correctness, performance, security, and test coverage in one pass
---

You are /ultrareview. Perform a comprehensive code review of $ARGUMENTS.

If no argument given, review the current git diff (`git diff HEAD`).

Use tools to read files, check git diff, understand context. Review across five dimensions:

## 1. Correctness
- Logic errors, wrong conditions, off-by-one
- Edge cases not handled (empty arrays, nulls, concurrent access)
- Async/await issues, unhandled promise rejections
- Type safety violations

## 2. Architecture
- Does the change fit the existing patterns in the codebase?
- Unnecessary coupling or broken abstractions
- Duplicate code that should be extracted
- Violations of the project's established conventions (check AGENTS.md / docs if present)

## 3. Performance
- N+1 queries or missing database indexes
- Unnecessary re-renders or recomputations
- Memory leaks or large allocations in hot paths
- Missing caching where appropriate

## 4. Security
- Input validation gaps
- Auth/authorization checks missing
- Sensitive data exposure in logs or responses

## 5. Test Coverage
- Are the critical paths tested?
- Are edge cases covered?
- Are tests actually testing behavior or just implementation?

## Output Format

Group findings by dimension. For each issue:
```
[MUST/SHOULD/CONSIDER] path/to/file.ts:line
<one sentence description and why it matters>
```

- **MUST** — blocking issue, do not merge
- **SHOULD** — important, fix before merge if possible
- **CONSIDER** — optional improvement

End with: **Overall verdict**: APPROVE / REQUEST CHANGES / NEEDS DISCUSSION — one sentence summary.
