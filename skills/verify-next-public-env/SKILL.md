---
name: verify-next-public-env
description: Verify a NEXT_PUBLIC_* env var actually made it into the live production bundle. NEXT_PUBLIC_* vars bake at build time, so changing them on Vercel has zero effect until a redeploy rebuilds the client JS. This skill pulls Vercel env, checks for formatting issues (trailing whitespace, dupes), and greps the currently-deployed bundle to confirm the new value is live. Use after changing a NEXT_PUBLIC_* var, or when users report "I changed the env var but nothing changed."
---

# Verify NEXT_PUBLIC_* Env Var Is Live

`NEXT_PUBLIC_*` env vars in Next.js are inlined into the client JS bundle at **build time**. Changing them on the Vercel dashboard or via `vercel env add/rm` has ZERO effect on running production traffic until the next build. This skill confirms end-to-end that a value change has propagated all the way to the browser.

Born from the 2026-04-21 404-brief fix: production traffic was pointing at an old Apps Script deployment because the `NEXT_PUBLIC_SHEETS_WEBHOOK` update hadn't been redeployed, AND both webhook vars had a trailing `\n` inside quoted values. Neither was visible in the dashboard UI.

## Parameters

- `<var-name>` — the `NEXT_PUBLIC_*` env var to verify (e.g. `NEXT_PUBLIC_API_URL`)
- `[host]` — the production hostname to check. Defaults to the production domain shown in `vercel inspect`

## Flow

### 1. Dump raw Vercel values and scan for common defects

```bash
rm -f /tmp/vercel-prod.env
vercel env pull /tmp/vercel-prod.env --environment=production

# Show all NEXT_PUBLIC_* vars with any trailing whitespace made visible
grep -nE '^NEXT_PUBLIC_' /tmp/vercel-prod.env | sed 's/$/<EOL>/'
```

Defects to flag:
- **Trailing `\n` inside quoted values** — `VAR="value\n"` means a literal newline in the stored value. Browsers sometimes normalize URLs, sometimes not. Strip.
- **Duplicate values across semantically-distinct vars** — e.g. both `NEXT_PUBLIC_FOO_URL` and `NEXT_PUBLIC_BAR_URL` set to the same thing is usually a copy-paste mistake.
- **Placeholder values** — `YOUR_KEY_HERE`, `TODO`, `changeme`, etc.

### 2. Find the latest prod deployment and HTML

```bash
vercel list --prod | head -3
HOST=brief.404models.com  # or the production domain
curl -s "https://$HOST/" -o /tmp/prod.html -w "HTTP: %{http_code}\n"
```

### 3. Grep every JS chunk referenced by the HTML

```bash
# List chunks referenced by the entry HTML
CHUNKS=$(grep -oE '/_next/[^"]+\.js' /tmp/prod.html | sort -u)

# Fetch each chunk and search for the baked value
for path in $CHUNKS; do
  found=$(curl -s "https://$HOST$path" | grep -oE '<your-value-pattern-here>' | head -1)
  [ -n "$found" ] && echo "FOUND in $path: $found"
done
```

For URLs, use a distinctive substring (e.g. the Google Apps Script deployment ID `AKfyc...` is unique enough). For other values, pick something unlikely to collide.

### 4. Reconcile

Compare:
- Vercel value (from step 1)
- Latest prod bundle value (from step 3)

If they differ, **the build hasn't picked up your env change**. Either:
- Trigger a redeploy: `git push` (if configured for auto-deploy) or `vercel deploy --prod`.
- If a deploy already ran, check `vercel inspect <latest-url>` for build errors.

After redeploy, rerun steps 2–3 and confirm the new value is in the bundle.

## Report format

```
Variable: NEXT_PUBLIC_FOO
Vercel value: "https://api.example.com"
Bundle value: "https://api.example.com"  ← match
Status: ✓ Live in production

---OR---

Variable: NEXT_PUBLIC_FOO
Vercel value: "https://new.example.com"
Bundle value: "https://old.example.com"  ← MISMATCH
Status: ✗ Change not yet live — redeploy required
Next action: `vercel deploy --prod`
```

## Related

- `vercel-env-flip` — for safely changing the env var in the first place (handles the `rm` + `add` + redeploy dance).
- `google-apps-script-debug` — when verifying that a `NEXT_PUBLIC_*_WEBHOOK` points at the correct Apps Script deployment.
