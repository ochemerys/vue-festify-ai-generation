# @inventory/contracts

Shared Zod schemas and type contracts for the Inventory Management System monorepo.

## Overview

This package contains all Zod schemas and TypeScript type definitions that are shared between the frontend and backend applications. **Zod schemas are the canonical source of truth** for API contracts, ensuring runtime validation and type safety across the entire system.

## Key Principles

- **Zod First**: All contracts are defined as Zod schemas
- **Type Inference**: TypeScript types are inferred from Zod schemas using `z.infer<typeof Schema>`
- **Runtime Validation**: Schemas validate data at runtime, not just compile time
- **API Contracts**: Schemas define request/response structures for all endpoints

## Structure

```
src/
├── product.ts      # Product-related Zod schemas and types
├── inventory.ts    # Inventory transaction and level schemas
├── order.ts        # Order and order item schemas
├── api.ts          # API response, error, and utility schemas
└── index.ts        # Main export file
```

## Usage

### In Frontend (Vue 3)

```typescript
import { ProductSchema, CreateProductRequestSchema } from '@inventory/contracts'

// Use schemas for form validation
const form = useForm({
  schema: CreateProductRequestSchema,
  initialValues: {
    name: '',
    sku: '',
    price: 0,
  },
})

// Use inferred types
const product: z.infer<typeof ProductSchema> = {
  id: '1',
  sku: 'SKU-001',
  name: 'Product Name',
  // ... other properties
}
```

### In Backend (Node.js/Fastify)

```typescript
import { CreateProductRequestSchema, ProductResponseSchema } from '@inventory/contracts'

// Use schemas for route validation
app.post(
  '/api/products',
  {
    schema: {
      body: CreateProductRequestSchema,
      response: {
        201: ProductResponseSchema,
      },
    },
  },
  async (request, reply) => {
    // request.body is fully validated at runtime
    const product = await createProduct(request.body)
    return reply.code(201).send({ success: true, data: product })
  }
)
```

## Key Schemas

### Product Management

- `ProductSchema` - Complete product entity
- `CreateProductRequestSchema` - Request to create a product
- `UpdateProductRequestSchema` - Request to update a product
- `ProductFiltersSchema` - Filtering options for product queries
- `ProductResponseSchema` - Single product API response
- `ProductListResponseSchema` - Paginated product list response

### Inventory Management

- `InventoryTransactionSchema` - Transaction record
- `InventoryLevelSchema` - Current inventory levels
- `InventoryTransactionType` - Enum for transaction types (PURCHASE, SALE, ADJUSTMENT, etc.)
- `CreateTransactionRequestSchema` - Request to create a transaction
- `LowStockAlertSchema` - Alert for low stock items

### Order Management

- `OrderSchema` - Complete order entity
- `OrderItemSchema` - Individual order item
- `OrderStatus` - Enum for order statuses (PENDING, CONFIRMED, SHIPPED, etc.)
- `CreateOrderRequestSchema` - Request to create an order
- `UpdateOrderStatusRequestSchema` - Request to update order status

### API Utilities

- `ApiResponseSchema` - Generic API response wrapper
- `PaginatedResponseSchema` - Paginated API response
- `ApiErrorSchema` - Error response structure
- `ApiErrorCode` - Enum for error codes (VALIDATION_ERROR, NOT_FOUND, etc.)
- `ValidationErrorSchema` - Field-level validation error

## Schema Features

### Validation Rules

All schemas include comprehensive validation:

```typescript
// String validation with length constraints
sku: z.string().min(1).max(50)

// Number validation with positive constraints
price: z.number().positive()

// Email validation
email: z.string().email()

// Enum validation
status: z.enum(['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED'])

// Optional fields
description: z.string().max(1000).optional()

// Array validation with min items
items: z.array(OrderItemSchema).min(1)
```

### Type Inference

Types are automatically inferred from schemas:

```typescript
// This type is always in sync with the schema
type Product = z.infer<typeof ProductSchema>
type CreateProductRequest = z.infer<typeof CreateProductRequestSchema>
```

## Building

```bash
pnpm install
pnpm run build
```

## Development

Watch mode for development:

```bash
pnpm run dev
```

## Integration with Monorepo

This package is referenced in the workspace configuration and can be imported by other packages:

```json
{
  "dependencies": {
    "@inventory/contracts": "workspace:*"
  }
}
```

## Best Practices

1. **Keep schemas stable** - Once published, avoid breaking changes to existing schemas
2. **Use enums for fixed values** - Use Zod enums for status, types, and other fixed sets
3. **Validate at runtime** - Use schemas to validate all input/output data
4. **Document complex schemas** - Add comments for complex validation rules
5. **Version carefully** - Follow semantic versioning for schema changes
6. **Test validation** - Write tests to ensure schemas work as expected

## Schema Validation Examples

### Frontend Form Validation

```typescript
import { CreateProductRequestSchema } from '@inventory/contracts'

const validateProduct = (data: unknown) => {
  const result = CreateProductRequestSchema.safeParse(data)
  if (!result.success) {
    // Handle validation errors
    console.error(result.error.issues)
    return false
  }
  return result.data
}
```

### Backend API Validation

```typescript
import { CreateOrderRequestSchema } from '@inventory/contracts'

app.post('/api/orders', async (request, reply) => {
  const validation = CreateOrderRequestSchema.safeParse(request.body)

  if (!validation.success) {
    return reply.code(400).send({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid order data',
        details: validation.error.issues,
      },
    })
  }

  const order = await createOrder(validation.data)
  return reply.send({ success: true, data: order })
})
```

## Contributing

When adding new schemas:

1. Create or update files in `src/` for the domain (e.g., `src/warehouse.ts`)
2. Export schemas and types from `src/index.ts`
3. Add comprehensive validation rules
4. Update this README with the new schemas
5. Write tests for the new schemas
6. Update dependent packages to use the new contracts

## Migration from Interfaces

This package was previously implemented with TypeScript interfaces. The migration to Zod schemas provides:

- **Runtime validation** (not just compile-time)
- **OpenAPI generation** capabilities
- **Better error messages** for validation failures
- **Automatic type inference** from schemas
- **Consistent validation** across frontend and backend

## License

See LICENSE in the root directory.
