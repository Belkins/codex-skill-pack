---
name: security-audit
description: Run a 4-agent security audit on any codebase — client exposure, auth, secrets, injection
---

# /security-audit — Parallel Security Audit

Run a 4-agent security swarm on `$ARGUMENTS`. All agents are **read-only** — they report findings but do NOT edit files. Framework-agnostic (works on React, Flutter, NestJS, Python, etc.).

## Instructions

Use four `security-reviewer` sub-agents in as few parallel waves as the
environment allows. If sub-agents are unavailable, run the four read-only
lenses sequentially.

### Agent 1 — Client-Side Exposure & Build Artifacts
> Audit client-side secret exposure for: `$ARGUMENTS`
>
> Check:
> - **Vite/React**: Any `VITE_` prefixed env vars containing secrets (API keys, tokens) — these are bundled into browser JS
> - **Webpack**: `DefinePlugin` or `EnvironmentPlugin` injecting secrets into client bundles
> - **Flutter**: `.env` listed in `pubspec.yaml` assets (bundled into IPA/APK, extractable)
> - **Compiled output**: Search `dist/`, `build/`, `.next/` for API key patterns (`AIza`, `sk-`, `ghp_`, `Bearer`)
> - **vite.config / webpack.config**: `define` blocks mapping secrets to `process.env.*`
> - **Source maps**: Are they deployed to production? (leak internal code)
> - **HTML templates**: Hardcoded keys in `index.html`, meta tags, or inline scripts
>
> Report findings with severity (CRITICAL/HIGH/MEDIUM/LOW) and file:line references.

### Agent 2 — Auth & Access Control
> Audit authentication and authorization for: `$ARGUMENTS`
>
> Check (framework-agnostic):
> - Unprotected API endpoints or routes (no auth middleware/guard)
> - JWT validation edge cases (expired, malformed, missing, wrong issuer)
> - Role/permission hierarchy enforcement
> - Data isolation (users accessing other users' data via ID manipulation)
> - Session management (token storage, refresh flow, logout invalidation)
> - OAuth callback validation (state parameter, redirect URI validation)
> - Supabase RLS policies: are they enabled on all tables with user data?
> - Edge functions: do they verify JWT before processing requests?
>
> Report findings with severity and file:line references.

### Agent 3 — Secrets & Configuration
> Audit secrets management and history for: `$ARGUMENTS`
>
> Check:
> - **Hardcoded secrets**: API keys, passwords, tokens in source files (not .env)
> - **Git history**: `git log -p --all -S "AIza" -S "sk-" -S "password" -S "secret"` — were secrets ever committed?
> - **.env files**: Are they in `.gitignore`? Were they ever tracked? (`git log --all -- '*.env*'`)
> - **Documentation**: Deployment docs, READMEs with real keys (check `docs/`)
> - **CI/CD configs**: GitHub Actions, Vercel configs, Dockerfiles with inline secrets
> - **Package manifests**: `pubspec.yaml`, `package.json` scripts with embedded keys
> - **Build artifacts**: Docker images, compiled binaries with baked-in secrets
> - **Repository visibility**: Is the repo public? (`git remote -v` + `gh repo view --json isPrivate`)
> - **Error responses**: Do API errors leak stack traces, internal paths, or secret values?
> - **Logging**: Does any log statement print tokens, passwords, or API keys?
>
> Report findings with severity and file:line references.

### Agent 4 — Input Validation & Injection
> Audit input handling and injection vectors for: `$ARGUMENTS`
>
> Check OWASP Top 10 (framework-agnostic):
> - SQL/NoSQL injection: user input in queries without parameterization
> - Command injection: user-controlled strings in `exec`, `spawn`, `system` calls
> - XSS: unescaped user content in HTML responses or dangerouslySetInnerHTML
> - SSRF: user-controlled URLs in server-side fetch/request calls
> - Path traversal: user input in file paths (`../../../etc/passwd`)
> - Deserialization: untrusted data in `JSON.parse`, `eval`, `pickle.loads`
> - Rate limiting: are sensitive endpoints (login, signup, payment) rate-limited?
> - CORS: overly permissive `Access-Control-Allow-Origin: *` on authenticated endpoints
> - Request size limits: can users send arbitrarily large payloads?
> - Webhook signature validation: are incoming webhooks verified before processing?
>
> Report findings with severity and file:line references.

## Output Format

After all 4 agents complete, compile a security report:

### Security Report: `$ARGUMENTS`

| Severity | Count | Category |
|----------|-------|----------|
| CRITICAL | X | ... |
| HIGH     | X | ... |
| MEDIUM   | X | ... |
| LOW      | X | ... |

**Top Findings** (CRITICAL and HIGH only, with file:line and remediation steps)

**Recommended Immediate Actions** (ordered by severity, with specific fix instructions)
