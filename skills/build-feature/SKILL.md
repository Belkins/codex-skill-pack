---
name: build-feature
description: Build a NestJS and Mongoose feature with coordinated implementation, test, and API-layer agents when this stack and module pattern match the repository.
---

# Parallel Feature Build

Build `$ARGUMENTS` using 3 coordinated agents. Each agent owns different files to prevent conflicts.

## Instructions

### Phase 1 — Schema + Service (sequential start)

Launch Agent 1 first:

**Agent 1** (`worker`, with exclusive ownership of the schema, repository, service, module, and app-module wiring):
> Implement the data layer for: `$ARGUMENTS`
>
> Create in `src/modules/<feature>/`:
> - `<feature>.schema.ts` — MongoDB schema with timestamps, proper types, indexes
> - `<feature>.repository.ts` — Data access layer with CRUD methods, `.lean()`, `Types.ObjectId`
> - `<feature>.service.ts` — Business logic, validation, error handling
> - `<feature>.module.ts` — Module definition with MongooseModule.forFeature
>
> Follow repository conventions from `AGENTS.md`, `CONTRIBUTING.md`, and nearby modules:
> - Controller -> Service -> Repository pattern
> - Use `COLLECTIONS` constant for collection name
> - Use `@Prop()` decorators with proper types
> - Export service and repository for cross-module use
>
> Add the module import to `src/app.module.ts`.

### Phase 2 — Tests + Controller (parallel, after Phase 1)

After Agent 1 completes, launch Agent 2 and Agent 3 in **parallel**:

**Agent 2** (`tdd-guide`, with exclusive ownership of the test files):
> Write unit tests for: `$ARGUMENTS`
>
> Create `<feature>.service.spec.ts` with:
> - Mock repository using jest.fn()
> - Arrange-Act-Assert pattern
> - Test happy paths, error cases, edge cases
> - Test NotFoundException for missing resources
> - Test validation logic
>
> Follow the repository's established test patterns. Target 80%+ coverage when that metric is available and appropriate.
> Run `pnpm test <feature>` to verify all tests pass.

**Agent 3** (`worker`, with exclusive ownership of controllers and DTOs):
> Build the API layer for: `$ARGUMENTS`
>
> Create in `src/modules/<feature>/`:
> - `<feature>.controller.ts` — HTTP routes with `@RouteGuard`, versioning `v1`
> - `dto/create-<feature>.dto.ts` — Create DTO with class-validator decorators
> - `dto/update-<feature>.dto.ts` — Update DTO (PartialType of create)
> - `dto/get-<feature>.dto.ts` — Query DTO with pagination (limit/offset)
>
> Follow conventions:
> - `@Controller({ path: '<feature>', version: '1' })`
> - `@RouteGuard({ roles: [...] })` on every endpoint
> - Use `@CurrentUser()` and `@CurrentPartner()` decorators where needed
> - Add `@ApiTags` and `@ApiOperation` for Swagger

## Output Format

After all agents complete, summarize:
1. Files created per agent
2. Test results from Agent 2
3. Any conflicts or issues to resolve manually
