---
name: api-design
description: Design REST API endpoints from requirements — generates route table, DTOs, response schemas, and auth requirements.
---

# API Design

Design API endpoints for `$ARGUMENTS`.

## Instructions

### Step 1 — Detect Project Framework

Check the current directory for:
- `package.json` with NestJS → Use NestJS patterns (Controller, DTOs, RouteGuard)
- `package.json` with Express → Use Express patterns (router, middleware)
- `pyproject.toml` with FastAPI → Use FastAPI patterns (router, Pydantic models)
- Other → Use generic REST patterns

### Step 2 — Read Existing Patterns

Find 2-3 existing API endpoints in the project to understand conventions:
- Routing patterns (versioning, naming)
- Authentication/authorization patterns
- Request/response formats
- Error handling patterns
- Pagination patterns

### Step 3 — Design Endpoints

For `$ARGUMENTS`, design:

1. **Route table** — HTTP method, path, purpose, auth requirements
2. **Request schemas** — DTOs/models with field types and validation
3. **Response schemas** — success and error response shapes
4. **Auth requirements** — which roles/permissions needed per endpoint
5. **Pagination** — for list endpoints, include limit/offset or cursor

### Output Format

## API Design: `$ARGUMENTS`

### Routes

| Method | Path | Purpose | Auth |
|--------|------|---------|------|
| GET | /v1/... | List resources | Admin, User |
| POST | /v1/... | Create resource | Admin |
| ... | ... | ... | ... |

### Request Schemas

#### Create [Resource] DTO
```typescript
{
  field: type  // validation rule
}
```

### Response Schemas

#### Success Response
```json
{
  "data": [...],
  "total": 100,
  "limit": 20,
  "offset": 0
}
```

#### Error Response
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [...]
}
```

### Implementation Notes
- [Framework-specific guidance based on detected framework]
- [Files to create/modify]
