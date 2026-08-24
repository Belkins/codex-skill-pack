#!/usr/bin/env bash
set -euo pipefail

skill_scan_script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
skill_scan_root="${1:-$(cd "$skill_scan_script_dir/.." && pwd)}"
skill_scan_failed=0

scan_pattern() {
  local skill_scan_label="$1"
  local skill_scan_pattern="$2"
  local skill_scan_output=""

  if command -v rg >/dev/null 2>&1; then
    skill_scan_output="$(rg -n -I -g '!**/public-scan.sh' -e "$skill_scan_pattern" "$skill_scan_root" || true)"
  else
    skill_scan_output="$(grep -RInE --exclude='public-scan.sh' "$skill_scan_pattern" "$skill_scan_root" || true)"
  fi

  if [[ -n "$skill_scan_output" ]]; then
    echo "FAIL: $skill_scan_label" >&2
    echo "$skill_scan_output" >&2
    skill_scan_failed=1
  fi
}

scan_pattern "absolute macOS user path" '/Users/[^/<[:space:]]+'
scan_pattern "absolute Linux home path" "(^|[[:space:]\"'=(:])/home/[^/<[:space:]]+"
scan_pattern "email address" '[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}'
scan_pattern "Google Apps Script deployment-shaped value" 'AKfyc[A-Za-z0-9_-]{20,}'
scan_pattern "Telegram supergroup-shaped ID" '-100[0-9]{8,}'
scan_pattern "GitHub token-shaped value" 'gh[pousr]_[A-Za-z0-9]{20,}'
scan_pattern "Slack token-shaped value" 'xox[baprs]-[A-Za-z0-9-]{10,}'
scan_pattern "OpenAI key-shaped value" 'sk-[A-Za-z0-9_-]{16,}'
scan_pattern "Google API key-shaped value" 'AIza[A-Za-z0-9_-]{20,}'
scan_pattern "AWS access key-shaped value" 'AKIA[A-Z0-9]{16}'
scan_pattern "private key block" 'BEGIN [A-Z ]+PRIVATE KEY'

skill_scan_links="$(find "$skill_scan_root" -type l -print)"
if [[ -n "$skill_scan_links" ]]; then
  echo "FAIL: symbolic links can leak local paths" >&2
  echo "$skill_scan_links" >&2
  skill_scan_failed=1
fi

skill_scan_credential_files="$(find "$skill_scan_root" -type f \( -name '.env' -o -name '.env.*' -o -name '*.pem' -o -name '*.p8' -o -name 'credentials.json' \) -print)"
if [[ -n "$skill_scan_credential_files" ]]; then
  echo "FAIL: credential-shaped files found" >&2
  echo "$skill_scan_credential_files" >&2
  skill_scan_failed=1
fi

if ((skill_scan_failed)); then
  exit 1
fi

echo "public scan: PASS"
