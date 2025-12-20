# AI code generation

AI generation of Vue3+Typescript+Tailwind UI and Fastify + Typescript

## Core Recommendation (Executive Summary)

Use TypeScript as the single source of truth across the stack, with:

- Gherkin → behavioral intent
- TypeScript contracts → structural truth
- AI → code generation and glue
- Monorepo → enforced consistency

This avoids context switching, minimizes impedance mismatch, and dramatically improves AI reliability.

## Recommended Stack (JS / TS Full Stack)

### Frontend

- Vue 3
- TypeScript
- Tailwind
- Vite
- Vitest + Playwright

### Backend

- Node.js
- TypeScript
- Fastify (preferred over Express for typing & performance)
- Zod (runtime + compile-time validation)
- OpenAPI-compatible REST

### Database

- PostgreSQL
- Prisma ORM (Type-safe DB contract)
- SQL migrations managed by Prisma

Contracts

- TypeScript interfaces
- Zod schemas (canonical)
- Generated types (UI/API/DB)

## Contract Strategy (Critical Design Choice)

### Use Zod as the Canonical Contract

Zod gives you:

- Runtime validation
- Type inference
- OpenAPI generation
- AI-friendly structure

```ts
import { z } from "zod";

export const CreateOrderSchema = z.object({
  customerId: z.string().uuid(),
  items: z
    .array(
      z.object({
        productId: z.string(),
        quantity: z.number().int().positive(),
      })
    )
    .min(1),
});

export type CreateOrder = z.infer<typeof CreateOrderSchema>;
```

This single schema feeds:

- UI form validation
- API request validation
- DB input constraints
- AI code generation

## Gherkin’s Role in a JS Full Stack

Gherkin defines **behavioral truth**, not structure.

#### Scenario: Create order successfully

- Given the user is authenticated
- When the user submits a valid order
- Then the order should be persisted
- And the response status should be 201

This constrains:

- API semantics
- UI behavior
- DB side effects

## Monorepo Structure (Strongly Recommended)

```text
apps/
  web/              # Vue 3 + Tailwind
  api/              # Fastify API
packages/
  contracts/        # Zod schemas + types
  ui-contracts/     # Component contracts
  db/               # Prisma schema
  test-helpers/     # Gherkin step bindings
```

This structure:

- Prevents drift
- Makes AI generation deterministic
- Enables end-to-end typing

## Backend Example (Fastify + Zod)

```ts
fastify.post(
  "/orders",
  {
    schema: {
      body: CreateOrderSchema,
    },
  },
  async (req, reply) => {
    const order = await prisma.order.create({
      data: req.body,
    });
    reply.code(201).send(order);
  }
);
```

No DTO duplication. No guessing.

## Frontend Example (Vue + Zod)

```ts
const form = useForm({
  schema: CreateOrderSchema,
});
```

Same contract. Same types. Same validation.

## Database as a Contract (Prisma)

```prisma
model Order {
  id          String   @id @default(uuid())
  customerId String
  createdAt  DateTime @default(now())
}
```

Prisma generates:

- Type-safe DB client
- Migration scripts
- Input/output types

## AI Generation Strategy (Very Important)

### AI Inputs

1. Gherkin features
2. Zod schemas
3. Prisma models
4. Project conventions

### AI Outputs

- Vue components
- Fastify routes
- Prisma access code
- Tests (Vitest + Playwright)

### Hard Rules for AI

- Never create fields outside Zod schemas
- Never bypass validation
- Never invent DB columns
- Always satisfy Gherkin scenarios

## Testing Pyramid (JS-Only)

| Layer       | Tool        |
| ----------- | ----------- |
| Gherkin E2E | Playwright  |
| API         | Vitest      |
| Contracts   | Zod tests   |
| DB Prisma   | test client |

## Why This Works Exceptionally Well with AI

AI performs best when:

- Types are explicit
- Contracts are shared
- Conventions are enforced
- Files are colocated

A TS monorepo with Zod + Prisma is almost ideal AI substrate.

## When to Consider Deviations

| Requirement     | Adjustment                  |
| --------------- | --------------------------- |
| High throughput | Add gRPC or Redis           |
| Real-time       | WebSockets / Socket.IO      |
| Microservices   | Keep contracts package      |
| Multi-team      | Enforce versioned contracts |
