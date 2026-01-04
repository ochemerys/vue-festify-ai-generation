# Testing Guide - Inventory Management System

## Quick Start

### Prerequisites

- ✅ Node.js 18+
- ✅ pnpm installed
- ✅ Docker Desktop running
- ✅ Git (for cloning)

### Setup (First Time Only)

#### Windows

```cmd
cd inventory-management
scripts\test-setup.bat
```

#### Linux/Mac

```bash
cd inventory-management
chmod +x scripts/test-setup.sh
./scripts/test-setup.sh
```

#### Manual Setup

```bash
# 1. Start test database
docker-compose -f docker-compose.test.yml up -d

# 2. Wait for database to be ready (5-10 seconds)
docker exec inventory-test-db pg_isready -U postgres

# 3. Run migrations
pnpm --filter @inventory/db prisma migrate deploy

# 4. Verify setup
docker ps | grep inventory-test-db
```

### Running Tests

#### Backend Tests (Default)

```bash
pnpm test
```

This runs only the backend tests (recommended).

#### All Package Tests

```bash
pnpm test:all
```

This runs tests in all packages. Packages without tests will exit gracefully.

#### Watch Mode (Auto-rerun on changes)

```bash
pnpm test:watch
```

#### With Coverage Report

```bash
pnpm --filter backend test:coverage
```

#### Specific Test File

```bash
# Unit test
pnpm test apps/backend/src/services/__tests__/order.service.unit.test.ts

# Integration test
pnpm test apps/backend/src/__tests__/products.integration.test.ts
```

#### By Pattern

```bash
# All unit tests
pnpm test -- --grep "Unit Tests"

# All integration tests
pnpm test -- --grep "Integration Tests"

# Specific feature
pnpm test -- --grep "Product"
```

### Verify Everything Works

```bash
# 1. Check database is running
docker ps | grep inventory-test-db

# 2. Check database connection
docker exec inventory-test-db psql -U postgres -d inventory_test -c "SELECT 1"

# 3. Run a simple unit test
pnpm test apps/backend/src/services/__tests__/order.service.unit.test.ts

# 4. Run all tests
pnpm test
```

### Expected Output

#### Successful Test Run

```
✓ apps/backend/src/services/__tests__/order.service.unit.test.ts (50)
  ✓ Order Service - Unit Tests (50)
    ✓ calculateOrderTotal (9)
    ✓ calculateItemSubtotal (6)
    ✓ isValidOrderStatusTransition (11)
    ...

Test Files  1 passed (1)
     Tests  50 passed (50)
  Start at  10:30:00
  Duration  234ms
```

#### Failed Test (Example)

```
❌ apps/backend/src/__tests__/products.integration.test.ts
  ❌ Product API Integration Tests
    ❌ POST /api/products
      ❌ should create a new product successfully (201)
        
        AssertionError: expected 500 to equal 201
        
        Error: DATABASE_URL environment variable is not set
```

**Solution:** Run `scripts/test-setup.bat` (Windows) or `scripts/test-setup.sh` (Linux/Mac)

---

## Overview

This project follows a **Gherkin-Driven TDD** approach with three distinct test layers:

1. **Unit Tests** - Pure functions, no I/O, no database
2. **Integration Tests** - API endpoints with real database
3. **Acceptance Tests (BDD)** - Executable Gherkin scenarios

## Test Database

### Configuration

The test database runs in Docker on port **5433** (not 5432) to avoid conflicts with development database.

**Connection String:**
```
postgresql://postgres:postgres@localhost:5433/inventory_test
```

### Managing Test Database

```bash
# Start test database
docker-compose -f docker-compose.test.yml up -d

# Stop test database
docker-compose -f docker-compose.test.yml down

# Reset test database (clean slate)
docker-compose -f docker-compose.test.yml down -v
docker-compose -f docker-compose.test.yml up -d
pnpm --filter @inventory/db prisma migrate deploy

# View logs
docker-compose -f docker-compose.test.yml logs -f

# Access database shell
docker exec -it inventory-test-db psql -U postgres -d inventory_test
```

## Common Commands

```bash
# Start test database
docker-compose -f docker-compose.test.yml up -d

# Stop test database
docker-compose -f docker-compose.test.yml down

# Reset test database (clean slate)
docker-compose -f docker-compose.test.yml down -v
docker-compose -f docker-compose.test.yml up -d
pnpm --filter @inventory/db prisma migrate deploy

# View database logs
docker logs inventory-test-db

# Access database shell
docker exec -it inventory-test-db psql -U postgres -d inventory_test

# Check test coverage
pnpm test:coverage
open coverage/index.html  # Mac
start coverage/index.html # Windows
```

## Test Structure

```
apps/backend/src/
├── __tests__/
│   ├── env-setup.ts              # Environment setup (runs first)
│   ├── setup.ts                  # Test setup (database connection)
│   ├── helpers/
│   │   ├── auth.ts               # Auth helpers
│   │   └── factories.ts          # Test data factories
│   ├── inventory.test.ts         # Integration tests
│   ├── orders.integration.test.ts
│   └── products.integration.test.ts
│
├── services/__tests__/
│   └── order.service.unit.test.ts # Unit tests (no database)
│
└── routes/__tests__/
    └── products.endpoints.test.ts  # Endpoint tests
```

## Test Types

### Unit Tests (Fast, No Database)
- Location: `services/__tests__/*.unit.test.ts`
- Purpose: Test pure functions
- Speed: < 1ms per test
- Example: `order.service.unit.test.ts`

### Integration Tests (Slower, With Database)
- Location: `__tests__/*.integration.test.ts`
- Purpose: Test API endpoints with real database
- Speed: 100-500ms per test
- Example: `products.integration.test.ts`

### Contract Tests (Fast, No Database)
- Location: `packages/contracts/src/__tests__/*.test.ts`
- Purpose: Test Zod schemas
- Speed: < 1ms per test
- Example: `product.contracts.test.ts`

## Writing Tests

### Unit Tests

Unit tests validate pure functions with **zero external dependencies**.

**Location:** `apps/backend/src/services/__tests__/*.unit.test.ts`

**Example:**

```typescript
import { describe, it, expect } from 'vitest'
import { calculateOrderTotal } from '../order.service'

describe('Order Service - Unit Tests', () => {
  describe('calculateOrderTotal', () => {
    it('should calculate total for multiple items', () => {
      // Arrange
      const items = [
        { quantity: 2, unitPrice: 29.99 },
        { quantity: 1, unitPrice: 12.99 },
      ]

      // Act
      const total = calculateOrderTotal(items)

      // Assert
      expect(total).toBeCloseTo(72.97, 2)
    })
  })
})
```

**Rules:**
- ✅ Test pure functions only
- ✅ No async operations
- ✅ No database calls
- ✅ No HTTP requests
- ✅ Fast execution (< 1ms per test)
- ❌ No mocking needed

### Integration Tests

Integration tests validate API endpoints with **real database**.

**Location:** `apps/backend/src/routes/__tests__/*.integration.test.ts`

**Example:**

```typescript
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import Fastify, { FastifyInstance } from 'fastify'
import { productRoutes } from '../products'
import { prisma } from '@inventory/db'
import { createAuthHeaders, cleanupTestData } from '../../__tests__/helpers'

let app: FastifyInstance

beforeAll(async () => {
  app = Fastify()
  await app.register(productRoutes)
})

afterAll(async () => {
  await app.close()
  await prisma.$disconnect()
})

beforeEach(async () => {
  await cleanupTestData()
})

describe('Product API Integration Tests', () => {
  describe('POST /api/products', () => {
    it('should create a new product successfully (201)', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/products',
        headers: createAuthHeaders('ADMIN'),
        payload: {
          sku: 'TEST-001',
          name: 'Test Product',
          category: 'Electronics',
          price: 29.99,
          cost: 12.50,
          supplier: 'Test Supplier',
        },
      })

      expect(response.statusCode).toBe(201)
      const body = JSON.parse(response.body)
      expect(body.success).toBe(true)
      expect(body.data.sku).toBe('TEST-001')
    })
  })
})
```

**Rules:**
- ✅ Test HTTP endpoints
- ✅ Use real database
- ✅ Include authentication
- ✅ Test status codes (2xx, 4xx, 5xx)
- ✅ Validate response schemas
- ✅ Clean up test data
- ❌ No database mocking

### Contract Tests

Contract tests validate Zod schemas.

**Location:** `packages/contracts/src/__tests__/*.contracts.test.ts`

**Example:**

```typescript
import { describe, it, expect } from 'vitest'
import { CreateProductRequestSchema } from '../product'

describe('Product Contracts - Unit Tests', () => {
  describe('CreateProductRequestSchema', () => {
    it('should parse valid create request', () => {
      const validRequest = {
        sku: 'PROD-001',
        name: 'Wireless Mouse',
        category: 'Electronics',
        price: 29.99,
        cost: 12.50,
        supplier: 'Tech Supplies Inc',
      }

      const result = CreateProductRequestSchema.parse(validRequest)
      expect(result.sku).toBe('PROD-001')
    })

    it('should reject negative price', () => {
      const invalidRequest = {
        sku: 'PROD-001',
        name: 'Test Product',
        category: 'Electronics',
        price: -10.00,
        cost: 12.50,
        supplier: 'Test Supplier',
      }

      expect(() => CreateProductRequestSchema.parse(invalidRequest)).toThrow()
    })
  })
})
```

## Test Helpers

### Authentication

```typescript
import { createAuthHeaders, createTestUserWithAuth } from './__tests__/helpers/auth'

// Simple auth headers (no database)
const headers = createAuthHeaders('ADMIN')

// Create user in database and get auth
const { user, token, headers } = await createTestUserWithAuth('MANAGER')
```

### Test Data Factories

```typescript
import {
  createTestProduct,
  createTestOrder,
  createTestSupplier,
  setInventoryLevel,
  generateTestSKU,
} from './__tests__/helpers/factories'

// Create test product
const product = await createTestProduct({
  name: 'My Test Product',
  price: 29.99,
})

// Create test order
const order = await createTestOrder([product.id], {
  customerName: 'Test Customer',
})

// Set inventory level
await setInventoryLevel(product.id, {
  currentQuantity: 100,
  reservedQuantity: 20,
  availableQuantity: 80,
})

// Generate unique SKU
const sku = generateTestSKU('PROD')
```

### Cleanup

```typescript
import { cleanupTestData } from './__tests__/helpers/factories'

// Clean up all test data
await cleanupTestData()
```

All test data uses `TEST-` prefix for easy identification and cleanup.

## Best Practices

### 1. Test Isolation

Each test should be independent and not rely on other tests.

```typescript
beforeEach(async () => {
  // Clean up before each test
  await cleanupTestData()
})
```

### 2. Use Descriptive Names

```typescript
// ✅ Good
it('should return 404 when product does not exist', async () => {})

// ❌ Bad
it('test product not found', async () => {})
```

### 3. Arrange-Act-Assert Pattern

```typescript
it('should calculate order total correctly', () => {
  // Arrange
  const items = [
    { quantity: 2, unitPrice: 29.99 },
    { quantity: 1, unitPrice: 12.99 },
  ]

  // Act
  const total = calculateOrderTotal(items)

  // Assert
  expect(total).toBeCloseTo(72.97, 2)
})
```

### 4. Test Both Happy and Error Paths

```typescript
describe('POST /api/products', () => {
  it('should create product with valid data (201)', async () => {
    // Happy path
  })

  it('should reject duplicate SKU (409)', async () => {
    // Error path
  })

  it('should validate required fields (400)', async () => {
    // Validation error
  })
})
```

### 5. Use Test-Specific Identifiers

```typescript
import { generateTestId, generateTestSKU } from './__tests__/helpers/factories'

const testId = generateTestId() // Random 8-char ID
const sku = generateTestSKU('PROD') // TEST-PROD-{random}
```

### 6. Clean Up After Tests

```typescript
afterEach(async () => {
  await cleanupTestData()
})
```

## Troubleshooting

### Problem: "DATABASE_URL environment variable is not set"

**Solution:**
```bash
# Run setup script
scripts/test-setup.bat  # Windows
./scripts/test-setup.sh # Linux/Mac
```

### Problem: "Port 5433 already in use"

**Solution:**
```bash
# Stop existing container
docker-compose -f docker-compose.test.yml down

# Start fresh
docker-compose -f docker-compose.test.yml up -d
```

### Problem: "Cannot connect to database"

**Solution:**
```bash
# Check if database is running
docker ps | grep inventory-test-db

# Check database logs
docker logs inventory-test-db

# Restart database
docker-compose -f docker-compose.test.yml restart
```

### Problem: "Tests are slow"

**Causes:**
- Database not running locally
- Too many database operations
- Not using test data factories

**Solutions:**
```bash
# Ensure database is local
docker ps | grep inventory-test-db

# Use test factories
import { createTestProduct } from './__tests__/helpers/factories'
```

### Problem: "Foreign key constraint errors"

**Solution:**
```bash
# Reset database
docker-compose -f docker-compose.test.yml down -v
docker-compose -f docker-compose.test.yml up -d
pnpm --filter @inventory/db prisma migrate deploy
```

### Issue: Tests Fail with "Database not found"

**Solution:**
```bash
# Ensure test database is running
docker-compose -f docker-compose.test.yml up -d

# Run migrations
pnpm --filter @inventory/db prisma migrate deploy
```

### Issue: Tests Fail with "Port 5433 already in use"

**Solution:**
```bash
# Stop existing container
docker-compose -f docker-compose.test.yml down

# Start fresh
docker-compose -f docker-compose.test.yml up -d
```

### Issue: Tests Fail with "Unauthorized"

**Solution:**
```typescript
// Ensure you're using auth headers
const headers = createAuthHeaders('ADMIN')

const response = await app.inject({
  method: 'POST',
  url: '/api/products',
  headers, // Don't forget this!
  payload: productData,
})
```

### Issue: Tests Are Slow

**Causes:**
- Too many database operations
- Not cleaning up properly
- Running in parallel (should be serial)

**Solutions:**
```bash
# Ensure serial execution
# Check vitest.config.ts has singleFork: true

# Optimize cleanup
# Use cleanupTestData() instead of deleteMany for each table
```

### Issue: Foreign Key Constraint Errors

**Solution:**
```typescript
// Delete in correct order (children first, parents last)
await prisma.orderItem.deleteMany()
await prisma.order.deleteMany()
await prisma.inventoryLevel.deleteMany()
await prisma.product.deleteMany()
```

## Debugging Tests

### Run Single Test

```bash
pnpm test -- --grep "should create product"
```

### Enable Debug Logging

```typescript
import { prisma } from '@inventory/db'

// Log all Prisma queries
prisma.$on('query', (e) => {
  console.log('Query:', e.query)
  console.log('Params:', e.params)
  console.log('Duration:', e.duration, 'ms')
})
```

### Inspect Test Database

```bash
# Connect to test database
docker exec -it inventory-test-db psql -U postgres -d inventory_test

# List tables
\dt

# Query products
SELECT * FROM products WHERE sku LIKE 'TEST-%';

# Check inventory levels
SELECT p.sku, il.* FROM inventory_levels il
JOIN products p ON p.id = il."productId"
WHERE p.sku LIKE 'TEST-%';
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Test Suite

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15-alpine
        env:
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: inventory_test
        ports:
          - 5433:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install pnpm
        run: npm install -g pnpm
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Run migrations
        run: pnpm --filter @inventory/db prisma migrate deploy
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5433/inventory_test
      
      - name: Run tests
        run: pnpm test:coverage
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5433/inventory_test
          JWT_SECRET: test-jwt-secret
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
```

## Test Coverage Goals

| Layer | Target Coverage |
|-------|----------------|
| Unit Tests | 90%+ |
| Integration Tests | 80%+ |
| Overall | 85%+ |

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Fastify Testing](https://www.fastify.io/docs/latest/Guides/Testing/)
- [Prisma Testing](https://www.prisma.io/docs/guides/testing)
- [Zod Documentation](https://zod.dev/)

## Getting Help

If you encounter issues:

1. Check this guide
2. Review existing tests for examples
3. Check test output for error messages
4. Inspect test database state
5. Ask the team in #testing channel

---

**Status:** ✅ Ready to Use
**Last Updated:** 2024
**Maintainer:** Development Team
