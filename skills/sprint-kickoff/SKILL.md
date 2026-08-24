---
name: sprint-kickoff
description: Break down a sprint goal into tasks with estimates
---

# Sprint Planning Swarm

Break down `$ARGUMENTS` into implementable tasks with architecture review and estimates.

## Instructions

Create 3 Agent tool calls in a **single message** (parallel execution):

### Agent 1 — Task Breakdown
`subagent_type: "planner"`
> Break down this sprint goal into implementation tasks: `$ARGUMENTS`
>
> For each task, identify:
> - **What**: Clear description of the change
> - **Where**: Specific files to create or modify (with paths)
> - **Dependencies**: Which tasks must complete before this one
> - **Acceptance criteria**: How to verify it's done
>
> Follow the module structure documented in `AGENTS.md`, `CONTRIBUTING.md`, and existing nearby code.
> Consider: schema changes, service logic, controller endpoints, DTOs, tests, documentation.
>
> Output a numbered task list with file ownership per task.

### Agent 2 — Architecture Assessment
`subagent_type: "architect"`
> Assess the architectural impact of: `$ARGUMENTS`
>
> Analyze:
> - Which existing modules are affected?
> - Are new modules needed, or extend existing ones?
> - Cross-module dependencies (imports, shared services)
> - Database schema changes (new collections, index changes, migrations)
> - Queue/background job requirements
> - External API integration changes (Stripe, HubSpot, etc.)
> - Breaking changes to existing API contracts
>
> Flag risks:
> - High-risk areas (payment logic, auth, data integrity)
> - Performance concerns (N+1 queries, missing indexes)
> - Technical debt that should be addressed first
>
> Reference existing architecture in `api-main/src/modules/`.

### Agent 3 — Estimation & Parallelization
`subagent_type: "planner"`
> Estimate complexity and plan parallel work streams for: `$ARGUMENTS`
>
> For the sprint goal, assess:
> - **Complexity per area**: Schema (S/M/L), Service (S/M/L), Controller (S/M/L), Tests (S/M/L)
> - **Total scope**: Small (1-2 days), Medium (3-5 days), Large (1-2 weeks)
> - **Parallel streams**: Which tasks can run simultaneously?
> - **Critical path**: What's the longest sequential chain?
> - **Risk buffer**: What might take longer than expected?
>
> Suggest team splits:
> - Stream A: [tasks that can be built independently]
> - Stream B: [tasks that can be built independently]
> - Sequential: [tasks that must happen in order]

## Output Format

After all 3 agents complete, compile the sprint plan:

### Sprint Plan: `$ARGUMENTS`

**Scope:** Small / Medium / Large
**Estimated Duration:** X days
**Risk Level:** Low / Medium / High

#### Tasks
| # | Task | Files | Complexity | Stream | Depends On |
|---|------|-------|------------|--------|------------|
| 1 | ... | ... | S/M/L | A/B/Seq | - |

#### Architecture Notes
- [Key decisions from Agent 2]

#### Risks & Mitigations
- [Flagged items from Agent 2]

#### Suggested Work Streams
- **Stream A:** Tasks [X, Y, Z] (can start immediately)
- **Stream B:** Tasks [A, B, C] (can start immediately)
- **Sequential:** Tasks [D, E] (must wait for Stream A)
