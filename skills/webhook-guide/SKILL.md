---
name: webhook-guide
description: Webhook integration patterns — signature validation, queue processing, idempotency, and retry strategies for external service webhooks.
---

# Webhook Integration Pattern

Set up a webhook endpoint with signature validation and async queue processing.

## Instructions

Given an external service (via `$ARGUMENTS` or conversation), implement:

### Step 1 — Create Webhook Endpoint

In the relevant controller:
- Accept POST with `@Req() req: RawBodyRequest<Request>`
- Extract signature from headers
- Validate raw body and signature header exist
- Return `{ received: true }` immediately (async processing)
- Use `@ApiExcludeEndpoint()` to hide from Swagger

### Step 2 — Ensure Raw Body Access

Verify `src/main.ts` has `rawBody: true` in NestFactory.create options.
This is REQUIRED for webhook signature validation.

### Step 3 — Implement Signature Validation

- Use the service SDK's built-in validation (Stripe, HubSpot, etc.)
- Always validate against `req.rawBody` (Buffer), never `JSON.stringify(req.body)`
- Throw `BadRequestException` on validation failure
- Store webhook secret via `ConfigService`, never hardcode

### Step 4 — Queue for Async Processing

In the service:
- Validate signature BEFORE queueing
- Add job to BullMQ queue with retry config:
  - `attempts: 3`
  - `backoff: { type: 'exponential', delay: 2000 }`
- Log webhook receipt with event ID and type

### Step 5 — Create Queue Processor

Create `{name}-webhook.processor.ts`:
- Extend `WorkerHost`
- Implement idempotency check (skip already-processed event IDs)
- Route to handlers based on event type (switch statement)
- Re-throw errors to trigger BullMQ retry
- Log extensively with event ID, job ID, attempt number

### Step 6 — Register Queue

- Add queue name to `src/static/queues.ts`
- Register queue in module with `BullModule.registerQueue()`
- Add processor to module providers

### Step 7 — Write Tests

Test the processor:
- Each event type handler
- Idempotency (duplicate events skipped)
- Error handling and retry behavior

### Step 8 — Configure Production

- Register webhook URL in external service dashboard
- Select specific events to listen for
- Copy webhook signing secret to environment/K8s secrets

## Key Rules

- ALWAYS use raw body for signature validation
- ALWAYS return 200 quickly (< 5 seconds)
- ALWAYS implement idempotency
- NEVER process synchronously in the controller
- NEVER expose webhook endpoints in Swagger
