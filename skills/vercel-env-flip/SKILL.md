---
name: vercel-env-flip
description: Flip an existing Vercel production env var to a new value and redeploy so the change takes effect. Wraps the CLI 50.x dance of rm + add + redeploy that trips up non-interactive flows. Use when changing a feature flag, rotating a secret, or correcting a misconfigured env var in prod.
---

# Vercel Env Flip

Change `$ARGUMENTS` — a single Vercel env var — and trigger a redeploy so the new value takes effect.

## Why this skill exists

Vercel CLI 50.x has non-obvious behavior that breaks naive flip scripts:

1. `vercel env add NAME production` fails with `branch_not_found` if NAME already exists — it doesn't overwrite.
2. `yes | vercel env rm NAME production` does not work — the confirmation prompt isn't fed by stdin. Use `-y` flag.
3. Env var changes on Vercel do NOT apply to existing deployments; a redeploy is required.
4. CLI 50.x's `vercel redeploy` takes a deployment URL or id, not just `--prod`.

This skill runs the correct 4-step sequence.

## Preconditions

- Current directory (or a subdir given as `--dir`) is linked to a Vercel project (`.vercel/project.json` exists).
- `vercel` CLI is on `$PATH` and logged in.
- Argument format: `NAME=value` (single var). Quote the value if it contains spaces: `NAME="multi word"`. For empty/false: `NAME=false`.

## Instructions

### 1. Parse arguments

Parse `$ARGUMENTS` into:
- `NAME` — the env var name (left of first `=`)
- `VALUE` — the new value (everything after the first `=`)
- `SCOPE` — defaults to `production` unless `--scope X` is given. Valid: `production`, `preview`, `development`. (Note: CLI 50.x has bugs with preview/development — warn the user if selected.)
- `REDEPLOY` — defaults to true; skip if `--no-redeploy` given.

If `NAME` or `VALUE` is missing, print usage and stop.

### 2. Verify project link

Find the `.vercel/project.json` closest to cwd (try cwd, then `app/`, `web/`, `apps/*/`). Report which project will be affected (`projectName` from the JSON) and which scope.

### 3. Remove existing var (safe if absent)

```bash
vercel env rm "$NAME" "$SCOPE" -y 2>&1 | tail -3
```

If the output contains "does not exist", proceed anyway (the add step below still works).

### 4. Add with new value

```bash
printf '%s' "$VALUE" | vercel env add "$NAME" "$SCOPE" 2>&1 | tail -3
```

Confirm with `vercel env ls "$SCOPE" | grep "^ $NAME "` — the `Updated` column should show seconds-ago.

### 5. Redeploy (unless --no-redeploy)

Get the latest prod deployment URL:

```bash
LATEST=$(vercel ls --prod 2>&1 | awk '/●/ {print $4; exit}')
```

If no URL found, fall back to an empty commit push: `git commit --allow-empty -m "chore: redeploy after $NAME env change" && git push origin main`.

Otherwise:

```bash
vercel redeploy "$LATEST" --target=production
```

Report the inspect URL from the output so the user can watch the build.

### 6. Poll until ready (up to 6 min)

Every 30s, run `vercel ls --prod | sed -n '4p'` and check the Status column. Stop on `● Ready` (success) or `● Error` / `● Canceled` (failure). Use the environment's background or PTY execution mechanism and poll its output; do not block the main agent with a long foreground sleep.

### 7. Smoke-test reminder

Print the smoke-test command the user should run next, e.g.:

```
Redeploy ready. Verify:
  curl -sS -o /dev/null -w "%{http_code}\n" https://<prod-host>/api/health
  or
  /verify-file-durability — for file-persistence paranoia
```

## Output format

```
[vercel-env-flip] NAME=<value-redacted-if-secret>
  project: example-app
  scope:   production
  step 1/4 rm   ... ok (removed)
  step 2/4 add  ... ok (updated 3s ago)
  step 3/4 deploy latest URL: https://example-app-xxx.vercel.app
  step 4/4 redeploy → https://vercel.com/.../inspect/...
  status:  ● Ready (3m42s)

Next: run your smoke test.
```

## Safety

- **Never print secret values** back to the user in plain text. If `NAME` matches `*_KEY|*_SECRET|*_TOKEN|*PASSWORD*` (case-insensitive), redact the value in all log output.
- **Refuse** to run on scope `production` if the user hasn't confirmed in this session — ask once unless auto mode is active.
- **Refuse** on `SUPABASE_SERVICE_ROLE_KEY`, `CLERK_SECRET_KEY`, `STRIPE_SECRET_KEY`, or any other high-impact secret unless the user explicitly passes `--i-know` — those rotations have blast-radius beyond a flag flip.
- If the redeploy fails, do NOT retry blindly — surface the error and ask.

## Rollback hint

To undo, re-run with the prior value:

```
/vercel-env-flip NAME=<prior-value>
```

The `rm -y` + `printf | add` + redeploy is idempotent; total kill-switch time ~90s.
