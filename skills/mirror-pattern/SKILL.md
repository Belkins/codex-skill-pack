---
name: mirror-pattern
description: |
  Prompt template for mirroring the structure of an existing file when spawning
  agents to create files matching an established pattern. Reliably produces
  consistent output across parallel agents where a free-form prompt would
  drift. Used for: scraper replication, test-file creation, schema migration,
  deploy-pattern replication.
allowed-tools:
  - Read
---

# /mirror-pattern — Consistent Agent Output via Reference Mirroring

When you need an agent to create a new file that matches an established
pattern (the 9th scraper, the 10th test file, the 5th integration package),
a free-form prompt invites drift. Mirroring a specific reference file
produces consistent output with far less prompting effort.

## What this skill does

Provides a vetted prompt template for spawning agents that must match an
existing pattern. The key discipline: name the exact reference file
(absolute path), list what stays the same, list what changes, and tell
the agent to Read the reference FIRST.

## The phrase template

```
Mirror the structure of `<absolute-path-to-reference>` for:
- <specific-element>: same shape, different content
- <specific-element>: same shape, different content

Read the reference file FIRST. Preserve: imports, function signatures,
error handling patterns, test coverage shape, inline comment style.
Change only: the specific content this task requires.
```

Concrete example (scraper replication):

```
Mirror the structure of `/path/to/reference/scraper/main.go`
for a new scraper at `/path/to/new-source/scraper/main.go`:

- data source: FEC bulk filings instead of state PTO portals
- output schema: campaign donations instead of PTO events
- auth: FEC API key (env: FEC_API_KEY) instead of no auth

Read the reference file FIRST. Preserve: package layout, logger setup,
retry/backoff pattern, rate-limit handling, test file shape (main_test.go),
CLI flag conventions, inline comment style.
Change only: the data source URL, schema structs, and query logic.
```

## When to use

- **Parallel agents creating similar files.** 9 scraper directories,
  9 demand-test landings, 9 seed generators — one reference, nine
  mirrors, consistent output.
- **Creating the Nth instance of an established pattern.** Once you
  have 3+ prior examples, mirror the best one instead of the most
  recent (which may itself have drifted).
- **Pattern consistency matters more than creative freedom.**
  Infrastructure plumbing, test scaffolding, adapter classes, schema
  migrations — the boring-but-critical files.
- **Cross-agent consistency.** When 4 parallel agents each produce a
  file of the same type, mirroring prevents them from diverging on
  unimportant stylistic axes.

## When NOT to use

- **First implementation of a pattern.** No reference exists yet —
  build it once, carefully, then mirror for #2 onwards.
- **Deliberate divergence is needed.** This new file really IS
  different (different transport, different auth model, different
  lifecycle). Forcing it into the reference shape creates worse code.
- **Refactor that should change the pattern across all files.** If
  the reference itself is the thing being changed, mirroring just
  propagates the old shape. Change the reference first, then mirror.
- **The reference is known to be wrong or outdated.** Don't mirror
  debt.

## Discipline

- Name the reference via **absolute path**, not relative. Relative
  paths resolve against the agent's cwd, which may differ from the
  main thread.
- Say "Read the reference FIRST" explicitly. Agents otherwise often
  skim the prompt and invent structure.
- List preserved elements AND changed elements. Don't leave either
  implicit.
- If the reference is >300 LOC, point to the specific sections to
  mirror (imports block, specific functions) rather than the whole
  file.
- Verify afterwards with `/agent-wave-verify` — mirroring reduces
  drift but doesn't eliminate silent failures.

## Why this pattern works

Reference mirroring removes accidental choices from repetitive work. Agents
still adapt the domain-specific content, while imports, error handling, CLI
conventions, and test shape stay aligned with the chosen reference. Always
review the reference first: mirroring an outdated pattern only propagates it.
