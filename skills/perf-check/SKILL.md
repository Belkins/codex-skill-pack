---
name: perf-check
description: Performance audit — finds N+1 queries, missing indexes, blocking operations, memory issues, and pagination gaps.
---

# Performance Audit

Audit `$ARGUMENTS` for performance bottlenecks.

## Instructions

Launch 3 Explore agents in parallel (all read-only):

### Agent 1 — Database Performance
`subagent_type: "Explore"`, thoroughness: "very thorough"
> Audit database performance for: `$ARGUMENTS`
>
> Look for:
> - **N+1 queries** — loops that make individual DB calls instead of batch
> - **Missing indexes** — fields used in `find()` filters without indexes
> - **Missing .lean()** — Mongoose queries returning full documents when plain objects suffice
> - **No projection** — queries fetching all fields when only a few are needed
> - **Large populate chains** — deeply nested populate() calls
> - **Unbounded queries** — find() without limit
>
> Report each issue with file:line, severity (HIGH/MEDIUM/LOW), and suggested fix.

### Agent 2 — Async & I/O Performance
`subagent_type: "Explore"`, thoroughness: "very thorough"
> Audit async patterns for: `$ARGUMENTS`
>
> Look for:
> - **Sequential awaits** — multiple independent awaits that could be Promise.all()
> - **Missing await** — fire-and-forget that should be awaited
> - **Blocking operations** — CPU-heavy sync code in request handlers
> - **No streaming** — large responses built in memory instead of streamed
> - **No background processing** — heavy work that should be queued (BullMQ)
>
> Report each issue with file:line, severity, and suggested fix.

### Agent 3 — Memory & Scalability
`subagent_type: "Explore"`, thoroughness: "very thorough"
> Audit memory and scalability for: `$ARGUMENTS`
>
> Look for:
> - **Unbounded arrays** — arrays that grow without limit (in-memory caches, logs)
> - **No pagination** — list endpoints without limit/offset
> - **Large object creation** — creating large objects in loops
> - **Memory leaks** — event listeners not cleaned up, closures holding references
> - **No caching** — repeated expensive computations without caching
>
> Report each issue with file:line, severity, and suggested fix.

## Output Format

### Performance Audit: `$ARGUMENTS`

| Category | Issues Found | Critical | High | Medium |
|----------|-------------|----------|------|--------|
| Database | X | X | X | X |
| Async/IO | X | X | X | X |
| Memory | X | X | X | X |

**Top Issues** (critical and high only):
1. [file:line] — [description] — [fix]
2. ...
