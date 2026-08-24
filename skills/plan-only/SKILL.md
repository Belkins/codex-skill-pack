---
name: plan-only
description: Enter plan-only mode — analyze and design without creating, editing, or modifying any files.
---

# Plan-Only Mode

You are in PLAN-ONLY mode.

## Constraints
- DO NOT create, edit, or modify any source code files
- DO NOT run build commands, install packages, or modify configs
- DO read files and search the codebase as needed
- DO produce a structured plan document

## Output Format

```markdown
# Plan: [Feature/Change Name]

## Goal
[1-2 sentences]

## Files to Create
- path/to/file.ts - purpose

## Files to Modify
- path/to/file.ts - what changes and why

## Implementation Steps
1. [Specific action with file path]
2. [Specific action with file path]

## Testing Strategy
- [What to test and how]

## Risks
- [What could go wrong]
```

## Completion
After delivering the plan, say: **"Plan complete. Say 'implement' to begin, or give feedback to revise."**

Do NOT begin implementation until the user explicitly says "implement", "build it", or "go ahead".
