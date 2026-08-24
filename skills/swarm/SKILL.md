---
name: swarm
description: "Coordinate a swarm of specialist agents for a creation, planning, strategy, testing, execution, build, research, or review goal. Use when the user asks to invoke a swarm, use multiple agents, parallelize agent work, delegate planning or implementation, or coordinate builders, testers, strategists, reviewers, and executors."
---

# Swarm

## Overview

Use this skill to coordinate multiple specialist agents around one goal while keeping ownership, verification, and integration under control.

## Operating Rules

- Follow the active system and developer instructions for whether subagents may be spawned.
- Use real subagents only when the user explicitly requested swarm or multi-agent work and the environment provides suitable tools.
- If subagents are unavailable or disallowed, run the same roles sequentially in the main thread and say so briefly.
- Keep the main agent responsible for final integration, correctness, and user communication.
- Never delegate the immediate blocking step if the main thread needs that result before doing anything else.

## Workflow

1. Define the mission.
   - Restate the goal, acceptance criteria, constraints, repo/workspace, deadline, and risk level.
   - Identify the minimum useful swarm size. Use 2-5 agents for most tasks.
2. Split the work.
   - Planner or strategist: clarify approach, risks, sequence, and tradeoffs.
   - Explorer or researcher: inspect code, docs, APIs, product context, or alternatives. Read-only by default.
   - Builder or executor: implement a bounded slice with a clear file or module ownership scope.
   - Tester or verifier: run tests, browser checks, logs, or review against acceptance criteria.
   - Reviewer or integrator: find regressions, reconcile outputs, and prepare final recommendations.
3. Assign ownership.
   - Give each worker a disjoint write set when code changes are involved.
   - Tell workers they are not alone in the codebase, must not revert others' work, and must adapt to nearby changes.
   - Require each worker to report changed files, tests run, failures, and residual risk.
4. Launch and continue.
   - Spawn independent sidecar tasks in parallel when they materially advance the goal.
   - Continue local non-overlapping work while agents run.
   - Wait only when the next critical-path step needs an agent result.
5. Integrate.
   - Review returned patches or findings before relying on them.
   - Resolve conflicts intentionally.
   - Run the strongest practical end-to-end verification in the main thread.
6. Report.
   - Summarize the swarm roles, outcomes, files changed, verification, and remaining risks.
   - Call out any agent result that was rejected or only partially used.

## Prompt Templates

Explorer:

```text
Inspect <area> for <specific question>. Do not edit files. Return concise findings with file references, evidence, and recommended next steps.
```

Worker:

```text
You are not alone in the codebase. Own <files/modules>. Do not revert others' changes. Implement <bounded task>, adapt to nearby edits, run relevant checks, and return changed files, tests, failures, and residual risks.
```

Verifier:

```text
Verify <acceptance criteria> using <tests/tools>. Prefer read-only checks unless a fix is explicitly in scope. Return commands run, results, failures, screenshots/log references if relevant, and confidence level.
```

Strategist:

```text
Create a concise execution strategy for <goal>. Focus on sequencing, risks, unknowns, and the smallest plan that can satisfy the acceptance criteria.
```

## Anti-Patterns

- Spawning agents with overlapping write scopes.
- Asking multiple agents the same broad question.
- Waiting on background work while useful local work is available.
- Accepting agent patches without review.
- Letting strategy work expand after implementation should already be underway.
