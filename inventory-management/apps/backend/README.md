# Inventory Management Backend

Fastify REST API server for the Inventory Management System.

## Features

- **RESTful API** - Full CRUD operations for products, orders, and inventory
- **Type Safety** - TypeScript with Zod schema validation
- **Database Integration** - PostgreSQL with TypeORM
- **Authentication Ready** - Session-based auth infrastructure
- **CORS Support** - Cross-origin resource sharing enabled
- **Input Validation** - Runtime validation with Zod schemas
- **Error Handling** - Structured error responses
- **Audit Logging** - Track all data changes

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Fastify
- **Language**: TypeScript
- **Database**: PostgreSQL + TypeORM
- **Validation**: Zod schemas from `@inventory/contracts`
- **Testing**: Vitest
- **Linting**: ESLint

## API Endpoints

### Health Check

- `GET /health` - Server health check

### Products

- `GET /api/products` - List products (with filtering/pagination)
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create new product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Deactivate product

### Orders

- `GET /api/orders` - List orders (with filtering)
- `GET /api/orders/:id` - Get order details
- `POST /api/orders` - Create new order
- `PUT /api/orders/:id/status` - Update order status

### Inventory

- `GET /api/inventory` - Get inventory levels
- `POST /api/inventory/transactions` - Record inventory transaction
- `GET /api/inventory/alerts` - Get low stock alerts

### Analytics

- `GET /api/analytics/summary` - Dashboard summary
- `GET /api/analytics/sales` - Sales reports

## Data Validation

All API endpoints use Zod schemas for runtime validation:

```typescript
import { CreateProductRequestSchema } from '@inventory/contracts'

app.post(
  '/api/products',
  {
    schema: {
      body: CreateProductRequestSchema,
    },
  },
  async (request, reply) => {
    // request.body is fully typed and validated
    const product = await createProduct(request.body)
    return reply.send(product)
  }
)
```

## Database Integration

Uses TypeORM with type-safe database operations:

```typescript
import { AppDataSource } from '@inventory/db'

const productRepository = AppDataSource.getRepository(Product)
const products = await productRepository.find({
  where: { isActive: true },
  relations: ['inventoryLevels'],
})
```

## Getting Started

### Development

```bash
pnpm dev
```

The server will start at `http://localhost:3000`

### Build

```bash
pnpm build
```

### Production

```bash
pnpm start
```

### Testing

```bash
pnpm test
pnpm test:watch
```

### Linting

```bash
pnpm lint
pnpm lint:fix
```

## Environment Variables

```bash
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/inventory_management
```

## Project Structure

```
apps/backend/
├── src/
│   ├── routes/           # API route handlers
│   ├── services/         # Business logic
│   ├── middleware/       # Custom middleware
│   ├── utils/           # Utility functions
│   └── server.ts        # Fastify server setup
├── package.json
├── tsconfig.json
└── README.md
```

## Error Handling

The API returns structured error responses:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "email",
      "message": "Invalid email format"
    }
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Contributing

1. Add new routes in `src/routes/`
2. Implement business logic in `src/services/`
3. Use Zod schemas from `@inventory/contracts` for validation
4. Add tests for new functionality
5. Update this README for new endpoints

## License

See LICENSE in the root directory.
