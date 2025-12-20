# Inventory Management Backend

A simple Fastify API server for inventory management.

## Features

- RESTful API endpoints for CRUD operations on inventory items
- Input validation using Zod
- CORS support
- TypeScript support
- In-memory storage (can be replaced with a database)

## API Endpoints

### Items

- `GET /api/items` - Get all items
- `GET /api/items/:id` - Get a specific item
- `POST /api/items` - Create a new item
- `PUT /api/items/:id` - Update an item
- `DELETE /api/items/:id` - Delete an item

### Health Check

- `GET /health` - Server health check

## Item Schema

```json
{
  "id": 1,
  "name": "Laptop",
  "description": "Dell XPS 13",
  "quantity": 5,
  "price": 999.99
}
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

## Example Requests

### Get all items
```bash
curl http://localhost:3000/api/items
```

### Create an item
```bash
curl -X POST http://localhost:3000/api/items \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Monitor",
    "description": "4K Monitor",
    "quantity": 10,
    "price": 399.99
  }'
```

### Update an item
```bash
curl -X PUT http://localhost:3000/api/items/1 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Laptop",
    "description": "Dell XPS 15",
    "quantity": 3,
    "price": 1299.99
  }'
```

### Delete an item
```bash
curl -X DELETE http://localhost:3000/api/items/1
```
