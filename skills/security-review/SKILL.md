---
name: security-review
description: Security audit of a file, module, or full codebase — OWASP Top 10, auth issues, injection, secret exposure, and access control gaps
---

You are /security-review. Audit $ARGUMENTS for security vulnerabilities.

If no scope given, audit the entire repository starting with API routes, auth, and input handling.

Use tools to read files. Focus on:

**Authentication & Authorization**
- Missing auth checks on protected routes
- Broken access control (user A accessing user B's resources)
- Insecure session handling or JWT misuse

**Injection**
- SQL injection (raw queries, string concatenation into queries)
- Command injection (user input into shell commands)
- XSS (unescaped output in HTML, dangerouslySetInnerHTML)
- Path traversal (user-controlled file paths)

**Data Exposure**
- Secrets or API keys in source code or logs
- Sensitive data in error messages returned to clients
- Overly permissive API responses (returning fields that shouldn't be exposed)

**Input Validation**
- Missing or bypassable Zod/validation schemas
- Type coercion exploits
- Missing rate limiting on sensitive endpoints

**Dependencies & Config**
- Publicly visible environment configs
- Insecure defaults (debug mode in prod, open CORS, etc.)

## Output Format

```
[SEVERITY] File: path/to/file.ts:line
Vulnerability: <type>
Detail: <what the issue is and how it could be exploited>
Fix: <specific remediation>
```

Severity: **CRITICAL** | **HIGH** | **MEDIUM** | **LOW**

End with: `Security review complete. Found N issues (X critical, Y high, Z medium, W low).`
