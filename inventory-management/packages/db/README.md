# @inventory/db

Database layer for the Inventory Management System using TypeORM.

## Overview

This package contains the TypeORM entities, migrations, data source configuration, and database utilities for the Inventory Management System. It provides a type-safe database interface for all backend services.

## Features

- **TypeORM** - Type-safe database access with decorators
- **PostgreSQL** - Robust relational database
- **Migrations** - Version-controlled schema changes
- **Seeding** - Sample data for development
- **Audit Logging** - Track all changes
- **Relationships** - Properly modeled entity relationships

## Schema Overview

### Core Entities

#### User Management

- `User` - System users with authentication
- Tracks user activity and audit logs

#### Product Management

- `Product` - Product catalog with pricing and supplier info
- `Category` - Product categories
- `Supplier` - Supplier information and contact details

#### Inventory Management

- `InventoryLevel` - Current stock levels and reservations
- `InventoryTransaction` - All stock movements (PURCHASE, SALE, ADJUSTMENT, RETURN, DAMAGE, TRANSFER)
- `StockAlert` - Low stock and out-of-stock alerts

#### Order Management

- `Order` - Customer orders
- `OrderItem` - Individual items in orders
- `OrderStatus` - PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED, RETURNED

#### Purchase Order Management

- `PurchaseOrder` - Orders to suppliers
- `PurchaseOrderItem` - Items in purchase orders
- `GoodsReceipt` - Goods receipt tracking
- `POStatus` - DRAFT, SUBMITTED, CONFIRMED, PARTIALLY_RECEIVED, RECEIVED, CANCELLED

#### Audit & Analytics

- `AuditLog` - Track all entity changes
- `DailyInventorySummary` - Daily inventory snapshots
- `SalesReport` - Sales analytics

## Setup

### Prerequisites

- Node.js 18+
- PostgreSQL 12+
- pnpm

### Installation

```bash
cd packages/db
pnpm install
```

### Environment Setup

Create a `.env` file in the root of the monorepo:

```bash
# Root .env file
DB_HOST="localhost"
DB_PORT="5432"
DB_USERNAME="root"
DB_PASSWORD="mysecretpassword"
DB_DATABASE="org_inventory"
```

### Database Setup

#### Start PostgreSQL

Ensure PostgreSQL is running. For Docker Compose:

```bash
docker-compose up -d
```

#### Create Database if not exists

```bash
createdb org_inventory
```

#### Run Migrations

```bash
pnpm -F @inventory/db migration:run
```

#### Seed Database

```bash
pnpm -F @inventory/db db:seed
```

This will populate the database with sample data including:

- Admin user (admin@example.com / password123)
- Sample products and inventory

## Usage

### In Backend Services

```typescript
import { AppDataSource } from '@inventory/db'

// Initialize the data source
await AppDataSource.initialize()

// Get repositories
const userRepository = AppDataSource.getRepository(User)
const productRepository = AppDataSource.getRepository(Product)

// Query users
const users = await userRepository.find({
  where: { email: 'admin@example.com' }
})

// Query products with relations
const products = await productRepository.find({
  relations: ['inventoryLevels'],
  where: { isActive: true }
})

// Create user
const user = userRepository.create({
  email: 'newuser@example.com',
  password: 'hashedpassword',
  firstName: 'John',
  lastName: 'Doe'
})
await userRepository.save(user)

// Transactions
await AppDataSource.transaction(async (manager) => {
  // Perform multiple operations in a transaction
  const order = manager.create(Order, {
    orderNumber: 'ORD-2024-001',
    customerName: 'John Doe',
    status: 'PENDING',
    totalAmount: 99.99
  })
  await manager.save(order)

  // Update inventory
  await manager.update(InventoryLevel, { productId: 'prod-1' }, {
    currentQuantity: () => 'currentQuantity + 10'
  })
})
```

### Type Safety

All entity types are defined with decorators:

```typescript
import { User, Product, Order } from '@inventory/db'

const user: User = {
  id: 'uuid',
  email: 'user@example.com',
  password: 'hashed',
  firstName: 'John',
  lastName: 'Doe'
}
```

## Common Tasks

### View Database

Connect to PostgreSQL directly:

```bash
psql postgresql://root:mysecretpassword@localhost:5432/org_inventory
```

### Create Migration

After modifying entities:

```bash
# Generate migration (if using TypeORM CLI)
typeorm migration:generate -d dist/data-source.js src/migrations/NewMigration

# Or manually create migration file
pnpm -F @inventory/db migration:create src/migrations/NewMigration
```

### Run Migrations

```bash
pnpm -F @inventory/db migration:run
```

### Revert Migration

```bash
pnpm -F @inventory/db migration:revert
```

### Reset Database (Development Only)

Drop and recreate the database, then run migrations and seed:

```bash
# Stop containers
docker-compose down -v

# Restart and run setup
docker-compose up -d
pnpm -F @inventory/db migration:run
pnpm -F @inventory/db db:seed
```

## Schema Relationships

```
User
├── InventoryTransaction (createdBy)
├── Order (createdBy)
└── AuditLog (userId)

Product
├── InventoryLevel (1:1)
├── InventoryTransaction (1:many)
├── OrderItem (1:many)
└── StockAlert (1:many)

Order
├── OrderItem (1:many)
├── User (createdBy)
└── AuditLog (orderId)

Supplier
└── PurchaseOrder (1:many)

PurchaseOrder
├── PurchaseOrderItem (1:many)
└── GoodsReceipt (1:many)
```

## Best Practices

1. **Always use transactions** for multi-step operations
2. **Include relations** only when needed to optimize queries
3. **Use pagination** for large result sets
4. **Create indexes** on frequently queried fields
5. **Log all changes** to AuditLog for compliance
6. **Validate data** before database operations
7. **Use enums** for fixed values (OrderStatus, UserRole, etc.)

## Troubleshooting

### Connection Issues

```bash
# Test connection
psql postgresql://root:mysecretpassword@localhost:5432/org_inventory -c "SELECT 1"
```

### Migration Issues

```bash
# Check migration status
psql postgresql://root:mysecretpassword@localhost:5432/org_inventory -c "SELECT * FROM migrations"

# Reset if needed (development only)
docker-compose down -v
docker-compose up -d
pnpm -F @inventory/db migration:run
```

### Type Issues

Ensure entities are properly decorated and imported.

## Performance Optimization

### Indexes

The entities include indexes on:

- Primary keys (automatic)
- Foreign keys (automatic)
- Unique constraints (email, SKU)
- Frequently queried fields

### Query Optimization

```typescript
// ✅ Good: Only fetch needed relations
const orders = await orderRepository.find({
  relations: ['items'],
  take: 10,
  skip: 0
})

// ❌ Avoid: Fetching unnecessary relations
const orders = await orderRepository.find({
  relations: ['items', 'user', 'auditLogs']
})
```

## Contributing

When modifying the schema:

1. Update entity files in `src/entities/`
2. Create a migration: `pnpm -F @inventory/db migration:create src/migrations/NewMigration`
3. Implement the migration up/down methods
4. Run migration: `pnpm -F @inventory/db migration:run`
5. Update seed data if needed
6. Test with `pnpm -F @inventory/db db:seed`
7. Commit migration files

## License

See LICENSE in the root directory.
