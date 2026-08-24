---
name: git-ship
description: Commit all changes with a smart message, push to remote, and optionally create a PR — all in one command.
---

# Git Ship

Stage, commit, push, and optionally create a PR.

## Instructions

### Step 1 — Analyze Changes

Run in parallel:
- `git status` (see all changes)
- `git diff --stat` (summary of changes)
- `git diff` (full diff for context)
- `git log --oneline -5` (recent commit style)

### Step 2 — Generate Commit Message

Based on the diff analysis:
1. Categorize: feat/fix/refactor/chore/docs/test
2. Write concise subject line (under 72 chars) following repo's commit style
3. Add body if changes are non-trivial

### Step 3 — Confirm with User

Show the user:
- Files to be committed (list)
- Generated commit message
- Ask: "Ship it? (commit + push) or Ship + PR?"

**IMPORTANT: Wait for user confirmation before proceeding.**

### Step 4 — Execute

If approved:
1. `git add [specific files]` (never use `git add -A` — exclude .env, credentials)
2. `git commit` with the message (use HEREDOC format, include Co-Authored-By)
3. `git push -u origin [branch]`
4. If PR requested: `gh pr create` with summary and test plan

### Safety Rules
- NEVER commit .env files, credentials, or secrets
- NEVER force push
- NEVER skip hooks (--no-verify)
- ALWAYS show diff before committing
- ALWAYS wait for user confirmation
