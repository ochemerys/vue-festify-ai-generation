import Fastify from 'fastify'
import cors from '@fastify/cors'
import { z } from 'zod'

const app = Fastify({
  logger: true,
})

// Register CORS plugin
app.register(cors, {
  origin: true,
})

// Validation schemas
const ItemSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  quantity: z.number().int().min(0),
  price: z.number().positive(),
})

type ItemInput = z.infer<typeof ItemSchema>

type Item = ItemInput & {
  id: number
}

// In-memory storage (replace with database later)
const items: Map<number, Item> = new Map([
  [1, { id: 1, name: 'Laptop', description: 'Dell XPS 13', quantity: 5, price: 999.99 }],
  [2, { id: 2, name: 'Mouse', description: 'Wireless Mouse', quantity: 50, price: 29.99 }],
  [3, { id: 3, name: 'Keyboard', description: 'Mechanical Keyboard', quantity: 30, price: 149.99 }],
])

let nextId = 4

// Routes

// GET all items
app.get('/api/items', async (request, reply) => {
  return Array.from(items.values())
})

// GET single item
app.get<{ Params: { id: string } }>('/api/items/:id', async (request, reply) => {
  const id = parseInt(request.params.id)
  const item = items.get(id)

  if (!item) {
    reply.status(404)
    return { error: 'Item not found' }
  }

  return item
})

// POST create item
app.post<{ Body: ItemInput }>('/api/items', async (request, reply) => {
  try {
    const validated = ItemSchema.parse(request.body)
    const newItem: Item = {
      id: nextId++,
      ...validated,
    }

    items.set(newItem.id, newItem)
    reply.status(201)
    return newItem
  } catch (error) {
    if (error instanceof z.ZodError) {
      reply.status(400)
      return { error: 'Validation failed', details: error.issues }
    }
    throw error
  }
})

// PUT update item
app.put<{ Params: { id: string }; Body: ItemInput }>('/api/items/:id', async (request, reply) => {
  const id = parseInt(request.params.id)

  if (!items.has(id)) {
    reply.status(404)
    return { error: 'Item not found' }
  }

  try {
    const validated = ItemSchema.parse(request.body)
    const updatedItem: Item = {
      id,
      ...validated,
    }

    items.set(id, updatedItem)
    return updatedItem
  } catch (error) {
    if (error instanceof z.ZodError) {
      reply.status(400)
      return { error: 'Validation failed', details: error.issues }
    }
    throw error
  }
})

// DELETE item
app.delete<{ Params: { id: string } }>('/api/items/:id', async (request, reply) => {
  const id = parseInt(request.params.id)

  if (!items.has(id)) {
    reply.status(404)
    return { error: 'Item not found' }
  }

  items.delete(id)
  reply.status(204)
})

// Health check
app.get('/health', async (request, reply) => {
  return { status: 'ok' }
})

// Start server
const start = async () => {
  try {
    await app.listen({ port: 3000, host: '0.0.0.0' })
    console.log('Server running at http://localhost:3000')
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

start()
