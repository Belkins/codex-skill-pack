---
name: teleport
description: Jump to a file or symbol by name — searches filenames and content, returns up to 10 file matches and content matches with line numbers
---

# Teleport

Navigate to `$ARGUMENTS` in the codebase. Run these two searches in parallel:

1. **File search** — Use Glob with pattern `**/*$ARGUMENTS*` (substitute the actual target string). Return up to 10 matching paths.

2. **Content search** — Use Grep with the exact target string as pattern, output_mode "content", `-n true`, head_limit 50. Return matching lines with file path and line number.

Format output as:

```
Teleport  →  $ARGUMENTS

Files
  path/to/match.ts
  path/to/other.tsx

Code
  src/lib/foo.ts:12   export function targetName() {
  src/server/router.ts:45   import { targetName } from '@/lib/foo'
```

If nothing found: "No matches for '$ARGUMENTS' — try a shorter term or partial name."
