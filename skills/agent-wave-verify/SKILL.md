---
name: agent-wave-verify
description: |
  Between-wave audit for parallel agent orchestration. After 3-4 agents finish
  a wave, run file-count/LOC/commit-hash verification to confirm each agent
  delivered. Catches silent failures (agent returned OK but left no commit),
  race conditions (two agents wrote to same file), and scope drift (agent
  added files outside its assigned directory). Use after any wave of 2+
  parallel agents.
allowed-tools:
  - Bash
  - Read
---

# /agent-wave-verify — Between-Wave Agent Output Audit

After spawning a parallel wave of 3-4 agents, confirm each one actually
delivered what it claimed. Silent failures (agent returned OK but left no
commit) and race conditions (two agents touching the same file) are the
two most common failure modes in swarm orchestration. This skill catches
them before the next wave builds on a broken foundation.

## What this skill does

Runs a quick per-directory audit over the scopes assigned to each agent
in the last wave. Confirms:

1. Latest commit exists and its message matches the agent's intent.
2. Expected output files were created in expected directories.
3. No files were written outside the agent's assigned scope.
4. No uncommitted changes linger (`git status --short` is clean).
5. Tests still pass for each affected module.
6. Every review and rehearsal names the exact frozen commit or file SHA it
   inspected; later byte changes invalidate that verdict.

## Freeze protocol (required)

Before agents start, record one immutable wave manifest:

- baseline commit SHA;
- one isolated branch/worktree per agent;
- explicit owned paths and expected outputs;
- forbidden shared or production mutations;
- required focused and full gates.

An agent may call its slice **stable** only after committing every owned
change, reporting the exact commit SHA, leaving its worktree clean, and
passing the assigned gates. Reviewers must cite that exact commit or the
SHA-256 of a safety-critical artifact. If any reviewed byte changes, the
old verdict is superseded automatically: rerun the relevant rehearsal,
tests, and independent review against the new digest.

Integrate only explicit verified commits. After integration, freeze the
combined tree again and run final gates in a quiet worktree. Do not treat
per-agent green results as proof that the combined tree is green.

## Verification template

Paste into a bash block, substituting the affected directories and
expected files from the wave plan.

```bash
# Per-directory audit for a wave of parallel agents
WAVE_DIRS=("ideas/pto-tracker" "ideas/ham-radio" "ideas/fec-alerts")
EXPECTED_FILE="scraper/main.go"
BASELINE_SHA="$(git rev-parse HEAD)" # Replace with the recorded pre-wave SHA.

echo "wave baseline: $BASELINE_SHA"

for d in "${WAVE_DIRS[@]}"; do
  echo "=== $d ==="
  if [ -d "$d" ]; then
    # Latest commit in the scope
    (cd "$d" && git log -1 --format='  last commit: %h %s' 2>/dev/null) \
      || echo "  last commit: NONE"

    # Record the immutable review target.
    (cd "$d" && git rev-parse HEAD | sed 's/^/  frozen commit: /') \
      || echo "  frozen commit: NONE"

    # Expected file landed
    if [ -f "$d/$EXPECTED_FILE" ]; then
      echo "  $EXPECTED_FILE: present ($(wc -l < "$d/$EXPECTED_FILE") LOC)"
    else
      echo "  $EXPECTED_FILE: MISSING"
    fi

    # Uncommitted changes?
    dirty=$(cd "$d" && git status --short 2>/dev/null)
    if [ -n "$dirty" ]; then
      echo "  DIRTY:"
      echo "$dirty" | sed 's/^/    /'
    fi
  else
    echo "  directory MISSING"
  fi
done

# Optional: test run per changed module
# (cd ideas/pto-tracker && go test ./...)
```

Adjust the array and expected file per project. For Go monorepos add
`go test ./...`; for Node add `pnpm test`; for Python add `pytest -q`.
For a safety-critical file, also record `sha256sum <file>` (or
`shasum -a 256 <file>` on macOS) and require reviewers to repeat it.

## What to look for

Positive signals (green):

- Latest commit message references the agent's assigned task (not a
  bundled unrelated commit).
- Expected files created in expected directories with non-trivial LOC.
- `git status --short` is empty.
- Tests pass.

Red flags (investigate before next wave):

- **Bundled commit** — one commit touching 5 unrelated scopes means an
  agent fanned out beyond its brief. Risk: future agents overwrite
  drive-by edits.
- **Missing expected file** — agent returned OK but the file isn't
  there. Usually means a filesystem/path issue or the agent wrote to
  the wrong absolute path.
- **Tests failing** — agent shipped but broke something. Often the
  agent didn't re-run tests before returning.
- **Wrong directory** — file created at `/tmp/...` or at the repo root
  instead of the assigned subfolder. Common when agents resolve relative
  paths against their own cwd vs. the main thread's cwd.
- **Empty or trivial file** — scaffolding landed but the actual logic
  didn't. Agent likely hit a tool budget limit or lost context.
- **Race condition** — two agents both committed to the same file, one
  overwrote the other. Detectable via `git log --all -- <file>` showing
  near-simultaneous commits from different agents.
- **Stale verdict** — a reviewer approved commit/file digest A, but the
  current candidate is digest B. Verdict A is invalid even if the diff is
  described as small or documentation-only.

## Action if red flag

- **Single failed scope:** re-spawn one agent on just that scope with
  a tighter prompt that references the verification output ("the
  previous attempt left no commit in X — please redo").
- **Multiple failures with the same root cause:** pause the wave
  pattern, diagnose (path resolution? context window? tool permission?)
  and fix before spawning again.
- **Scope drift / bundled commits:** split the bundled commit manually
  or revert and re-assign with explicit boundaries ("do NOT touch files
  outside `ideas/<name>/`").
- **Ambiguous failure:** human investigation. Don't keep stacking waves
  on a broken foundation — the debugging cost compounds.

## When to run

- After every wave of 2+ parallel agents.
- Before launching the next wave that depends on the previous one.
- At the end of a swarm session, as a final consistency check before
  the handoff commit.

## Workflow

1. Collect the list of scopes assigned in the just-finished wave.
2. Know what each agent was supposed to produce (file names, test
   expectations).
3. Run the verification template.
4. Classify each result: green / yellow / red.
5. Act on reds before the next wave.
6. Integrate explicit green commits and record the new combined SHA.
7. Run the combined-tree gates and independent review against that SHA.
8. Log results so the next iteration of the skill has better expectations.
