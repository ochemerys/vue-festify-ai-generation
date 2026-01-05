# Vue Festify AI Generation Monorepo

AI-assisted code generation for a full-stack Inventory Management example using:
- Frontend: Vue 3 + TypeScript + Tailwind + Vite + Vitest/Playwright
- Backend: Fastify + TypeScript + Vitest
- Contracts: TypeScript-first shared types and API contracts
- Database: TypeORM (PostgreSQL) for entities and migrations (package scaffolding present)
- BDD: Cucumber (Gherkin) feature specs with step definitions

This repository is organized as a JavaScript/TypeScript monorepo targeting end-to-end type safety and AI-friendly conventions.

---

## Repository Layout

Top-level notable files and directories:
- README.md (this file)
- docker-compose.yml (services orchestration where applicable)
- pnpm-workspace.yaml (monorepo workspaces)
- package.json (root tooling and scripts)
- vitest.config.ts, eslint.config.js, .editorconfig, .prettierrc
- .env.example, .env.test
- _docs/ (curated documentation)
- ai-prompts/ (prompt engineering and generation guides)
- inventory-management/ (example application - apps and documentation)
- packages/ (shared and service packages)
- scripts/ (test setup and utility scripts)

### Monorepo Workspaces

- inventory-management/
  - apps/
    - backend/: Fastify API service (TypeScript)
    - frontend/: Vue 3 app (Vite + Tailwind)
  - README.md: domain-level documentation

- packages/
  - bdd/: Gherkin features and step definitions (Cucumber + TS)
  - contracts/: Shared API/domain contracts in TypeScript
  - db/: TypeORM entities, data-source, and seed scaffolding
  - design/: UI/UX design specs for pages and components

- _docs/: Architecture, testing, and monorepo guides (canonical docs)
- ai-prompts/: Source prompts and guides used to generate code and designs

---

## Getting Started

Prerequisites:
- Node.js 18+
- pnpm (recommended for workspaces)
- Docker (optional for DB and services via docker-compose)

Install dependencies for all workspaces:
- pnpm install

Environment variables:
- Copy .env.example to .env at the root and fill values when needed.
- Some packages include their own .env.example files (e.g., packages/bdd).

---

## Running the Apps

You can run services independently. Each app has its own README with details; below are common commands from the root using pnpm filters.

- Start frontend (Vite dev server):
  - pnpm --filter "@inventory/frontend" dev

- Start backend (Fastify dev server):
  - pnpm --filter "@inventory/backend" dev

- Build frontend:
  - pnpm --filter "@inventory/frontend" build

- Run backend in production mode (after build when applicable):
  - pnpm --filter "@inventory/backend" start

Notes:
- See inventory-management/apps/frontend/README.md and inventory-management/apps/backend/README.md for app-specific scripts and configuration.

---

## Testing

Unit and integration tests:
- Frontend (Vitest):
  - pnpm --filter "@inventory/frontend" test

- Backend (Vitest):
  - pnpm --filter "@inventory/backend" test

BDD (Cucumber):
- Feature files live under packages/bdd/features
- Step definitions under packages/bdd/steps
- Run BDD tests:
  - pnpm --filter "@inventory/bdd" test

Playwright (if configured in frontend project):
- Refer to inventory-management/apps/frontend/__docs__ and frontend README for status and commands.

---

## Packages Overview

- packages/contracts
  - Shared TypeScript contracts (API/domain) used by backend and frontend
  - Tests located in src/__tests__

- packages/db
  - TypeORM data-source, entities, and seeds
  - Migrations directory scaffolded; see TYPEORM_SETUP.md and TYPEORM_FINAL_SETUP.md

- packages/bdd
  - Gherkin feature files for auth, inventory, orders, products, reporting
  - Cucumber configuration and TypeScript step definitions

- packages/design
  - Design documentation and page/component specs used to drive UI generation

---

## Documentation Map

Canonical documentation is curated under _docs/:
- _docs/ARCHITECTURE.md (start here for architecture decisions)
- _docs/frontend-architecture.md
- _docs/testing-guide.md
- _docs/monorepo-implementation-guide.md
- _docs/ai-generation-comparison.md
- inventory-management/__docs__ (implementation status, checklists, lessons learned specific to the example app)

Prompt and generation guides:
- ai-prompts/frontend/bdd-tdd-frontend-architecture.md
- ai-prompts/frontend/frontend-design/
- ai-prompts/backend and ai-prompts/db

---

## Inventory Management Example

Key paths:
- inventory-management/apps/frontend
  - Vue 3 app with pages (Dashboard, Inventory, Products) and typed components
  - Tailwind, Vite, Vitest setup; router and types under src/

- inventory-management/apps/backend
  - Fastify routes for auth, inventory, orders, products, purchase orders, and reports
  - Services, middleware, utils; Vitest setup (__tests__/)

- packages/contracts
  - Types for inventory, product, order, purchase-order, and API index

- packages/db
  - Entities: inventory-level, inventory-transaction, goods-receipt

- packages/bdd
  - Features: authentication, inventory tracking, product and order management, reporting analytics

---

## Development Conventions

- TypeScript is the single source of truth for contracts. Avoid duplicating DTOs.
- Align UI, API, and DB to shared contracts where possible.
- Prefer runtime-safe validation (Zod) where applicable; some packages may stub this until integration.
- Keep Gherkin features authoritative for behavior; tests should track these scenarios.

---

## Scripts (root)

Common examples; check package.json files for authoritative scripts.
- pnpm install                 # install all workspace dependencies
- pnpm -r build                # build all packages/apps where applicable
- pnpm -r test                 # run tests across workspaces
- pnpm --filter <workspace> <script>  # run a script in a targeted workspace

---

## License

MIT
