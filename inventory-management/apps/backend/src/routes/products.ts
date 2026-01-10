import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import {
  CreateProductRequestSchema,
  UpdateProductRequestSchema,
  ProductFiltersSchema
} from '@inventory/contracts'

interface ProductResponse {
  id: string
  sku: string
  name: string
  description?: string
  category: string
  supplier: string
  price: number
  cost?: number
  reorderLevel: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface ProductWithInventoryResponse extends ProductResponse {
  inventoryLevels: Array<{
    productId: string
    currentQuantity: number
    reservedQuantity: number
    availableQuantity: number
  }>
}

interface PaginatedProductsResponse {
  success: boolean
  data: ProductResponse[]
  total: number
  page: number
  pageSize: number
}

export async function productRoutes(app: FastifyInstance) {
  // Import entities inside the function to ensure reflect-metadata is loaded first
  const { AppDataSource, Product, InventoryLevel } = await import('@inventory/db')

  // GET /api/products - List all products with optional filters
  app.get('/api/products', {
    schema: {
      description: 'Get paginated list of products with optional filters',
      tags: ['Products'],
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'integer', minimum: 1, default: 1 },
          pageSize: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
          category: { type: 'string' },
          supplier: { type: 'string' },
          minPrice: { type: 'number', minimum: 0 },
          maxPrice: { type: 'number', minimum: 0 },
          search: { type: 'string' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  sku: { type: 'string' },
                  name: { type: 'string' },
                  description: { type: 'string' },
                  category: { type: 'string' },
                  supplier: { type: 'string' },
                  price: { type: 'number' },
                  cost: { type: 'number' },
                  reorderLevel: { type: 'integer' },
                  isActive: { type: 'boolean' },
                  createdAt: { type: 'string', format: 'date-time' },
                  updatedAt: { type: 'string', format: 'date-time' },
                },
              },
            },
            total: { type: 'integer' },
            page: { type: 'integer' },
            pageSize: { type: 'integer' },
          },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
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
      
      // TODO: Implement search functionality using QueryBuilder for complex OR queries
      // For now, search is not implemented
      
      // Only return active products by default
      where.isActive = true

      const productRepository = AppDataSource.getRepository(Product)
      const [products, total] = await Promise.all([
        productRepository.find({
          where,
          skip: (filters.page - 1) * filters.pageSize,
          take: filters.pageSize,
          order: { createdAt: 'DESC' },
        }),
        productRepository.count({ where }),
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
    {
      schema: {
        description: 'Get a single product by ID with inventory information',
        tags: ['Products'],
        params: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'Product ID' },
          },
          required: ['id'],
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  sku: { type: 'string' },
                  name: { type: 'string' },
                  description: { type: 'string' },
                  category: { type: 'string' },
                  supplier: { type: 'string' },
                  price: { type: 'number' },
                  cost: { type: 'number' },
                  reorderLevel: { type: 'integer' },
                  isActive: { type: 'boolean' },
                  createdAt: { type: 'string', format: 'date-time' },
                  updatedAt: { type: 'string', format: 'date-time' },
                  inventoryLevels: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        productId: { type: 'string' },
                        currentQuantity: { type: 'integer' },
                        reservedQuantity: { type: 'integer' },
                        availableQuantity: { type: 'integer' },
                      },
                    },
                  },
                },
              },
            },
          },
          404: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              error: { type: 'string' },
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const productRepository = AppDataSource.getRepository(Product)
        const product = await productRepository.findOne({
          where: { id: request.params.id },
          relations: ['inventoryLevels'],
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
        const productRepository = AppDataSource.getRepository(Product)
        const product = await productRepository.findOne({
          where: { sku: request.params.sku },
          relations: ['inventoryLevels'],
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
  app.post('/api/products', {
    schema: {
      description: 'Create a new product',
      tags: ['Products'],
      body: {
        type: 'object',
        properties: {
          sku: { type: 'string', description: 'Unique product SKU' },
          name: { type: 'string', description: 'Product name' },
          description: { type: 'string', description: 'Product description' },
          category: { type: 'string', description: 'Product category' },
          supplier: { type: 'string', description: 'Supplier name' },
          price: { type: 'number', minimum: 0, description: 'Selling price' },
          cost: { type: 'number', minimum: 0, description: 'Cost price' },
          reorderLevel: { type: 'integer', minimum: 0, description: 'Reorder level' },
        },
        required: ['sku', 'name', 'category', 'supplier', 'price', 'reorderLevel'],
      },
      response: {
        201: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                sku: { type: 'string' },
                name: { type: 'string' },
                description: { type: 'string' },
                category: { type: 'string' },
                supplier: { type: 'string' },
                price: { type: 'number' },
                cost: { type: 'number' },
                reorderLevel: { type: 'integer' },
                isActive: { type: 'boolean' },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' },
              },
            },
          },
        },
        409: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            error: { type: 'string' },
          },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const productData = CreateProductRequestSchema.parse(request.body)

      // Check for duplicate SKU
      const productRepository = AppDataSource.getRepository(Product)
      const existing = await productRepository.findOne({
        where: { sku: productData.sku },
      })

      if (existing) {
        reply.status(409)
        return { success: false, error: 'SKU already exists' }
      }

      const data: any = {
        sku: productData.sku,
        name: productData.name,
        category: productData.category,
        supplier: productData.supplier,
        price: productData.price,
        reorderLevel: productData.reorderLevel,
      }
      if (productData.description !== undefined) {
        data.description = productData.description
      }
      if (productData.cost !== undefined) {
        data.cost = productData.cost
      }
      const product = productRepository.create(data)
      await productRepository.save(product)

      // Create initial inventory level
      const inventoryRepository = AppDataSource.getRepository(InventoryLevel)
      const inventoryLevel = inventoryRepository.create({
        productId: product.id,
        currentQuantity: 0,
        reservedQuantity: 0,
        availableQuantity: 0,
      })
      await inventoryRepository.save(inventoryLevel)

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

        // Build update payload without undefined values
        const data: any = {}
        if (updateData.name !== undefined) data.name = updateData.name
        if (updateData.category !== undefined) data.category = updateData.category
        if (updateData.supplier !== undefined) data.supplier = updateData.supplier
        if (updateData.description !== undefined) data.description = updateData.description
        if (updateData.price !== undefined) data.price = updateData.price
        if (updateData.cost !== undefined) data.cost = updateData.cost
        if (updateData.reorderLevel !== undefined) data.reorderLevel = updateData.reorderLevel

        const productRepository = AppDataSource.getRepository(Product)
        await productRepository.update(request.params.id, data)
        const product = await productRepository.findOne({
          where: { id: request.params.id },
        })

        if (!product) {
          reply.status(404)
          return { success: false, error: 'Product not found' }
        }

        return { success: true, data: product }
      } catch (error) {
        if (error instanceof z.ZodError) {
          reply.status(400)
          return { success: false, error: 'Validation failed', details: error.issues }
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
        const productRepository = AppDataSource.getRepository(Product)
        await productRepository.update(request.params.id, { isActive: false })
        const product = await productRepository.findOne({
          where: { id: request.params.id },
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

  // DELETE /api/products/:id - Delete product
  app.delete<{ Params: { id: string } }>(
    '/api/products/:id',
    async (request, reply) => {
      try {
        const productRepository = AppDataSource.getRepository(Product)
        const result = await productRepository.delete(request.params.id)

        if (result.affected === 0) {
          reply.status(404)
          return { success: false, error: 'Product not found' }
        }

        reply.status(204)
      } catch (error) {
        reply.status(500)
        return { success: false, error: 'Internal server error' }
      }
    }
  )
}
