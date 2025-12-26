# @inventory/db

Database layer for the Inventory Management System using Prisma ORM.

## Overview

This package contains the Prisma schema, migrations, and database utilities for the Inventory Management System. It provides a type-safe database interface for all backend services.

## Features

- **Prisma ORM** - Type-safe database access
- **PostgreSQL** - Robust relational database
- **Migrations** - Version-controlled schema changes
- **Seeding** - Sample data for development
- **Audit Logging** - Track all changes
- **Relationships** - Properly modeled entity relationships

## Schema Overview

### Core Entities

#### User Management

- `User` - System users with roles (ADMIN, MANAGER, STAFF, VIEWER)
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

Create a `.env` file in the root of the monorepo or in the `packages/db` directory:

```bash
cp prisma/.env.example .env
```

Update the `DATABASE_URL` with your PostgreSQL connection string:

```
DATABASE_URL="postgresql://user:password@localhost:5432/inventory_management"
```

**Prisma 7 Configuration:**

- The datasource URL is no longer defined in `schema.prisma`
- Connection URLs are configured in `prisma/prisma.config.ts` for Migrate
- The `DATABASE_URL` environment variable is read at runtime by Prisma
- PrismaClient automatically uses the configured connection

### Database Setup

#### Create Database if not exists

```bash
createdb org_inventory
```

#### Run Migrations

```bash
pnpm run db:migrate
```

Or push schema directly (development only):

```bash
pnpm run db:push
```

#### Seed Database

```bash
pnpm run db:seed
```

This will populate the database with sample data including:

- 3 users (admin, manager, staff)
- 3 categories
- 2 suppliers
- 4 products
- Inventory levels and transactions
- Sample orders and purchase orders

## Usage

### In Backend Services

```typescript
import { prisma } from '@inventory/db'

// Query products
const products = await prisma.product.findMany({
  where: { isActive: true },
  include: { inventoryLevels: true },
})

// Create order
const order = await prisma.order.create({
  data: {
    orderNumber: 'ORD-2024-001',
    customerId: 'CUST-001',
    customerName: 'John Doe',
    status: 'PENDING',
    totalAmount: 99.99,
    shippingAddress: '123 Main St',
    createdBy: userId,
    items: {
      create: [
        {
          productId: 'prod-1',
          quantity: 2,
          unitPrice: 49.99,
          subtotal: 99.98,
        },
      ],
    },
  },
  include: { items: true },
})

// Update inventory
await prisma.inventoryLevel.update({
  where: { productId: 'prod-1' },
  data: {
    currentQuantity: { increment: 10 },
    availableQuantity: { increment: 10 },
  },
})

// Create audit log
await prisma.auditLog.create({
  data: {
    userId: 'user-1',
    action: 'UPDATE',
    entity: 'Product',
    entityId: 'prod-1',
    changes: { price: 29.99 },
  },
})
```

### Type Safety

All database types are automatically generated and exported:

```typescript
import type { Product, Order, User } from '@inventory/db'

const product: Product = {
  id: '1',
  sku: 'SKU-001',
  name: 'Product Name',
  // ... other properties
}
```

## Common Tasks

### View Database

Open Prisma Studio:

```bash
pnpm run db:studio
```

### Create Migration

After modifying `schema.prisma`:

```bash
pnpm run db:migrate
```

### Reset Database (Development Only)

```bash
pnpm exec prisma migrate reset
```

### Generate Prisma Client

```bash
pnpm run db:generate
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
psql $DATABASE_URL -c "SELECT 1"
```

### Migration Conflicts

```bash
# Reset migrations (development only)
pnpm exec prisma migrate reset
```

### Type Generation Issues

```bash
# Regenerate Prisma client
pnpm run db:generate
```

## Performance Optimization

### Indexes

The schema includes indexes on:

- Foreign keys
- Frequently queried fields (status, dates, SKU)
- Filter fields (category, supplier)

### Query Optimization

```typescript
// ✅ Good: Only fetch needed relations
const orders = await prisma.order.findMany({
  include: { items: true },
  take: 10,
  skip: 0,
})

// ❌ Avoid: Fetching unnecessary relations
const orders = await prisma.order.findMany({
  include: { items: true, user: true, auditLogs: true },
})
```

## Contributing

When modifying the schema:

1. Update `prisma/schema.prisma`
2. Create a migration: `pnpm run db:migrate`
3. Update seed data if needed
4. Test with `pnpm run db:seed`
5. Commit migration files

## License

See LICENSE in the root directory.
