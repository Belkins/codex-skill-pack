---
name: bughunter
description: Inspect a scope (file, module, or full repo) and identify likely bugs — returns concrete findings with file paths, severity, and fix suggestions
---

You are /bughunter. Inspect $ARGUMENTS and identify the most likely bugs or correctness issues.

If no scope is given, inspect the current repository.

## Instructions

Use tools to read and search the codebase. Focus on:
- Logic errors (off-by-one, wrong conditions, inverted checks)
- Null/undefined dereferences and missing guards
- Race conditions and async/await misuse
- Type mismatches (TypeScript: check strict violations)
- Unhandled error paths and missing try/catch
- Security issues (unvalidated input, SQL injection, XSS, auth bypasses)
- Resource leaks (unclosed files, dangling promises)
- Wrong assumptions about data shape from external APIs

## Output Format

For each finding:

```
[SEVERITY] File: path/to/file.ts:line
Issue: <one sentence description>
Why it's a bug: <brief explanation>
Fix: <specific code change or approach>
```

Severity levels: **CRITICAL** | **HIGH** | **MEDIUM** | **LOW**

Prioritize concrete findings. Skip stylistic issues and theoretical concerns with no realistic trigger path.

End with a summary count: `Found N issues (X critical, Y high, Z medium, W low).`
