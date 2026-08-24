---
name: apps-script-clasp-push
description: Push a local .gs source file to a Google Apps Script project and bump an existing deployment to the new version — no Apps Script editor UI needed. Handles one-time clasp install, OAuth login, Apps Script API enablement, cloning, push, and deployment-by-ID update. Use when you need a local Apps Script code change live on a deployed webhook URL, or when someone says "push to apps script", "redeploy the apps script", "update the google apps script", "run clasp push".
---

# Apps Script Clasp Push

Ship a local `.gs` source file to a deployed Apps Script webhook without ever touching the Apps Script editor UI.

Born from the 2026-04-21 404-brief session. The two time sinks were (a) copy-pasting code into `Code.gs` through the editor five times in a row, and (b) clicking "Deploy → New deployment" instead of the pencil icon four times — each click created a new orphan URL and left production pointing at stale code. Clasp eliminates both entirely once set up.

## When to use this skill

- After editing a local `.gs` file that's the canonical source for a deployed webhook.
- When someone asks to "push to Apps Script", "redeploy", "update the webhook", "run clasp push".
- Proactively after you've made code changes to a file that has a sibling `.clasp.json` or is named `google-apps-script.gs` / `Code.gs` / `Code.js`.

**Don't use for:** first-ever deploy of a brand-new script (use `clasp create-script` instead; out of scope here). Initial project setup that doesn't have a deployment ID yet.

## One-time preflight (per machine + per Google account)

Run these three checks before the first push ever. Each only needs to succeed once.

### 1. Clasp installed

```bash
clasp --version
# Expect: 3.x.x (3.3.0+ recommended)
```

If missing:
```bash
npm install -g @google/clasp
```

Clasp 3.x's CLI differs from 2.x. Relevant renames: `clasp deployments` → `list-deployments`, `clasp deploy` → `create-deployment`.

### 2. Clasp authenticated

```bash
ls ~/.clasprc.json  # Should exist and be non-empty
```

If missing or login is stale:
```bash
clasp login
# Opens browser; user authorizes Google account; control returns here on success.
# If the user is already signed into Google in their browser, this often completes in <5s.
```

Do NOT attempt to extract or reuse the `~/.clasprc.json` OAuth token for direct Drive/Apps Script API calls — the permission system blocks that for good reason, and scope is too narrow anyway (see Gotcha in `google-apps-script-debug`).

### 3. Apps Script API enabled

This is **one-time per Google account**, not per project. Without it, every `clasp push` fails with:

```
User has not enabled the Apps Script API. Enable it by visiting
https://script.google.com/home/usersettings then retry.
```

Recovery:
```bash
open "https://script.google.com/home/usersettings"
# User toggles "Google Apps Script API" to ON. That's the only action.
```

Tell the user in plain language: *"Exactly one toggle, no forms, no OAuth. Reply when it's on."* Then retry the push.

## Standard update flow

Four commands after preflight, assuming you know the script ID and the deployment ID you want to bump:

```bash
# 1. Work in a dedicated temp dir per project (reuse across runs)
WORKDIR="/tmp/${PROJECT_NAME}-script"   # e.g. /tmp/404-script
mkdir -p "$WORKDIR" && cd "$WORKDIR"

# 2. If this dir isn't already linked to the script, clone it
if [ ! -f .clasp.json ]; then
  clasp clone <SCRIPT_ID>
fi

# 3. Copy your canonical source over the cloned Code.js
cp <LOCAL_SOURCE_PATH> "$WORKDIR/Code.js"

# 4. Push + bump the existing deployment in the same breath
clasp push --force && \
  clasp create-deployment \
    --deploymentId <DEPLOYMENT_ID> \
    --description "<short change note>"
```

Concrete example from the 404-brief project:
```bash
WORKDIR=/tmp/404-script
cp ~/Desktop/404-brief/google-apps-script.gs "$WORKDIR/Code.js"
cd "$WORKDIR" && clasp push --force && \
  clasp create-deployment \
    --deploymentId <DEPLOYMENT_ID> \
    --description "Fix X"
```

## Verification

After push + deploy, confirm the webhook is serving the new code:

```bash
curl -sL "<WEBHOOK_URL>" | head -c 200
# Expect: {"status":"ok","message":"..."} or whatever the doGet handler returns.
```

Use `-L` (follow redirects) — Apps Script web apps 302-redirect every response through `script.googleusercontent.com/macros/echo`. Without `-L`, you'll see the redirect and mistakenly think it failed.

For a targeted verification of what's actually in the new code, if the script has a distinctive string (a function name, log message, or constant), grep for it in the cloned `Code.js` before pushing — it's the same file that's about to go live.

## Script ID / deployment ID discovery

Ordered by reliability:

### 1. Existing `.clasp.json`

If the working dir has already been cloned, `cat .clasp.json` shows the `scriptId`. Re-use it. This is zero-friction after the first clone.

### 2. User's browser URL

Every Apps Script editor tab has a URL of the form:
```
https://script.google.com/home/projects/<SCRIPT_ID>/edit
                                         └── 57-char alphanumeric
```

Or:
```
https://script.google.com/u/0/home/projects/<SCRIPT_ID>/edit
```

**Ask the user for the URL**, not the "script ID" — less jargon. They copy the whole URL; you extract the ID with `sed` or just visual inspection.

### 3. `clasp list-scripts`

```bash
clasp list-scripts
```

**Returns empty for most user-owned scripts.** Clasp's default OAuth has `drive.file` scope, which only surfaces files clasp itself created. Scripts created via the web UI are invisible. Don't rely on this for discovery.

### 4. Deployment ID lookup

Once you have the script ID + `.clasp.json`:

```bash
clasp list-deployments
# Shows all deployments with their IDs (AKfyc...) and version numbers (@1, @2, ...)
```

Pick the deployment whose URL matches whatever the frontend/Vercel points at. If you don't know which one is production, check the consumer's env (`vercel env pull` or similar) and compare the `AKfyc...` portion.

## Troubleshooting

| Error string or symptom | Fix |
|---|---|
| `clasp: command not found` | `npm install -g @google/clasp` |
| `You are not logged in.` | `clasp login` (browser flow) |
| `User has not enabled the Apps Script API` | Toggle on at `https://script.google.com/home/usersettings` |
| `Invalid script ID` | You probably pasted a spreadsheet ID or deployment ID. Use the 57-char ID from the `/projects/<ID>/edit` URL |
| `Push failed: You do not have permission` | Clasp login expired or script owner is different. `clasp logout && clasp login`; confirm you're authenticated as the script owner |
| `clasp list-scripts` returns `[]` or "No script files found" | Scope limitation — see "Script ID discovery" above, ask user for URL |
| Push succeeds but webhook still serves old code | You forgot `create-deployment --deploymentId`. `clasp push` only updates HEAD; each existing deployment stays pinned to a specific version until you re-deploy it |
| `clasp create-deployment` succeeds but `curl` returns old content | Apps Script sometimes has ~30s propagation delay. Wait and retry. If it persists, verify the deploymentId in the command matches the URL you're curling |
| `clasp create-deployment` produces a new `@N` version but the webhook is still at an old deployment's URL | You deployed to the wrong `--deploymentId`. Check `clasp list-deployments`, find the one whose URL is in production, redeploy with that ID |

## First-ever deploy (initial bootstrap) — UI is unavoidable

For an **existing** deployment ID, everything above is end-to-end automatable. For a **brand-new** script that has never had a web app deployment, clasp **cannot** always fully publish on its own. Verify this behavior against the current clasp and Apps Script versions:

- `clasp deploy --description "..."` succeeds, returns a deployment ID + `@N` version, and that ID is real (visible in `clasp list-deployments`).
- The corresponding `https://script.google.com/macros/s/AKfyc.../exec` URL **permanently 403s** with "You need access," even after the user has authorized the script and even after `clasp deploy --deploymentId X` to the same ID.
- The reason: `clasp deploy` doesn't set the deployment's internal `deploymentConfig.webApp` type flag. Only the editor's **Deploy → New deployment → ⚙️ → Web app → Deploy** flow flips that bit.

**How to handle this in practice:**

1. Do everything via clasp: `clasp create`, `clasp push` (with `webapp` block + `oauthScopes` in `appsscript.json`).
2. **Brief the user with this exact 5-click sequence** (do NOT try to automate it):
   - Open the editor URL
   - Click **Deploy** (top right) → **New deployment**
   - Click the **⚙️ gear** at top-left of the dialog → choose **Web app**
   - Execute as: **Me**, Who has access: **Anyone**
   - Click **Deploy**, copy the new `/macros/s/AKfyc.../exec` URL, paste it back to you
3. The UI-generated deployment ID is **different** from clasp's. The clasp one becomes dead weight (visible in `clasp list-deployments` but never serves traffic). The UI URL is the live one — use it for all downstream config (Vercel env vars, etc.).
4. After this one-time bootstrap, all future updates can use `clasp push` + `clasp deploy --deploymentId <UI-URL-id>` — the pencil-icon equivalent now works because the deployment is properly typed.

**Also tell the user about the function-picker gotcha** when asking them to "click Run" on a setup function: the editor's function dropdown defaults to whatever the cursor last touched, often a 1-line helper like `_ss`. Tell them explicitly to **choose `setupEverything` from the dropdown first**. A 1-second "Execution completed" with no log output means they ran the wrong function — easy to misread as success.

## Never do this

- **Don't click "Deploy → New deployment" in the Apps Script UI** (except on first-ever deploy — see above). It creates a new URL and leaves all existing URL consumers pointing at old code. Always use the pencil-icon flow OR this skill (which uses the API equivalent).
- **Don't paste code manually into `Code.gs`.** Even if "just this once" — you'll forget to redeploy, or you'll introduce paste errors (trailing newlines in keys etc.), or you'll lose track of what's in git vs what's live. Always flow: edit local → `clasp push` → `clasp create-deployment`.
- **Don't `clasp push` without the matching `clasp create-deployment`** unless you're certain you only want to update HEAD (rare — HEAD isn't served by URL-pinned deployments).
- **Don't extract the OAuth token from `~/.clasprc.json`** to make Drive/Apps Script API calls for other purposes. The permission system will block it, and clasp's default scopes are too narrow to be useful for general Drive queries anyway.

## See also

- `google-apps-script-debug` — when the push succeeds but the webhook still misbehaves. Covers 302-redirect confusion, `getActiveSheet()` footguns, doPost-from-editor failures, and status-field drift.
- `verify-next-public-env` — if the webhook URL is consumed by a Next.js frontend via a `NEXT_PUBLIC_*` env var. Env changes don't reach the client bundle until a Vercel redeploy; the skill confirms the new value actually propagated.
