---
name: verify-file-durability
description: Detect silent file reversion on bind mounts, overlay filesystems, synced folders, worktrees, and network mounts by capturing a snapshot, waiting, then re-checking it.
---

# Verify File Durability

Confirm that a write to `<path>` is durable by capturing a structural snapshot, waiting, then re-checking against the snapshot.

Writes to mirrored or sync-managed paths can look correct immediately and
still be overwritten minutes later. This skill detects that delayed divergence.

## When to use
- After editing a file on a bindfs, overlayfs, union, or other mirrored mount.
- After editing inside an orphaned worktree or sync-managed folder (Dropbox, iCloud, OneDrive, network mounts).
- When another agent/session claims a file "is canonical" but you haven't empirically verified it.
- Any time you suspect an upstream process could overwrite your work within minutes.

## Parameters
- `<path>` — absolute path to the file to verify. Required.
- `[wait-seconds]` — how long to wait before re-checking. Default `600` (10 min). Range: 60–590 for single-shot background bash; use chained invocations for longer waits.

## Flow

### 1. Resolve the path
```bash
readlink <path>
```
If it's a symlink, record both the provided path and the resolved canonical target. Prefer operating on the canonical path for subsequent stat calls — symlink redirection can mask inode changes.

### 2. Capture the pre-check snapshot
```bash
stat -f 'size=%z mtime=%Sm inode=%i' <path>
wc -lc <path>
shasum <path>
```
Record: `size`, `mtime`, `inode`, `line count`, `byte count`, `sha1`. Also record an optional structural marker count via `grep -c '<pattern>' <path>` if the file has known headings/sections.

### 3. Fire the delayed re-check in the background
```bash
sleep <wait-seconds - 10> && \
  stat -f 'size=%z mtime=%Sm inode=%i' <path> && \
  wc -lc <path> && \
  shasum <path>
```
Start the delayed check through the environment's background, session, or wait
mechanism and monitor it without blocking the main agent. Respect that
environment's maximum call duration; split longer waits into bounded checks.

Do NOT sleep synchronously in the foreground — it burns the 5-min prompt cache TTL and wastes context. Background bash + completion notification is the right pattern.

### 4. On completion notification, diff against snapshot
| Field | Pre | Post | Verdict |
|-------|-----|------|---------|
| size | `<pre>` | `<post>` | identical? |
| mtime | `<pre>` | `<post>` | identical? |
| inode | `<pre>` | `<post>` | identical? |
| line/byte count | `<pre>` | `<post>` | identical? |
| sha1 | `<pre>` | `<post>` | identical? |

- **PASS:** every field identical → no upstream process is rewriting the file. Edit is durable on this host.
- **FAIL — content reverted:** size/sha1 changed, mtime newer, inode may or may not change → an upstream process is re-syncing. Report concrete deltas and the top 3 changed lines (via `diff`).
- **FAIL — atomic replace:** inode changed but mtime also newer and content matches → something is rewriting the file with identical content on a schedule (unusual; worth flagging).
- **FAIL — file gone:** stat errors → upstream deleted or moved the file. Record the last known state.

### 5. Report

Structured report:
```
verify-file-durability: <path>
  wait: <N>s
  verdict: PASS | FAIL
  [if FAIL] deltas: size Δ=<N>, mtime Δ=<seconds>, inode Δ=<bool>, sha1 Δ=<bool>
  [if FAIL] first-changed-line: <line>
  recommendation: <next step>
```

For FAIL:
- If on a bindfs mount: stop writing there and locate the durable upstream source.
- If on a synced folder: pause the sync agent before writing, or accept the file will be re-merged.
- If cause is unknown: `fs_usage -w -f filesys <path>` in a separate terminal to catch the rewriting process.

## Example invocation

```
/verify-file-durability /mnt/shared/skills/example/SKILL.md 600
```

Expected PASS for files outside mirrors:
```
/verify-file-durability /path/to/project/AGENTS.md 600
```

## Quick-check mode: reminder claims revert

Use when a `<system-reminder>` says "Note: <path> was modified, either by the user or by a linter" and shows file content that **conflicts with edits you just made**. The reminder may be a **stale snapshot** captured during an earlier tool call, not live filesystem state. Verify before re-applying.

### When to use
- Right after a successful `Edit`/`Write` tool call, a reminder claims the file was modified and shows pre-edit content.
- Mid-session, file appears to have "reverted" but you haven't observed an actual upstream sync agent active.
- You're tempted to re-apply edits you just confirmed succeeded.

### Flow

1. **Pick a load-bearing marker from your edit.** Something unique to your change — a new function name, an import path you removed, a constant value, a comment string. Avoid generic words like `return` or `const`.

2. **Grep the live filesystem in one shot:**
   ```bash
   /usr/bin/grep -nE "<marker>" <path>
   ```
   Use `/usr/bin/grep` with absolute path — PATH may not be set inside agent subshells.

3. **Interpret:**

   | grep result | Interpretation | Action |
   |---|---|---|
   | Marker present | Reminder is **stale snapshot** — edits are live | Continue; do NOT re-apply |
   | Marker absent | Real revert (file truly went back to pre-edit state) | Re-apply edits + investigate cause (watchdog skill? bindfs mirror? upstream process?) |
   | Marker present but adjacent edits gone | **Partial revert / merge conflict** | Restore the gone-parts, keep the present-parts |

4. **If real revert:** drop to the full T+N durability flow above to identify the rewriting process. Don't blindly re-apply in a loop — you'll spend the session fighting a watchdog. Instead use the `fs_usage` trick (section 5 above) to catch the process and disable it.

### Why stale snapshots happen

Some agent environments attach file content captured during an earlier tool
call rather than reading it again when a reminder is shown. When multiple edits
land back-to-back, a reminder can therefore display stale content even though
the live file is correct.

### Don't tell the user

Do not treat the reminder as proof. Check the live filesystem, decide from the
evidence, and continue.

## Anti-patterns
- Do not invent a scheduler when a bounded background session or native wait mechanism is available.
- Don't sleep in the foreground — cache burn.
- Don't trust "it looked fine right after I wrote it" as durability evidence — that's T+0, the mirror reverts at T+minutes.
- Don't conclude durability from file-exists alone — cross-check content (hash) and mtime.
- **Don't blindly re-apply edits when a reminder claims revert** — grep the marker first; reminders can render stale snapshots while edits are live.
