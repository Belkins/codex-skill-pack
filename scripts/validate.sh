#!/usr/bin/env bash
set -euo pipefail

skill_validate_script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
skill_validate_root="$(cd "$skill_validate_script_dir/.." && pwd)"
skill_validate_source="$skill_validate_root/skills"
skill_validate_count=0
skill_validate_validator="${SKILL_VALIDATOR:-}"

if [[ -z "$skill_validate_validator" ]]; then
  skill_validate_candidate="${CODEX_HOME:-$HOME/.codex}/skills/.system/skill-creator/scripts/quick_validate.py"
  if [[ -f "$skill_validate_candidate" ]]; then
    skill_validate_validator="$skill_validate_candidate"
  fi
fi

if [[ -n "$skill_validate_validator" ]] && ! python3 -c 'import yaml' >/dev/null 2>&1; then
  echo "note: PyYAML is unavailable; using the bundled structural checks instead of quick_validate.py"
  skill_validate_validator=""
fi

while IFS= read -r skill_validate_dir; do
  skill_validate_file="$skill_validate_dir/SKILL.md"
  if [[ ! -f "$skill_validate_file" ]]; then
    echo "FAIL: missing $skill_validate_file" >&2
    exit 1
  fi

  if [[ "$(sed -n '1p' "$skill_validate_file")" != "---" ]]; then
    echo "FAIL: missing YAML frontmatter opener: $skill_validate_file" >&2
    exit 1
  fi

  grep -qE '^name:[[:space:]]*' "$skill_validate_file" || {
    echo "FAIL: missing name: $skill_validate_file" >&2
    exit 1
  }
  grep -qE '^description:[[:space:]]*' "$skill_validate_file" || {
    echo "FAIL: missing description: $skill_validate_file" >&2
    exit 1
  }

  if [[ -n "$skill_validate_validator" ]]; then
    python3 "$skill_validate_validator" "$skill_validate_dir"
  fi
  skill_validate_count=$((skill_validate_count + 1))
done < <(find "$skill_validate_source" -mindepth 1 -maxdepth 1 -type d | sort)

node "$skill_validate_source/lp-conversion-strategy/scripts/validate-brief.mjs" \
  "$skill_validate_source/lp-conversion-strategy/scripts/fixtures/brief-good.json"

if node "$skill_validate_source/lp-conversion-strategy/scripts/validate-brief.mjs" \
  "$skill_validate_source/lp-conversion-strategy/scripts/fixtures/brief-bad.json" >/dev/null 2>&1; then
  echo "FAIL: invalid conversion fixture unexpectedly passed" >&2
  exit 1
fi

node "$skill_validate_source/lp-design-build/scripts/check-page-spec.mjs" \
  "$skill_validate_source/lp-design-build/scripts/fixtures/page-spec-good.json"

if node "$skill_validate_source/lp-design-build/scripts/check-page-spec.mjs" \
  "$skill_validate_source/lp-design-build/scripts/fixtures/page-spec-bad.json" >/dev/null 2>&1; then
  echo "FAIL: invalid page fixture unexpectedly passed" >&2
  exit 1
fi

node "$skill_validate_source/lp-message-map/scripts/lint-copy.mjs" \
  "$skill_validate_source/lp-message-map/scripts/fixtures/message-map-good.json"

if node "$skill_validate_source/lp-message-map/scripts/lint-copy.mjs" \
  "$skill_validate_source/lp-message-map/scripts/fixtures/message-map-bad.json" >/dev/null 2>&1; then
  echo "FAIL: invalid copy fixture unexpectedly passed" >&2
  exit 1
fi

"$skill_validate_script_dir/public-scan.sh" "$skill_validate_root"
echo "validation: PASS ($skill_validate_count skills)"
