import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { 
  CreateProductRequestSchema, 
  UpdateProductRequestSchema,
  ProductFiltersSchema 
} from '@inventory/contracts'
import { prisma } from '@inventory/db'

export async function productRoutes(app: FastifyInstance) {
  // GET /api/products - List all products with optional filters
  app.get('/api/products', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const query = request.query as any
      const page = query.page ? parseInt(query.page) : 1
      const pageSize = query.pageSize ? parseInt(query.pageSize) : 10

      // Validate pagination parameters
      if (page < 1 || pageSize < 1) {
        reply.status(400)
        return { success: false, error: 'Invalid pagination parameters' }
      }

      const filters = {
        category: query.category,
        supplier: query.supplier,
        minPrice: query.minPrice ? parseFloat(query.minPrice) : undefined,
        maxPrice: query.maxPrice ? parseFloat(query.maxPrice) : undefined,
        search: query.search,
        page,
        pageSize,
      }
      
      const where: any = {}
      
      if (filters.category) {
        where.category = filters.category
      }
      
      if (filters.supplier) {
        where.supplier = filters.supplier
      }
      
      if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
        where.price = {}
        if (filters.minPrice !== undefined) {
          where.price.gte = filters.minPrice
        }
        if (filters.maxPrice !== undefined) {
          where.price.lte = filters.maxPrice
        }
      }
      
      if (filters.search) {
        where.OR = [
          { name: { contains: filters.search, mode: 'insensitive' } },
          { description: { contains: filters.search, mode: 'insensitive' } },
          { sku: { contains: filters.search, mode: 'insensitive' } },
        ]
      }
      
      // Only return active products by default
      where.isActive = true
      
      const [products, total] = await Promise.all([
        prisma.product.findMany({
          where,
          skip: (filters.page - 1) * filters.pageSize,
          take: filters.pageSize,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.product.count({ where }),
      ])
      
      return {
        success: true,
        data: products,
        total,
        page: filters.page,
        pageSize: filters.pageSize,
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        reply.status(400)
        return { success: false, error: 'Invalid query parameters', details: error.issues }
      }
      reply.status(500)
      return { success: false, error: 'Internal server error' }
    }
  })

  // GET /api/products/:id - Get product by ID
  app.get<{ Params: { id: string } }>(
    '/api/products/:id',
    async (request, reply) => {
      try {
        const product = await prisma.product.findUnique({
          where: { id: request.params.id },
          include: {
            inventoryLevels: true,
          },
        })

        if (!product) {
          reply.status(404)
          return { success: false, error: 'Product not found' }
        }

        return { success: true, data: product }
      } catch (error) {
        reply.status(500)
        return { success: false, error: 'Internal server error' }
      }
    }
  )

  // GET /api/products/sku/:sku - Get product by SKU
  app.get<{ Params: { sku: string } }>(
    '/api/products/sku/:sku',
    async (request, reply) => {
      try {
        const product = await prisma.product.findUnique({
          where: { sku: request.params.sku },
          include: {
            inventoryLevels: true,
          },
        })

        if (!product) {
          reply.status(404)
          return { success: false, error: 'Product not found' }
        }

        return { success: true, data: product }
      } catch (error) {
        reply.status(500)
        return { success: false, error: 'Internal server error' }
      }
    }
  )

  // POST /api/products - Create new product
  app.post('/api/products', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const productData = CreateProductRequestSchema.parse(request.body)

      // Check for duplicate SKU
      const existing = await prisma.product.findUnique({
        where: { sku: productData.sku },
      })

      if (existing) {
        reply.status(409)
        return { success: false, error: 'SKU already exists' }
      }

      const product = await prisma.product.create({
        data: productData,
      })

      // Create initial inventory level
      await prisma.inventoryLevel.create({
        data: {
          productId: product.id,
          currentQuantity: 0,
          reservedQuantity: 0,
          availableQuantity: 0,
        },
      })

      reply.status(201)
      return { success: true, data: product }
    } catch (error) {
      if (error instanceof z.ZodError) {
        reply.status(400)
        return { success: false, error: 'Validation failed', details: error.issues }
      }
      reply.status(500)
      return { success: false, error: 'Internal server error' }
    }
  })

  // PUT /api/products/:id - Update product
  app.put<{ Params: { id: string } }>(
    '/api/products/:id',
    async (request, reply) => {
      try {
        const updateData = UpdateProductRequestSchema.parse(request.body)

        const product = await prisma.product.update({
          where: { id: request.params.id },
          data: updateData,
        })

        return { success: true, data: product }
      } catch (error) {
        if (error instanceof z.ZodError) {
          reply.status(400)
          return { success: false, error: 'Validation failed', details: error.issues }
        }
        if ((error as any).code === 'P2025') {
          reply.status(404)
          return { success: false, error: 'Product not found' }
        }
        reply.status(500)
        return { success: false, error: 'Internal server error' }
      }
    }
  )

  // PATCH /api/products/:id/deactivate - Deactivate product
  app.patch<{ Params: { id: string } }>(
    '/api/products/:id/deactivate',
    async (request, reply) => {
      try {
        const product = await prisma.product.update({
          where: { id: request.params.id },
          data: { isActive: false },
        })

        return { success: true, data: product }
      } catch (error) {
        if ((error as any).code === 'P2025') {
          reply.status(404)
          return { success: false, error: 'Product not found' }
        }
        reply.status(500)
        return { success: false, error: 'Internal server error' }
      }
    }
  )

  // DELETE /api/products/:id - Delete product
  app.delete<{ Params: { id: string } }>(
    '/api/products/:id',
    async (request, reply) => {
      try {
        await prisma.product.delete({
          where: { id: request.params.id },
        })

        reply.status(204)
      } catch (error) {
        if ((error as any).code === 'P2025') {
          reply.status(404)
          return { success: false, error: 'Product not found' }
        }
        reply.status(500)
        return { success: false, error: 'Internal server error' }
      }
    }
  )
}
