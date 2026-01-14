import 'reflect-metadata'
import Fastify from 'fastify'
import cors from '@fastify/cors'
import swagger from '@fastify/swagger'
import swaggerUi from '@fastify/swagger-ui'
import open from 'open'
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

// Register Swagger
await app.register(swagger, {
  openapi: {
    openapi: '3.0.0',
    info: {
      title: 'Inventory Management API',
      description: 'REST API for Inventory Management System',
      version: '1.0.0',
      contact: {
        name: 'API Support',
        email: 'support@example.com',
      },
      license: {
        name: 'MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT Bearer token for authentication',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication and authorization endpoints',
      },
      {
        name: 'Products',
        description: 'Product management endpoints',
      },
      {
        name: 'Inventory',
        description: 'Inventory level and transaction management',
      },
      {
        name: 'Orders',
        description: 'Sales order management',
      },
      {
        name: 'Purchase Orders',
        description: 'Purchase order and goods receipt management',
      },
      {
        name: 'Reports',
        description: 'Business reports and analytics',
      },
      {
        name: 'Users',
        description: 'User management endpoints',
      },
      {
        name: 'Health',
        description: 'System health and status',
      },
    ],
  },
})

await app.register(swaggerUi, {
  routePrefix: '/documentation',
  uiConfig: {
    docExpansion: 'full',
    deepLinking: false,
  },
  staticCSP: true,
  transformStaticCSP: (header) => header,
})

// Register route modules
await app.register(authRoutes)
await app.register(productRoutes)
await app.register(inventoryRoutes)
await app.register(orderRoutes)
await app.register(purchaseOrderRoutes)
await app.register(reportRoutes)

// Health check
app.get('/health', {
  schema: {
    description: 'Health check endpoint',
    tags: ['Health'],
    response: {
      200: {
        type: 'object',
        properties: {
          status: { type: 'string' },
          timestamp: { type: 'string', format: 'date-time' },
          version: { type: 'string' },
          uptime: { type: 'number' },
        },
      },
    },
  },
}, async (request, reply) => {
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
    console.log('API Documentation available at http://localhost:3000/documentation')

    // Auto-open Swagger UI in browser (only in development)
    if (process.env.NODE_ENV !== 'production') {
      try {
        await open('http://localhost:3000/documentation')
        console.log('Swagger UI opened in default browser')
      } catch (error) {
        console.log('Could not open browser automatically. Please visit http://localhost:3000/documentation')
      }
    }
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

start()
