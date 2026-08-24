---
name: research
description: Launch a research swarm to explore code from multiple angles
---

# Research Swarm

Launch 3 parallel Explore agents to investigate `$ARGUMENTS` from different angles. All agents are read-only — no file edits.

## Instructions

Use three `explorer` sub-agents in parallel when the environment allows it. If
delegation is unavailable, apply the three read-only lenses sequentially.

### Agent 1 — Primary Code Path
> Trace the primary code path for: `$ARGUMENTS`
>
> Find the main implementation files, entry points, and core logic flow. Report:
> - Key files with line numbers
> - Data flow from input to output
> - Dependencies and injected services
>
> Do NOT edit any files. Research only.

### Agent 2 — Callers & Integration Points
> Find all callers, consumers, and integration points for: `$ARGUMENTS`
>
> Search for:
> - Who imports or calls this code
> - API endpoints that expose it
> - Queue processors or cron jobs that trigger it
> - Cross-module dependencies
>
> Report file paths and relationship map. Do NOT edit any files.

### Agent 3 — Tests, Docs & Edge Cases
> Check tests, documentation, and edge cases for: `$ARGUMENTS`
>
> Find:
> - Existing test files and what they cover
> - Test gaps (untested branches, missing edge cases)
> - Related documentation in `docs/`, `AGENTS.md`, `CONTRIBUTING.md`, or README files
> - Known limitations or TODOs in code comments
>
> Report findings with file:line references. Do NOT edit any files.

## Output Format

After all 3 agents complete, synthesize their findings into a brief summary:
1. **Architecture** — How it works (from Agent 1)
2. **Integration Map** — Who uses it (from Agent 2)
3. **Coverage & Gaps** — What's tested and what's not (from Agent 3)
4. **Key Files** — Consolidated list of important file paths
