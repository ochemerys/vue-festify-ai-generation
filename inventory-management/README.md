# Inventory Management System

A full-stack inventory management system built with Vue 3, Fastify, and PostgreSQL.

## Tech Stack

- **Frontend**: Vue 3 + TypeScript + Tailwind CSS + Vite
- **Backend**: Node.js + Fastify + TypeScript
- **Database**: PostgreSQL + TypeORM
- **Contracts**: Zod schemas for type-safe API contracts
- **Testing**: Vitest for unit tests
- **Linting**: ESLint with TypeScript support
- **Formatting**: Prettier

## Project Structure

```
inventory-management/
├── apps/
│   ├── frontend/          # Vue 3 application
│   └── backend/           # Fastify API server
├── packages/
│   ├── contracts/         # Shared Zod schemas and types
│   ├── db/               # TypeORM database layer
│   └── bdd/              # Gherkin feature files
├── package.json          # Root package with workspace scripts
├── pnpm-workspace.yaml   # Workspace configuration
└── tsconfig.json         # Shared TypeScript configuration
```

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm
- Docker & Docker Compose (for running tests)
- PostgreSQL (for development)

### Installation

1. Clone the repository
2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Set up environment variables:

   ```bash
   cp .env.example .env
   # Edit .env with your database URL
   ```

4. Set up the database:

   ```bash
   pnpm -F @inventory/db migration:run
   pnpm -F @inventory/db db:seed
   ```

### Setting Up Tests (First Time After Clone)

After cloning the project, follow these steps to prepare the test environment:

```bash
# 1. Start the test database (runs on port 5433)
docker-compose -f docker-compose.test.yml up -d

# 2. Install dependencies (if not already done)
pnpm install

# 3. Run database migrations for test database
pnpm --filter @inventory/db migration:run

# 4. Run tests to verify setup
pnpm test
```

**Test Database Details:**
- Runs in Docker on port **5433** (separate from development database on 5432)
- Connection string: `postgresql://postgres:postgres@localhost:5433/inventory_test`
- Automatically isolated from production/development data

**Stopping the test database:**
```bash
docker-compose -f docker-compose.test.yml down
```

**Resetting the test database (clean slate):**
```bash
docker-compose -f docker-compose.test.yml down -v
docker-compose -f docker-compose.test.yml up -d
pnpm --filter @inventory/db migration:run
```

### Development

Start all services in development mode:

```bash
pnpm dev
```

This will start:

- Frontend at http://localhost:5173
- Backend at http://localhost:3000

### Building

Build all packages:

```bash
pnpm build
```

Start production server:

```bash
pnpm start
```

## Available Scripts

### Root Scripts

- `pnpm dev` - Start all services in development
- `pnpm build` - Build all packages
- `pnpm start` - Start production backend
- `pnpm test` - Run tests across all packages
- `pnpm test:watch` - Run tests in watch mode
- `pnpm lint` - Lint all packages
- `pnpm lint:fix` - Auto-fix linting issues
- `pnpm format` - Format code with Prettier
- `pnpm format:check` - Check code formatting

### Database Scripts

- `pnpm -F @inventory/db migration:run` - Run migrations
- `pnpm -F @inventory/db migration:create` - Create new migration
- `pnpm -F @inventory/db migration:revert` - Revert last migration
- `pnpm -F @inventory/db db:seed` - Seed database with sample data

### Package Scripts

Each package has its own scripts:

- `pnpm --filter frontend dev` - Start frontend dev server
- `pnpm --filter backend dev` - Start backend dev server
- `pnpm --filter @inventory/db db:seed` - Seed database

## Development Guidelines

### Code Quality

- Use TypeScript for all new code
- Follow ESLint rules
- Format code with Prettier
- Write tests for new features

### Architecture

- **Contracts First**: Define Zod schemas in `@inventory/contracts`
- **Type Safety**: Use inferred types from Zod schemas
- **Separation of Concerns**: Keep business logic in backend, UI in frontend
- **Database Abstraction**: Use TypeORM repositories through `@inventory/db`

### Testing

This project follows a **Gherkin-Driven TDD** approach with three distinct test layers:

1. **Unit Tests** - Pure functions, no I/O, no database
2. **Integration Tests** - API endpoints with real test database
3. **Acceptance Tests (BDD)** - Executable Gherkin scenarios

#### Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode (re-run on file changes)
pnpm test:watch

# Run specific test file
pnpm test apps/backend/src/__tests__/products.integration.test.ts

# Run tests matching a pattern
pnpm test -- --grep "should create product"

# Generate coverage report
pnpm test:coverage
```

#### Test Structure

- **Unit Tests**: `apps/backend/src/services/__tests__/*.unit.test.ts`
  - Pure functions with zero external dependencies
  - No database calls, no HTTP requests
  - Fast execution (< 1ms per test)

- **Integration Tests**: `apps/backend/src/routes/__tests__/*.integration.test.ts`
  - API endpoints with real test database
  - Validates HTTP status codes and response schemas
  - Tests database side effects

- **Contract Tests**: `packages/contracts/src/__tests__/*.contracts.test.ts`
  - Validates Zod schema parsing and validation
  - Tests data transformation logic

#### Test Helpers

The project provides test helpers for common operations:

```typescript
// Authentication
import { createAuthHeaders } from './__tests__/helpers/auth'
const headers = createAuthHeaders('ADMIN')

// Test data factories
import { createTestProduct, createTestOrder, cleanupTestData } from './__tests__/helpers/factories'
const product = await createTestProduct({ name: 'Test Product' })
await cleanupTestData() // Clean up after tests
```

#### Best Practices

- Use **Arrange-Act-Assert** pattern for test structure
- Write **descriptive test names** that explain what is being tested
- Test both **happy paths** and **error scenarios**
- Use **test-specific identifiers** (TEST- prefix) for easy cleanup
- **Clean up test data** after each test with `beforeEach` and `afterEach`
- Keep tests **isolated** - each test should be independent

#### Common Issues

| Issue | Solution |
|-------|----------|
| "Database not found" | Run `docker-compose -f docker-compose.test.yml up -d` |
| "Port 5433 already in use" | Run `docker-compose -f docker-compose.test.yml down` first |
| "Unauthorized" errors | Ensure you're using `createAuthHeaders()` in test requests |
| Slow tests | Check that cleanup is working properly with `cleanupTestData()` |

For detailed testing documentation, see [Testing Guide](../../_docs/testing-guide.md).

## API Documentation

### Authentication

The API uses session-based authentication. Include the session cookie in requests.

### Endpoints

#### Products

- `GET /api/products` - List products with filtering and pagination
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create new product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Deactivate product

#### Orders

- `GET /api/orders` - List orders with filtering
- `GET /api/orders/:id` - Get order details
- `POST /api/orders` - Create new order
- `PUT /api/orders/:id/status` - Update order status

#### Inventory

- `GET /api/inventory` - Get inventory levels
- `POST /api/inventory/transactions` - Record inventory transaction
- `GET /api/inventory/alerts` - Get low stock alerts

#### Analytics

- `GET /api/analytics/summary` - Get dashboard summary
- `GET /api/analytics/sales` - Get sales reports

## Contributing

1. Follow the established patterns
2. Write tests for new features
3. Ensure all linting passes
4. Format code before committing
5. Update documentation as needed

## License

ISC
