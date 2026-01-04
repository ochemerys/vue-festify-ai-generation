# AI code generation

AI generation of Vue3+Typescript+Tailwind UI and Fastify + Typescript

## 📚 Documentation

**Start here:** [`ARCHITECTURE.md`](./ARCHITECTURE.md) - Canonical reference for all frontend architecture decisions.

For navigation and guidance on which document to use, see [`DOCUMENTATION_GUIDE.md`](./DOCUMENTATION_GUIDE.md).

### Key Documentation Files

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Canonical architecture reference (START HERE)
- **[DOCUMENTATION_GUIDE.md](./DOCUMENTATION_GUIDE.md)** - Navigation guide for all documentation
- **[REFACTORING_SUMMARY.md](./REFACTORING_SUMMARY.md)** - Summary of documentation refactoring
- **[ai-prompts/frontend/bdd-tdd-frontend-architecture.md](./ai-prompts/frontend/bdd-tdd-frontend-architecture.md)** - Full system architecture for all modules
- **[ai-prompts/frontend/frontend-design/generate-dashboard-components.md](./ai-prompts/frontend/frontend-design/generate-dashboard-components.md)** - Dashboard-specific component generation
- **[_docs/frontend-architecture.md](./_docs/frontend-architecture.md)** - Detailed architecture with test examples
- **[testing-guide.md](./testing-guide.md)** - Testing best practices and patterns
- **[monorepo-implementation-guide.md](./monorepo-implementation-guide.md)** - Monorepo structure and setup

---

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
- TypeORM (Type-safe DB access with decorators)
- SQL migrations managed by TypeORM

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
  frontend/         # Vue 3 + Tailwind
  backend/          # Fastify API
packages/
  contracts/        # Zod schemas + types
  ui-contracts/     # Component contracts
  db/               # TypeORM entities
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
    const orderRepository = AppDataSource.getRepository(Order);
    const order = orderRepository.create(req.body);
    await orderRepository.save(order);
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

## Database as a Contract (TypeORM)

```typescript
@Entity({ name: 'orders' })
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  customerId!: string;

  @CreateDateColumn()
  createdAt!: Date;
}
```

TypeORM provides:

- Type-safe entity definitions
- Migration scripts
- Repository pattern for data access

## AI Generation Strategy (Very Important)

### AI Inputs

1. Gherkin features
2. Zod schemas
3. TypeORM entities
4. Project conventions

### AI Outputs

- Vue components
- Fastify routes
- TypeORM repository code
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
| DB TypeORM  | test client |

## Why This Works Exceptionally Well with AI

AI performs best when:

- Types are explicit
- Contracts are shared
- Conventions are enforced
- Files are colocated

A TS monorepo with Zod + TypeORM is almost ideal AI substrate.

## When to Consider Deviations

| Requirement     | Adjustment                  |
| --------------- | --------------------------- |
| High throughput | Add gRPC or Redis           |
| Real-time       | WebSockets / Socket.IO      |
| Microservices   | Keep contracts package      |
| Multi-team      | Enforce versioned contracts |
