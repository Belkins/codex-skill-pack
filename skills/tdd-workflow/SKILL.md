---
name: tdd-workflow
description: Test-driven development methodology — red-green-refactor cycle, test patterns, and TDD best practices for any project.
---

# Test-Driven Development Workflow

Implement features using the RED-GREEN-REFACTOR cycle.

## Instructions

Given a feature to implement (via `$ARGUMENTS` or conversation):

### Step 1 — Understand the Requirement

Before writing any code, clarify:
- What should this feature do? (inputs, outputs)
- What are the edge cases?
- What should happen on errors?

### Step 2 — Write the Test First (RED)

1. Create or open the `.spec.ts` file for the target service/module
2. Write a test using Arrange-Act-Assert pattern:
   - **Arrange**: set up mocks and test data
   - **Act**: call the method under test
   - **Assert**: verify the expected outcome
3. Run: `pnpm test [file].spec.ts` — it should FAIL

### Step 3 — Write Minimal Code (GREEN)

1. Implement the absolute minimum code to make the test pass
2. Do not add extra features, error handling, or optimizations yet
3. Run the test again — it should PASS

### Step 4 — Add Edge Case Tests

Write additional tests for:
- Empty inputs (empty arrays, null, undefined)
- Not found scenarios (NotFoundException)
- Invalid inputs (BadRequestException)
- Boundary values

Run after each new test to confirm it passes.

### Step 5 — Refactor (REFACTOR)

1. Improve code quality without changing behavior
2. Extract helper methods for complex logic
3. Improve naming and readability
4. Run all tests again to confirm nothing broke

### Step 6 — Verify Completeness

- Run full test suite: `pnpm test`
- Run build: `pnpm build`
- Check coverage if needed: `pnpm test:cov`
- Target >80% coverage for the module

## Test Conventions

- **File naming**: `{name}.service.spec.ts`
- **Test names**: `should [behavior] when [condition]`
- **One assertion per test** where practical
- **Mock only external dependencies** (repositories, external services)
- **Use `beforeEach` with `jest.clearAllMocks()`** for test isolation
- **Use typed mocks**: `jest.Mocked<Repository>` not `any`
