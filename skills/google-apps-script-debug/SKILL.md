---
name: google-apps-script-debug
description: Diagnose Google Apps Script web app webhooks that look broken from outside — covers the non-obvious 302 redirect, Deploy-vs-Manage-Deployments distinction, doPost-in-editor failure, getActiveSheet footgun, and status-field drift. Use when a Next.js/React frontend posts to a `script.google.com/macros/s/.../exec` URL and data isn't arriving, or when an Apps Script web app appears dead from curl probes.
---

# Google Apps Script Web App Debug Playbook

Born from the 2026-04-21 404-brief session. A parallel Explore agent called the webhook "dead" based on a 302 response — wrong. The 302 is Google's normal sandbox redirect. Under the hood the script was fine; the real issues were (a) `getActiveSheet()` sending rows to the wrong tab, (b) the frontend using `mode:'no-cors'` which masked every server error, and (c) duplicate Vercel env vars causing proposal-page visits to write empty rows.

Use this skill when: a Next.js/React frontend posts to a `script.google.com/macros/s/.../exec` URL and data isn't arriving, OR when an Apps Script webhook "seems dead" based on external probes.

## Gotcha 1 — POST always returns a 302 redirect to `script.googleusercontent.com/macros/echo`

This is **normal Google sandboxing**, not a failure. Without following the redirect you see a 302 and might assume the script is dead.

```bash
# WRONG: looks like it's broken
curl -sI https://script.google.com/macros/s/AKfyc.../exec
# → 302

# RIGHT: follow the redirect to see the real response body
curl -sL https://script.google.com/macros/s/AKfyc.../exec
# → 200, JSON response
```

For diagnostic GETs use `curl -sL`. For production fetch from a frontend, always set `redirect: 'follow'` (the default, but explicit is safer).

## Gotcha 2 — Running `doPost` from the editor ALWAYS fails with "Cannot read properties of undefined (reading 'postData')"

`doPost(e)` expects a real HTTP event. Clicking **Run** from the editor with no event produces `e === undefined`. This is not a real failure; ignore it. To test, either:

- **Call via curl** (but beware — this writes real data; use a clearly-marked `{"company_name":"DIAGNOSTIC-DELETE-ME",...}` payload), or
- **Add a test harness function** in Code.gs that fabricates `e`:

```javascript
function testDoPost() {
  doPost({ postData: { contents: JSON.stringify({
    company_name: "DIAGNOSTIC-DELETE-ME",
    contact_email: "<diagnostic-email>"
  })}});
}
```

## Gotcha 3 — "Deploy → New deployment" ≠ "Manage deployments → pencil → New version"

These are fundamentally different and users almost always want the second:

| Action | Result | When to use |
|---|---|---|
| `Deploy` button → **New deployment** | Creates a NEW URL; old URL still serves old code | First-ever deploy, or intentionally running two versions in parallel |
| `Deploy` button → **Manage deployments → pencil icon → Version: New version** | SAME URL, new code behind it | **This is what you want 99% of the time** |

If a user redeployed and things still look broken, verify the deployment ID (the `AKfyc...` portion) in their webhook URL. If it changed, their production env var is now pointing at the OLD, orphaned deployment. Fix: either update the env var to the new deployment ID, or delete the new deployment and redo the update via the pencil icon. If this already happened repeatedly and you have a stack of orphaned deployments, the `apps-script-clasp-push` skill's troubleshooting section covers updating the correct one via `--deploymentId` without creating new ones.

## Gotcha 4 — `getActiveSheet()` is a footgun

`SpreadsheetApp.getActiveSpreadsheet().getActiveSheet()` returns whichever tab was **last clicked** in the sheet UI by a human. When doPost runs from a web request, there's no "active" tab — Apps Script returns whatever was saved last. If anyone clicked a different tab and saved, new webhook rows land there silently.

**Always** use `getSheetByName("Sheet1")` (or whatever the tab is called). Make the tab name a Script Property so it's configurable without code edits.

## Gotcha 5 — Status field naming drift between doGet and doPost

If `doGet` returns `{status: "ok"}` but `doPost` returns `{status: "success"}`, frontend code checking `data.status !== "ok"` will treat every success as an error. Pick ONE and use it in both handlers. `"ok"` is the conventional choice.

## Gotcha 6 — Clasp's default `drive.file` scope can't see most scripts

When automating Apps Script workflows via clasp, expect `clasp list-scripts` to return `[]` and Drive-API-based discovery (via clasp's OAuth token) to return empty too. This isn't a bug — clasp's default scopes (`drive.file` + `drive.metadata.readonly`) only surface files clasp itself created. Scripts created through the web UI, container-bound scripts, and anything older than clasp's setup are all invisible.

Symptoms:
- `clasp list-scripts` prints "No script files found" even though you can see the script at script.google.com.
- Node-side Drive API calls using clasp's access token return `{files: []}` for `mimeType='application/vnd.google-apps.script'` queries.
- `clasp clone <spreadsheetId>` fails with "Invalid script ID" (spreadsheet ID ≠ script ID, and there's no auto-mapping).

Workarounds (ordered by ease):
1. **Ask the user for the Apps Script editor URL.** It contains the 57-char script ID in the `/projects/<ID>/edit` path segment. Less jargon-y than asking for a "script ID" directly.
2. **Re-login clasp with broader scope**: `clasp login --extra-scopes https://www.googleapis.com/auth/drive.readonly`. Requires the user to re-authorize in browser. In practice this flag may not apply to all clasp 3.x flows — test before relying.
3. **Don't try to bypass** by reading the OAuth token from `~/.clasprc.json` and calling Drive directly. The permission system will block it, and even if it didn't, the token's scope can't see those files anyway.

## Gotcha 7 — Apps Script API must be toggled ON once per Google account

Clasp's `push`, `clone`, and deployment APIs all require the user to have enabled the **Google Apps Script API** at a per-account setting. This is independent of any individual project and completely separate from OAuth consent.

Error you'll see on the first push:
```
User has not enabled the Apps Script API. Enable it by visiting
https://script.google.com/home/usersettings then retry.
```

Fix (single click):
1. Open `https://script.google.com/home/usersettings`.
2. Toggle **"Google Apps Script API"** to ON.

That's it. No forms, no OAuth, no confirmation dialog. Toggle is sticky — once on, it stays on across sessions, machines, and even if the user re-authenticates clasp. But if the user has never run clasp before, they've likely never seen this setting and won't think to enable it.

When instructing a user to do this: use `open "https://script.google.com/home/usersettings"` from bash to pre-open the tab for them, and say *"Exactly one toggle, reply when done."* Don't describe it as "enabling the API" — they'll assume it involves a GCP console visit, billing setup, or OAuth consent screen. None of that is involved.

## Standard diagnostic flow

When a user reports "briefs/forms/data aren't arriving":

1. **Read the Apps Script source.** If it's not in the repo, ask the user to paste it. Most "integration broken" reports turn out to be "that feature was never built." Before anything else, confirm what the script actually does.

2. **Probe the webhook with `curl -sL`.** A 200 response confirms the URL is reachable and the deployment is live. A 403 or ominous HTML response means the deployment was revoked or the "Who has access" setting changed.

3. **Open Executions log** (left sidebar, clock icon in Apps Script editor). Recent `doPost` runs tell you if requests are even reaching the script. Failed runs show the stack trace.

4. **Check `getActiveSheet` usage.** If the script uses it, grep the codebase for tab names and confirm rows land where expected.

5. **Check frontend `no-cors` usage.** `mode:'no-cors'` silently discards the response body. Replace with `Content-Type: 'text/plain;charset=utf-8'` (CORS-safe, no preflight) so the frontend can surface real errors.

6. **Compare deployment ID in frontend env vs. active Apps Script deployment.** Run `vercel env pull` (or equivalent) and compare the `AKfyc...` portion against `script.google.com/home/projects/<project>/deployments`. Mismatches after a redeploy are the #1 silent failure.

7. **For Next.js + `NEXT_PUBLIC_*` envs, verify the live client bundle.** See the `verify-next-public-env` skill — env changes don't take effect until a redeploy rebuilds the bundle.

## Template for a production-grade Apps Script webhook

```javascript
function doPost(e) {
  var d;
  try { d = JSON.parse(e.postData.contents); }
  catch (err) { return json({status:"ignored", reason:"invalid-json"}); }

  // Reject known junk shapes (bots, unrelated webhooks hitting this URL)
  if (!d || (!d.company_name && !d.contact_email /* add your required fields */)) {
    Logger.log("Ignoring empty/invalid: " + JSON.stringify(d).substring(0, 300));
    return json({status:"ignored", reason:"empty"});
  }

  try {
    var tab = PropertiesService.getScriptProperties().getProperty("SHEET_TAB_NAME") || "Sheet1";
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(tab);
    if (!sheet) throw new Error("Sheet tab '" + tab + "' not found");
    sheet.appendRow(buildRow_(d));
    return json({status:"ok"});
  } catch (err) {
    Logger.log("Sheet write failed: " + err);
    return json({status:"error", message: String(err)});
  }
}

function doGet() {
  return json({status:"ok", message:"webhook is live"});
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
```

## Deploy recipe

**Preferred path: use the `apps-script-clasp-push` skill.** It wraps clone + push + deployment-bump into a single invocation, avoids all the UI-click traps (especially "Deploy → New deployment" orphaning the URL), and works for any script with a known deployment ID.

```
trigger: apps-script-clasp-push
args: --source <path> --script-id <id> --deployment-id <AKfyc...>
```

### Fallback: manual UI flow (only if clasp isn't set up)

Use this only when clasp-push isn't available (clasp not installed, user hasn't enabled Apps Script API yet, user prefers manual for a one-off).

1. Paste into `Code.gs` (replace existing contents).
2. Gear icon → **Script Properties** → add any secrets (`SHEET_TAB_NAME`, webhook tokens, etc).
3. Function dropdown → select test function → ▶ Run. Authorize on first run.
4. **Deploy → Manage deployments → pencil icon on the active deployment → Version: "New version" → Deploy.** ← NOT "New deployment".
5. Verify with `curl -sL <url>` → should return the `doGet` JSON.

Once clasp is ever set up for the project, migrate to the skill — the UI flow is strictly more error-prone.
