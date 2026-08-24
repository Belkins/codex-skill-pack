# Codex Skill Pack — Public Edition

A curated collection of 55 reusable agent skills for software delivery,
design, growth, research, and platform operations.

This public edition intentionally excludes personal memory, writing-voice
profiles, portfolio or company-specific instructions, generated project
caches, private paths and identifiers, deprecated aliases, and skills owned by
upstream plugins. A publication scan is included to help keep future changes
safe to share.

## What is a skill?

Each folder under `skills/` contains a `SKILL.md` entrypoint and, when useful,
supporting scripts or references. The skill teaches an agent when a workflow
applies, what outcome to produce, and which non-obvious constraints to respect.

Skills do not install tools or grant permissions. A workflow that mentions an
MCP connector, CLI, image generator, mobile toolchain, or multi-agent feature
still requires that capability in the recipient's environment.

## Install

List the available skills:

```bash
./scripts/install.sh --list
```

Install selected skills into the default Codex skill directory:

```bash
./scripts/install.sh api-design quick-fix security-review
```

Install the whole pack:

```bash
./scripts/install.sh --all
```

Use `--link` while developing the pack, or `--target <directory>` for a
different agent's skill directory. The installer never overwrites an existing
skill.

After installation, restart the agent application if it does not discover new
skills dynamically.

## Included skills

### Engineering and delivery

`agent-wave-verify`, `api-design`, `bughunter`, `build-feature`, `debug-swarm`,
`debugging-guide`, `deploy-check`, `full-output-enforcement`, `git-ship`,
`mirror-pattern`, `perf-check`, `quick-fix`, `refactor`, `research`,
`review-and-fix`, `scaffold`, `sprint-kickoff`, `tdd-workflow`, `teleport`,
`ultrareview`, `webhook-guide`

### Quality and security

`audit`, `harden`, `security-audit`, `security-review`

### Design and landing pages

`brandkit`, `hatch-pet`, `high-end-visual-design`, `image-to-code`,
`imagegen-frontend-mobile`, `imagegen-frontend-web`, `lp-conversion-strategy`,
`lp-design-build`, `lp-message-map`, `lp-verification-gate`

### Growth and content

`ahrefs-budget-check`, `competitor-intel`, `content-draft`, `growth-scan`,
`monetize-idea`, `seo-check`

### Platforms and operations

`apps-script-clasp-push`, `device-logs`, `diagnose-iap`,
`google-apps-script-debug`, `posthog-wizard-followup`, `preflight-ios`,
`ship-ios`, `supabase-state-check`, `telegram-report`, `vercel-env-flip`,
`verify-file-durability`, `verify-next-public-env`

### Agent control

`plan-only`, `swarm`

See [MANIFEST.md](MANIFEST.md) for capability requirements and routing notes.

## Validate before publishing

```bash
./scripts/validate.sh
./scripts/public-scan.sh
```

The validator checks skill structure and runs the bundled landing-page fixture
tests. The publication scan checks for absolute user paths, email addresses,
provider-shaped tokens, private keys, chat IDs, symlinks, and common credential
files. It is a guardrail, not a substitute for human review.

## Compatibility

The package follows the Codex `SKILL.md` folder convention. Many skills also
work in other instruction-driven agent environments, but tool names and
multi-agent commands may need adaptation.

Some optional dependencies:

- Multi-agent orchestration for swarm and parallel-review workflows
- Image generation for visual design and pet creation
- Ahrefs connector for SEO and competitor skills
- Telegram connector for `telegram-report`
- Node.js for landing-page validators and PostHog workflows
- Vercel, Supabase, Google clasp, Flutter, Xcode, and iOS tooling for their
  respective platform skills

## Publishing note

No package-wide open-source license has been selected. Individual skill folders
may retain their own license file. Choose a compatible package license and
review those files before publishing the collection as a public Git repository;
sharing the archive privately does not make the unlicensed remainder open
source automatically.
