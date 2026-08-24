#!/usr/bin/env bash
set -euo pipefail

skill_pack_script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
skill_pack_root="$(cd "$skill_pack_script_dir/.." && pwd)"
skill_pack_source="$skill_pack_root/skills"
skill_pack_target="${CODEX_HOME:-$HOME/.codex}/skills"
skill_pack_mode="copy"
skill_pack_install_all=false
skill_pack_list_only=false
skill_pack_requested=()

usage() {
  sed -n '1,120p' <<'USAGE'
Usage:
  ./scripts/install.sh --list
  ./scripts/install.sh [--link] [--target <directory>] <skill> [<skill> ...]
  ./scripts/install.sh [--link] [--target <directory>] --all

The installer refuses to overwrite existing skill folders.
USAGE
}

while (($#)); do
  case "$1" in
    --all)
      skill_pack_install_all=true
      ;;
    --link)
      skill_pack_mode="link"
      ;;
    --target)
      shift
      if (($# == 0)); then
        echo "error: --target requires a directory" >&2
        exit 2
      fi
      skill_pack_target="$1"
      ;;
    --list)
      skill_pack_list_only=true
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    --*)
      echo "error: unknown option: $1" >&2
      usage >&2
      exit 2
      ;;
    *)
      skill_pack_requested+=("$1")
      ;;
  esac
  shift
done

list_skills() {
  find "$skill_pack_source" -mindepth 1 -maxdepth 1 -type d -exec basename {} \; | sort
}

if [[ "$skill_pack_list_only" == true ]]; then
  list_skills
  exit 0
fi

if [[ "$skill_pack_install_all" == true ]]; then
  while IFS= read -r skill_pack_name; do
    skill_pack_requested+=("$skill_pack_name")
  done < <(list_skills)
fi

if ((${#skill_pack_requested[@]} == 0)); then
  usage >&2
  exit 2
fi

mkdir -p "$skill_pack_target"
skill_pack_failed=0

for skill_pack_name in "${skill_pack_requested[@]}"; do
  if [[ ! "$skill_pack_name" =~ ^[a-z0-9-]+$ ]]; then
    echo "error: invalid skill name: $skill_pack_name" >&2
    skill_pack_failed=1
    continue
  fi

  skill_pack_from="$skill_pack_source/$skill_pack_name"
  skill_pack_to="$skill_pack_target/$skill_pack_name"

  if [[ ! -f "$skill_pack_from/SKILL.md" ]]; then
    echo "error: unknown skill: $skill_pack_name" >&2
    skill_pack_failed=1
    continue
  fi

  if [[ -e "$skill_pack_to" || -L "$skill_pack_to" ]]; then
    echo "skip: $skill_pack_name already exists at $skill_pack_to" >&2
    skill_pack_failed=1
    continue
  fi

  if [[ "$skill_pack_mode" == "link" ]]; then
    ln -s "$skill_pack_from" "$skill_pack_to"
  else
    cp -R "$skill_pack_from" "$skill_pack_to"
  fi
  echo "installed: $skill_pack_name -> $skill_pack_to"
done

exit "$skill_pack_failed"

