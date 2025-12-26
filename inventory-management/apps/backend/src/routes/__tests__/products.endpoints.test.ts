import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest'
import Fastify, { FastifyInstance } from 'fastify'
import { productRoutes } from '../products.js'
import { prisma } from '@inventory/db'
import './setup.js'

// Template for endpoint test coverage based on Gherkin scenarios

describe('Product API Endpoints - Full Coverage Template', () => {
  let app: FastifyInstance

  beforeAll(async () => {
    app = Fastify()
    await app.register(productRoutes)
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks()
  })

  describe('POST /api/products - Create Product', () => {
    describe('Happy Path', () => {
      it('should create product with all valid fields (201)', async () => {
        // Covers: "Create a new product" scenario
        const mockProduct = {
          id: 'prod_123',
          sku: 'PROD-001',
          name: 'Wireless Mouse',
          description: 'Ergonomic wireless mouse',
          category: 'Electronics',
          price: 29.99,
          cost: 12.5,
          reorderLevel: 10,
          supplier: 'Tech Supplies Inc',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        const mockInventoryLevel = {
          id: 'inv_123',
          productId: 'prod_123',
          currentQuantity: 0,
          reservedQuantity: 0,
          availableQuantity: 0,
          lastRestockDate: null,
          nextRestockDate: null,
          updatedAt: new Date(),
        }

        vi.mocked(prisma.product.findUnique).mockResolvedValue(null)
        vi.mocked(prisma.product.create).mockResolvedValue(mockProduct)
        vi.mocked(prisma.inventoryLevel.create).mockResolvedValue(mockInventoryLevel)

        const response = await app.inject({
          method: 'POST',
          url: '/api/products',
          payload: {
            sku: 'PROD-001',
            name: 'Wireless Mouse',
            description: 'Ergonomic wireless mouse',
            category: 'Electronics',
            price: 29.99,
            cost: 12.5,
            supplier: 'Tech Supplies Inc',
            reorderLevel: 10,
          },
        })

        expect(response.statusCode).toBe(201)
        const body = JSON.parse(response.body)
        expect(body.success).toBe(true)
        expect(body.data.sku).toBe('PROD-001')
        expect(body.data.isActive).toBe(true)
      })
    })

    describe('Validation Errors (400)', () => {
      it('should reject missing required fields', async () => {
        const response = await app.inject({
          method: 'POST',
          url: '/api/products',
          payload: {
            sku: 'PROD-001',
            name: 'Test Product',
            // Missing category, price, cost, supplier
          },
        })

        expect(response.statusCode).toBe(400)
        const body = JSON.parse(response.body)
        expect(body.success).toBe(false)
      })

      it('should reject negative price', async () => {
        const response = await app.inject({
          method: 'POST',
          url: '/api/products',
          payload: {
            sku: 'PROD-001',
            name: 'Test Product',
            category: 'Electronics',
            price: -10.0,
            cost: 5.0,
            supplier: 'Test Supplier',
          },
        })

        expect(response.statusCode).toBe(400)
      })

      it('should reject empty SKU', async () => {
        const response = await app.inject({
          method: 'POST',
          url: '/api/products',
          payload: {
            sku: '',
            name: 'Test Product',
            category: 'Electronics',
            price: 29.99,
            cost: 12.5,
            supplier: 'Test Supplier',
          },
        })

        expect(response.statusCode).toBe(400)
      })

      it('should reject SKU too long', async () => {
        const response = await app.inject({
          method: 'POST',
          url: '/api/products',
          payload: {
            sku: 'A'.repeat(51), // Max 50 chars
            name: 'Test Product',
            category: 'Electronics',
            price: 29.99,
            cost: 12.5,
            supplier: 'Test Supplier',
          },
        })

        expect(response.statusCode).toBe(400)
      })
    })

    describe('Conflict Errors (409)', () => {
      it('should reject duplicate SKU', async () => {
        const existingProduct = {
          id: 'prod_123',
          sku: 'PROD-001',
          name: 'Existing Product',
          description: null,
          category: 'Electronics',
          price: 29.99,
          cost: 12.5,
          reorderLevel: 10,
          supplier: 'Tech Supplies Inc',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        vi.mocked(prisma.product.findUnique).mockResolvedValue(existingProduct)

        const response = await app.inject({
          method: 'POST',
          url: '/api/products',
          payload: {
            sku: 'PROD-001',
            name: 'Different Product',
            category: 'Electronics',
            price: 19.99,
            cost: 10.0,
            supplier: 'Another Supplier',
          },
        })

        expect(response.statusCode).toBe(409)
        const body = JSON.parse(response.body)
        expect(body.success).toBe(false)
        expect(body.error).toContain('SKU already exists')
      })
    })
  })

  describe('GET /api/products - List Products', () => {
    describe('Happy Path', () => {
      it('should return active products (200)', async () => {
        // Covers: "List all active products" scenario
        const mockProducts = [
          {
            id: 'prod_1',
            sku: 'PROD-001',
            name: 'Wireless Mouse',
            description: null,
            category: 'Electronics',
            price: 29.99,
            cost: 12.5,
            reorderLevel: 10,
            supplier: 'Tech Supplies Inc',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ]

        vi.mocked(prisma.product.findMany).mockResolvedValue(mockProducts)
        vi.mocked(prisma.product.count).mockResolvedValue(1)

        const response = await app.inject({
          method: 'GET',
          url: '/api/products',
        })

        expect(response.statusCode).toBe(200)
        const body = JSON.parse(response.body)
        expect(body.success).toBe(true)
        expect(Array.isArray(body.data)).toBe(true)
        expect(typeof body.total).toBe('number')
      })
    })

    describe('Filtering', () => {
      it('should filter by category', async () => {
        // Covers: "Filter products by category" scenario
        const mockProducts = [
          {
            id: 'prod_1',
            sku: 'PROD-001',
            name: 'Wireless Mouse',
            description: null,
            category: 'Electronics',
            price: 29.99,
            cost: 12.5,
            reorderLevel: 10,
            supplier: 'Tech Supplies Inc',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ]

        vi.mocked(prisma.product.findMany).mockResolvedValue(mockProducts)
        vi.mocked(prisma.product.count).mockResolvedValue(1)

        const response = await app.inject({
          method: 'GET',
          url: '/api/products?category=Electronics',
        })

        expect(response.statusCode).toBe(200)
        const body = JSON.parse(response.body)
        expect(body.success).toBe(true)
        expect(body.data.every((p: any) => p.category === 'Electronics')).toBe(true)
      })

      it('should filter by price range', async () => {
        // Covers: "Filter products by price range" scenario
        const mockProducts = [
          {
            id: 'prod_1',
            sku: 'PROD-001',
            name: 'Wireless Mouse',
            description: null,
            category: 'Electronics',
            price: 29.99,
            cost: 12.5,
            reorderLevel: 10,
            supplier: 'Tech Supplies Inc',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ]

        vi.mocked(prisma.product.findMany).mockResolvedValue(mockProducts)
        vi.mocked(prisma.product.count).mockResolvedValue(1)

        const response = await app.inject({
          method: 'GET',
          url: '/api/products?minPrice=15&maxPrice=30',
        })

        expect(response.statusCode).toBe(200)
        const body = JSON.parse(response.body)
        expect(body.success).toBe(true)
        expect(body.data.every((p: any) => p.price >= 15 && p.price <= 30)).toBe(true)
      })

      it('should search by name', async () => {
        // Covers: "Search products by name" scenario
        const mockProducts = [
          {
            id: 'prod_1',
            sku: 'PROD-001',
            name: 'Wireless Mouse',
            description: null,
            category: 'Electronics',
            price: 29.99,
            cost: 12.5,
            reorderLevel: 10,
            supplier: 'Tech Supplies Inc',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ]

        vi.mocked(prisma.product.findMany).mockResolvedValue(mockProducts)
        vi.mocked(prisma.product.count).mockResolvedValue(1)

        const response = await app.inject({
          method: 'GET',
          url: '/api/products?search=Mouse',
        })

        expect(response.statusCode).toBe(200)
        const body = JSON.parse(response.body)
        expect(body.success).toBe(true)
        expect(
          body.data.every(
            (p: any) =>
              p.name.toLowerCase().includes('mouse') ||
              p.description?.toLowerCase().includes('mouse') ||
              p.sku.toLowerCase().includes('mouse')
          )
        ).toBe(true)
      })
    })

    describe('Pagination', () => {
      it('should support pagination', async () => {
        vi.mocked(prisma.product.findMany).mockResolvedValue([])
        vi.mocked(prisma.product.count).mockResolvedValue(0)

        const response = await app.inject({
          method: 'GET',
          url: '/api/products?page=1&pageSize=10',
        })

        expect(response.statusCode).toBe(200)
        const body = JSON.parse(response.body)
        expect(body.success).toBe(true)
        expect(body.page).toBe(1)
        expect(body.pageSize).toBe(10)
      })

      it('should reject invalid pagination params (400)', async () => {
        const response = await app.inject({
          method: 'GET',
          url: '/api/products?page=0&pageSize=-1',
        })

        expect(response.statusCode).toBe(400)
      })
    })
  })

  describe('GET /api/products/:id - Get Product by ID', () => {
    describe('Happy Path', () => {
      it('should return product with inventory levels (200)', async () => {
        // Create product first, then get it
        const mockProduct = {
          id: 'prod_123',
          sku: 'PROD-001',
          name: 'Wireless Mouse',
          description: null,
          category: 'Electronics',
          price: 29.99,
          cost: 12.5,
          reorderLevel: 10,
          supplier: 'Tech Supplies Inc',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          inventoryLevels: {
            id: 'inv_123',
            productId: 'prod_123',
            currentQuantity: 50,
            reservedQuantity: 10,
            availableQuantity: 40,
            lastRestockDate: null,
            nextRestockDate: null,
            updatedAt: new Date(),
          },
        }

        vi.mocked(prisma.product.findUnique).mockResolvedValue(mockProduct)

        const response = await app.inject({
          method: 'GET',
          url: '/api/products/prod_123',
        })

        expect(response.statusCode).toBe(200)
        const body = JSON.parse(response.body)
        expect(body.success).toBe(true)
        expect(body.data.id).toBe('prod_123')
        expect(body.data.inventoryLevels).toBeDefined()
      })
    })

    describe('Not Found (404)', () => {
      it('should return 404 for non-existent product', async () => {
        vi.mocked(prisma.product.findUnique).mockResolvedValue(null)

        const response = await app.inject({
          method: 'GET',
          url: '/api/products/non_existent_id',
        })

        expect(response.statusCode).toBe(404)
        const body = JSON.parse(response.body)
        expect(body.success).toBe(false)
        expect(body.error).toContain('Product not found')
      })
    })
  })

  describe('GET /api/products/sku/:sku - Get Product by SKU', () => {
    describe('Happy Path', () => {
      it('should return product by SKU (200)', async () => {
        // Covers: "Retrieve product by SKU" scenario
        const mockProduct = {
          id: 'prod_123',
          sku: 'PROD-001',
          name: 'Wireless Mouse',
          description: null,
          category: 'Electronics',
          price: 29.99,
          cost: 12.5,
          reorderLevel: 10,
          supplier: 'Tech Supplies Inc',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          inventoryLevels: null,
        }

        vi.mocked(prisma.product.findUnique).mockResolvedValue(mockProduct)

        const response = await app.inject({
          method: 'GET',
          url: '/api/products/sku/PROD-001',
        })

        expect(response.statusCode).toBe(200)
        const body = JSON.parse(response.body)
        expect(body.success).toBe(true)
        expect(body.data.sku).toBe('PROD-001')
      })
    })

    describe('Not Found (404)', () => {
      it('should return 404 for non-existent SKU', async () => {
        vi.mocked(prisma.product.findUnique).mockResolvedValue(null)

        const response = await app.inject({
          method: 'GET',
          url: '/api/products/sku/NON-EXISTENT',
        })

        expect(response.statusCode).toBe(404)
      })
    })
  })

  describe('PUT /api/products/:id - Update Product', () => {
    describe('Happy Path', () => {
      it('should update product successfully (200)', async () => {
        // Covers: "Update product details" scenario
        const mockUpdatedProduct = {
          id: 'prod_123',
          sku: 'PROD-001',
          name: 'Wireless Mouse Pro',
          description: null,
          category: 'Electronics',
          price: 34.99,
          cost: 12.5,
          reorderLevel: 10,
          supplier: 'Tech Supplies Inc',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        vi.mocked(prisma.product.update).mockResolvedValue(mockUpdatedProduct)

        const response = await app.inject({
          method: 'PUT',
          url: '/api/products/prod_123',
          payload: {
            name: 'Wireless Mouse Pro',
            price: 34.99,
          },
        })

        expect(response.statusCode).toBe(200)
        const body = JSON.parse(response.body)
        expect(body.success).toBe(true)
        expect(body.data.name).toBe('Wireless Mouse Pro')
        expect(body.data.price).toBe(34.99)
      })
    })

    describe('Validation Errors (400)', () => {
      it('should reject invalid update data', async () => {
        const response = await app.inject({
          method: 'PUT',
          url: '/api/products/prod_123',
          payload: {
            price: -10.0, // Invalid negative price
          },
        })

        expect(response.statusCode).toBe(400)
      })
    })

    describe('Not Found (404)', () => {
      it('should return 404 for non-existent product', async () => {
        // Mock Prisma error for not found
        const error = new Error('Product not found')
        ;(error as any).code = 'P2025'
        vi.mocked(prisma.product.update).mockRejectedValue(error)

        const response = await app.inject({
          method: 'PUT',
          url: '/api/products/non_existent',
          payload: {
            name: 'Updated Name',
          },
        })

        expect(response.statusCode).toBe(404)
      })
    })
  })

  describe('PATCH /api/products/:id/deactivate - Deactivate Product', () => {
    describe('Happy Path', () => {
      it('should deactivate product successfully (200)', async () => {
        // Covers: "Deactivate a product" scenario
        const mockDeactivatedProduct = {
          id: 'prod_123',
          sku: 'PROD-001',
          name: 'Wireless Mouse',
          description: null,
          category: 'Electronics',
          price: 29.99,
          cost: 12.5,
          reorderLevel: 10,
          supplier: 'Tech Supplies Inc',
          isActive: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        vi.mocked(prisma.product.update).mockResolvedValue(mockDeactivatedProduct)

        const response = await app.inject({
          method: 'PATCH',
          url: '/api/products/prod_123/deactivate',
        })

        expect(response.statusCode).toBe(200)
        const body = JSON.parse(response.body)
        expect(body.success).toBe(true)
        expect(body.data.isActive).toBe(false)
      })
    })

    describe('Not Found (404)', () => {
      it('should return 404 for non-existent product', async () => {
        // Mock Prisma error for not found
        const error = new Error('Product not found')
        ;(error as any).code = 'P2025'
        vi.mocked(prisma.product.update).mockRejectedValue(error)

        const response = await app.inject({
          method: 'PATCH',
          url: '/api/products/non_existent/deactivate',
        })

        expect(response.statusCode).toBe(404)
      })
    })
  })

  describe('DELETE /api/products/:id - Delete Product', () => {
    describe('Happy Path', () => {
      it('should delete product successfully (204)', async () => {
        vi.mocked(prisma.product.delete).mockResolvedValue({} as any)

        const response = await app.inject({
          method: 'DELETE',
          url: '/api/products/prod_123',
        })

        expect(response.statusCode).toBe(204)
      })
    })

    describe('Not Found (404)', () => {
      it('should return 404 for non-existent product', async () => {
        // Mock Prisma error for not found
        const error = new Error('Product not found')
        ;(error as any).code = 'P2025'
        vi.mocked(prisma.product.delete).mockRejectedValue(error)

        const response = await app.inject({
          method: 'DELETE',
          url: '/api/products/non_existent',
        })

        expect(response.statusCode).toBe(404)
        const body = JSON.parse(response.body)
        expect(body.success).toBe(false)
      })
    })
  })
})
