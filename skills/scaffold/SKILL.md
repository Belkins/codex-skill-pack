---
name: scaffold
description: Scaffold a new module or component for any framework — detects project type and generates all boilerplate following existing patterns.
---

# Universal Scaffold

Generate boilerplate for `$ARGUMENTS` following existing project patterns.

## Instructions

### Step 1 — Detect Framework

Check the current project directory:
- `package.json` → check for nest, next, react, vue, express, fastify
- `pyproject.toml` or `requirements.txt` → check for fastapi, django, flask
- `go.mod` → Go project
- Fall back to user's hint in `$ARGUMENTS` (e.g., "nestjs notifications")

### Step 2 — Read Existing Patterns

Find 2-3 existing modules/components to copy patterns from:
- File structure and naming conventions
- Import organization
- Boilerplate patterns (decorators, types, exports)

### Step 3 — Generate Files

Based on detected framework:

#### NestJS Module
Create in `src/modules/[name]/`:
- `[name].module.ts` — Module with imports, controllers, providers, exports
- `[name].controller.ts` — Controller with versioned routes, RouteGuard, Swagger
- `[name].service.ts` — Service with business logic, error handling
- `[name].repository.ts` — Repository with CRUD, .lean(), Types.ObjectId
- `[name].schema.ts` — Mongoose schema with timestamps, indexes
- `dto/create-[name].dto.ts` — Create DTO with class-validator
- `dto/update-[name].dto.ts` — Update DTO (PartialType)
- `dto/get-[name].dto.ts` — Query DTO with pagination
- `[name].service.spec.ts` — Unit test skeleton
Then: add collection to `src/static/collections.ts`, import module in `app.module.ts`

#### Next.js Page/Component
Detect App Router vs Pages Router, create appropriate files.

#### React Component
Create component file, types, optional test file.

#### Python FastAPI
Create router, schemas, service, models.

#### Generic
Ask user what files to generate.

### Step 4 — Register

Register the new module/component in the project:
- NestJS: add to `app.module.ts` imports
- Next.js: route is automatic from file location
- React: export from index barrel file
- FastAPI: include router in main app

## Output

After creating files, list:
1. All files created with their purpose
2. Any manual steps needed (e.g., run migrations)
