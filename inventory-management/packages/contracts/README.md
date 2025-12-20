# @inventory/contracts

Shared type contracts and interfaces for the Inventory Management System monorepo.

## Overview

This package contains all TypeScript type definitions and contracts that are shared between the frontend and backend applications. It serves as the single source of truth for API contracts, ensuring type safety across the entire system.

## Structure

```
src/
├── product.ts      # Product-related types and interfaces
├── inventory.ts    # Inventory transaction and level types
├── order.ts        # Order and order item types
├── api.ts          # API response and error types
└── index.ts        # Main export file
```

## Usage

### In Frontend (Vue 3)

```typescript
import { Product, Order, OrderStatus } from '@inventory/contracts'

// Use types in your components
const product: Product = {
  id: '1',
  sku: 'SKU-001',
  name: 'Product Name',
  // ... other properties
}

const order: Order = {
  id: '1',
  status: OrderStatus.PENDING,
  // ... other properties
}
```

### In Backend (Node.js/Fastify)

```typescript
import { 
  CreateProductRequest, 
  ProductResponse,
  ApiResponse 
} from '@inventory/contracts'

// Use types in your route handlers
app.post<{ Body: CreateProductRequest }>('/products', async (request, reply) => {
  const response: ApiResponse<Product> = {
    success: true,
    data: product,
    timestamp: new Date().toISOString()
  }
  return reply.send(response)
})
```

## Key Contracts

### Product Management
- `Product` - Product entity
- `CreateProductRequest` - Request to create a product
- `UpdateProductRequest` - Request to update a product
- `ProductFilters` - Filtering options for product queries

### Inventory Management
- `InventoryTransaction` - Transaction record
- `InventoryLevel` - Current inventory levels
- `InventoryTransactionType` - Enum for transaction types
- `LowStockAlert` - Alert for low stock items

### Order Management
- `Order` - Order entity
- `OrderItem` - Individual order item
- `OrderStatus` - Enum for order statuses
- `CreateOrderRequest` - Request to create an order

### API Utilities
- `ApiResponse<T>` - Standard API response wrapper
- `PaginatedResponse<T>` - Paginated API response
- `ApiError` - Error response structure
- `ApiErrorCode` - Enum for error codes

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

1. **Keep contracts stable** - Once published, avoid breaking changes
2. **Use enums for fixed values** - Use enums for status, types, etc.
3. **Document complex types** - Add JSDoc comments for clarity
4. **Version carefully** - Follow semantic versioning
5. **Test integration** - Ensure frontend and backend use contracts consistently

## Contributing

When adding new contracts:

1. Create a new file in `src/` for the domain (e.g., `src/warehouse.ts`)
2. Export types from `src/index.ts`
3. Update this README with the new contracts
4. Run `pnpm run build` to generate types
5. Update dependent packages to use the new contracts
