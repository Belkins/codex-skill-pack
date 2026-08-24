---
name: supabase-state-check
description: Report drift between your local Supabase migration files and the actual production DB state via Management API. Surfaces tables that exist but aren't in the tracker, migrations in the repo that aren't applied, and RLS gaps on user-data tables. Use before running `supabase db push` on a project where migrations are sometimes applied via dashboard.
---

# Supabase State Check

Given `$ARGUMENTS` (a Supabase project ref, or read from `supabase/.temp/project-ref` if omitted), query the Management API and report drift between the repo's migration history and prod.

## Why this skill exists

Some projects apply migrations via the dashboard SQL editor, not `supabase db push`. That pattern leaves `supabase_migrations.schema_migrations` out of sync with the actual DB — running `db push` blindly after will try to re-run all the "untracked" migrations, most idempotent but some not.

This skill reports the delta before you touch anything.

## Preconditions

- macOS keychain has a `Supabase CLI` / `supabase` entry (base64-encoded access token).
- Repo has a `supabase/migrations/` directory with `<version>_<name>.sql` files.
- `curl` + `python3` available.

## Instructions

### 1. Resolve project ref

```bash
PROJECT_REF="${ARGUMENTS:-$(cat supabase/.temp/project-ref 2>/dev/null)}"
```

If empty, prompt the user for the ref (or error out if auto mode + no default).

### 2. Decode access token

```bash
RAW=$(security find-generic-password -s "Supabase CLI" -a "supabase" -w 2>/dev/null)
TOKEN=$(echo "${RAW#go-keyring-base64:}" | base64 -d)
```

If `$TOKEN` doesn't start with `sbp_`, error out with a link to regenerate via `supabase login`.

### 3. Gather 4 data points in parallel (single Bash block)

Run these curls in parallel — they share the token but are independent queries:

**A. Tracked migrations** (source of truth claimed by Supabase):
```sql
SELECT version FROM supabase_migrations.schema_migrations ORDER BY version DESC;
```

**B. Repo migrations** (source of truth claimed by git):
```bash
ls supabase/migrations/ | grep -oE '^[0-9]+' | sort -u
```

**C. Public-schema tables + RLS status**:
```sql
SELECT tablename, rowsecurity FROM pg_tables
WHERE schemaname='public' ORDER BY tablename;
```

**D. Policies per table**:
```sql
SELECT tablename, policyname FROM pg_policies
WHERE schemaname='public' ORDER BY tablename, policyname;
```

Use the Management API `POST /v1/projects/{ref}/database/query` with `{"query": "..."}` JSON body.

### 4. Compute drift

- **Unapplied migrations**: in repo (B) but not in tracker (A). Group by date range so small backlogs (1-2) vs large (30+) are obvious.
- **Untracked-but-applied**: signal is when the tracker's latest version is older than the most recent repo migration BUT tables that would be created by the newer migration clearly exist.
- **RLS gaps**: tables in (C) with `rowsecurity=false`. Flag any whose name suggests user data (contains `user_`, `account`, `hubspot`, `integration`, `contact`, email-ish).
- **Tables without policies**: in (C) with `rowsecurity=true` but no entry in (D). Usually a bug — RLS enabled but no policies means deny-all to `authenticated`/`anon`, which may or may not be intentional.

### 5. Report

```
[supabase-state-check] project=juwllckqcgxtmnbxjgzj

Tracker latest:   20251127 (Nov 27, 2025)
Repo latest:      20260420 (Apr 20, 2026)
Delta:            5 months / 12 migration files unaccounted for in tracker

Tables in public schema: 47 (38 with RLS, 9 without)

⚠ RLS missing on user-data tables:
  - user_analytics_raw
  - email_exports

⚠ RLS enabled, no policies (deny-all to authenticated):
  - deprecated_agent_logs
  - (non-user-data, probably intentional)

✓ Contact/outbound tables from Q1 flagship: all have service_role policies

Recommended next steps:
  a. Reconcile tracker: supabase migration repair 20260417 --status applied (per version)
  b. Apply RLS to the 2 user-data tables above (write a new migration)
  c. Only THEN attempt `supabase db push`
```

## Safety

- Read-only — never writes to the DB.
- Never print the access token to the user.
- If any query returns an error (403, timeout), stop and report — don't fall back silently to `db push`.

## Related

- `reference_supabase_ops_shortcuts.md` in project memory has the full auth + Management API curl recipe.
- After reconciling, use `/vercel-env-flip` if your migration affects feature flags.
