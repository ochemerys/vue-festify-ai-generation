import Fastify from 'fastify'
import cors from '@fastify/cors'
import { authRoutes } from './routes/auth.js'
import { productRoutes } from './routes/products.js'
import { inventoryRoutes } from './routes/inventory.js'
import { orderRoutes } from './routes/orders.js'
import { purchaseOrderRoutes } from './routes/purchase-orders.js'
import { reportRoutes } from './routes/reports.js'

const app = Fastify({
  logger: true,
})

// Register CORS plugin
app.register(cors, {
  origin: true,
})

// Register route modules
await app.register(authRoutes)
await app.register(productRoutes)
await app.register(inventoryRoutes)
await app.register(orderRoutes)
await app.register(purchaseOrderRoutes)
await app.register(reportRoutes)

// Health check
app.get('/health', async (request, reply) => {
  return {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    uptime: process.uptime(),
  }
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
