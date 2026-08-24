---
name: debugging-guide
description: Systematic debugging methodology — reproduce, isolate, hypothesize, fix, verify. Reference guide for bug investigation.
---

# Systematic Debugging Guide

Diagnose and fix bugs using a structured approach.

## Instructions

Given a bug description (via `$ARGUMENTS` or conversation), follow these steps:

### Step 1 — Reproduce the Bug

1. Gather information: error message, stack trace, steps to reproduce, environment
2. Write a failing test that reproduces the issue
3. Run the test to confirm it fails consistently

### Step 2 — Isolate the Problem

1. Read the error stack trace to identify the failing function/file
2. Add temporary logging at each step in the call chain
3. Use binary search: narrow down which step produces unexpected output
4. Check: is the data wrong? Is the query wrong? Is the logic wrong?

### Step 3 — Form a Hypothesis

Common bug patterns in this codebase:
- **Type mismatch** — string ID vs ObjectId, case sensitivity
- **Async/await missing** — Promise returned instead of value
- **Case sensitivity** — MongoDB exact match vs expected fuzzy match
- **Reference not populated** — ObjectId instead of full object
- **Missing null check** — accessing property on null result
- **Wrong repository method** — querying by wrong field

### Step 4 — Investigate the Code

1. Read the failing function and its dependencies
2. `grep` for how the problematic field/method is used elsewhere
3. Check if similar patterns work correctly in other modules
4. Verify database indexes and query patterns

### Step 5 — Design the Fix

1. Choose the simplest correct fix
2. Prefer normalizing data at the boundary (service layer)
3. Add defense in depth where appropriate
4. Do NOT fix symptoms — fix root causes

### Step 6 — Verify the Fix

1. Run the reproduction test — it should now pass
2. Add regression tests for edge cases (case variations, null values, empty arrays)
3. Run full test suite: `pnpm test`
4. Run build: `pnpm build`
5. Remove any temporary debug logging

### Step 7 — Document

1. Write a clear commit message explaining the root cause and fix
2. If the bug pattern is non-obvious, consider saving a memory for future sessions

## Debugging Techniques

- **Logging**: `Logger` from `@nestjs/common` (not console.log)
- **MongoDB queries**: `mongoose.set('debug', true)` in dev
- **Queue jobs**: Check `queue.getFailed()` for failed job data
- **Redis**: `redis-cli KEYS bull:*` to inspect queues
- **Unit test focus**: `it.only(...)` or `describe.only(...)`
