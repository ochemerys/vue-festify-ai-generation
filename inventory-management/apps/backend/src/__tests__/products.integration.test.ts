import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest'
import Fastify, { FastifyInstance } from 'fastify'
import { productRoutes } from '../routes/products.js'
import { prisma } from '@inventory/db'
import './setup.js'

describe('Product API Integration Tests', () => {
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

  describe('POST /api/products', () => {
    it('should create a new product successfully (201)', async () => {
      // Mock Prisma responses
      vi.mocked(prisma.product.findUnique).mockResolvedValue(null)
      vi.mocked(prisma.product.create).mockResolvedValue({
        id: 'prod-123',
        sku: 'PROD-001',
        name: 'Wireless Mouse',
        description: 'Ergonomic wireless mouse',
        category: 'Electronics',
        price: 29.99,
        cost: 12.50,
        reorderLevel: 10,
        supplier: 'Tech Supplies Inc',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      vi.mocked(prisma.inventoryLevel.create).mockResolvedValue({
        id: 'inv-123',
        productId: 'prod-123',
        currentQuantity: 0,
        reservedQuantity: 0,
        availableQuantity: 0,
        lastRestockDate: null,
        nextRestockDate: null,
        updatedAt: new Date(),
      })

      const response = await app.inject({
        method: 'POST',
        url: '/api/products',
        payload: {
          sku: 'PROD-001',
          name: 'Wireless Mouse',
          description: 'Ergonomic wireless mouse',
          category: 'Electronics',
          price: 29.99,
          cost: 12.50,
          reorderLevel: 10,
          supplier: 'Tech Supplies Inc',
        },
      })

      expect(response.statusCode).toBe(201)
      const body = JSON.parse(response.body)
      expect(body.success).toBe(true)
      expect(body.data.sku).toBe('PROD-001')
      expect(body.data.name).toBe('Wireless Mouse')
      expect(body.data.isActive).toBe(true)
    })

    it('should fail with duplicate SKU (409)', async () => {
      // Mock existing product
      vi.mocked(prisma.product.findUnique).mockResolvedValue({
        id: 'prod-123',
        sku: 'PROD-001',
        name: 'Existing Product',
        description: null,
        category: 'Electronics',
        price: 29.99,
        cost: 12.50,
        reorderLevel: 10,
        supplier: 'Tech Supplies Inc',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      const response = await app.inject({
        method: 'POST',
        url: '/api/products',
        payload: {
          sku: 'PROD-001',
          name: 'Different Product',
          category: 'Electronics',
          price: 19.99,
          cost: 10.00,
          supplier: 'Another Supplier',
        },
      })

      expect(response.statusCode).toBe(409)
      const body = JSON.parse(response.body)
      expect(body.success).toBe(false)
      expect(body.error).toContain('SKU already exists')
    })

    it('should fail with invalid data (400)', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/products',
        payload: {
          sku: 'PROD-001',
          name: 'Test Product',
          // Missing required fields
        },
      })

      expect(response.statusCode).toBe(400)
      const body = JSON.parse(response.body)
      expect(body.success).toBe(false)
    })

    it('should fail with negative price (400)', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/products',
        payload: {
          sku: 'PROD-001',
          name: 'Test Product',
          category: 'Electronics',
          price: -10.00,
          cost: 5.00,
          supplier: 'Test Supplier',
        },
      })

      expect(response.statusCode).toBe(400)
      const body = JSON.parse(response.body)
      expect(body.success).toBe(false)
    })
  })

  describe('GET /api/products', () => {
    it('should return list of active products (200)', async () => {
      // Mock products data
      const mockProducts = [
        {
          id: 'prod-1',
          sku: 'PROD-001',
          name: 'Wireless Mouse',
          description: 'Ergonomic wireless mouse',
          category: 'Electronics',
          price: 29.99,
          cost: 12.50,
          reorderLevel: 10,
          supplier: 'Tech Supplies Inc',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'prod-2',
          sku: 'PROD-002',
          name: 'USB-C Cable',
          description: 'High-speed USB-C charging cable',
          category: 'Electronics',
          price: 12.99,
          cost: 5.00,
          reorderLevel: 20,
          supplier: 'Tech Supplies Inc',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'prod-3',
          sku: 'PROD-003',
          name: 'Cotton T-Shirt',
          description: 'Comfortable cotton t-shirt',
          category: 'Clothing',
          price: 19.99,
          cost: 8.00,
          reorderLevel: 15,
          supplier: 'Fashion Wholesale',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      vi.mocked(prisma.product.findMany).mockResolvedValue(mockProducts)
      vi.mocked(prisma.product.count).mockResolvedValue(3)

      const response = await app.inject({
        method: 'GET',
        url: '/api/products',
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.success).toBe(true)
      expect(body.data).toHaveLength(3)
      expect(body.total).toBe(3)
    })

    it('should filter products by category', async () => {
      const mockProducts = [
        {
          id: 'prod-1',
          sku: 'PROD-001',
          name: 'Wireless Mouse',
          description: 'Ergonomic wireless mouse',
          category: 'Electronics',
          price: 29.99,
          cost: 12.50,
          reorderLevel: 10,
          supplier: 'Tech Supplies Inc',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'prod-2',
          sku: 'PROD-002',
          name: 'USB-C Cable',
          description: 'High-speed USB-C charging cable',
          category: 'Electronics',
          price: 12.99,
          cost: 5.00,
          reorderLevel: 20,
          supplier: 'Tech Supplies Inc',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      vi.mocked(prisma.product.findMany).mockResolvedValue(mockProducts)
      vi.mocked(prisma.product.count).mockResolvedValue(2)

      const response = await app.inject({
        method: 'GET',
        url: '/api/products?category=Electronics',
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.success).toBe(true)
      expect(body.data).toHaveLength(2)
      expect(body.data.every((p: any) => p.category === 'Electronics')).toBe(true)
    })

    it('should filter products by price range', async () => {
      const mockProducts = [
        {
          id: 'prod-1',
          sku: 'PROD-001',
          name: 'Wireless Mouse',
          description: 'Ergonomic wireless mouse',
          category: 'Electronics',
          price: 29.99,
          cost: 12.50,
          reorderLevel: 10,
          supplier: 'Tech Supplies Inc',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'prod-3',
          sku: 'PROD-003',
          name: 'Cotton T-Shirt',
          description: 'Comfortable cotton t-shirt',
          category: 'Clothing',
          price: 19.99,
          cost: 8.00,
          reorderLevel: 15,
          supplier: 'Fashion Wholesale',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      vi.mocked(prisma.product.findMany).mockResolvedValue(mockProducts)
      vi.mocked(prisma.product.count).mockResolvedValue(2)

      const response = await app.inject({
        method: 'GET',
        url: '/api/products?minPrice=15&maxPrice=30',
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.success).toBe(true)
      expect(body.data).toHaveLength(2)
      expect(body.data.every((p: any) => p.price >= 15 && p.price <= 30)).toBe(true)
    })

    it('should search products by name', async () => {
      const mockProducts = [
        {
          id: 'prod-1',
          sku: 'PROD-001',
          name: 'Wireless Mouse',
          description: 'Ergonomic wireless mouse',
          category: 'Electronics',
          price: 29.99,
          cost: 12.50,
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
      expect(body.data).toHaveLength(1)
      expect(body.data[0].name).toContain('Mouse')
    })
  })

  describe('GET /api/products/:id', () => {
    it('should return product by ID (200)', async () => {
      const mockProduct = {
        id: 'prod-123',
        sku: 'PROD-001',
        name: 'Wireless Mouse',
        description: 'Ergonomic wireless mouse',
        category: 'Electronics',
        price: 29.99,
        cost: 12.50,
        reorderLevel: 10,
        supplier: 'Tech Supplies Inc',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        inventoryLevels: {
          id: 'inv-123',
          productId: 'prod-123',
          currentQuantity: 10,
          reservedQuantity: 2,
          availableQuantity: 8,
          lastRestockDate: null,
          nextRestockDate: null,
          updatedAt: new Date(),
        },
      }

      vi.mocked(prisma.product.findUnique).mockResolvedValue(mockProduct)

      const response = await app.inject({
        method: 'GET',
        url: '/api/products/prod-123',
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.success).toBe(true)
      expect(body.data.id).toBe('prod-123')
      expect(body.data.inventoryLevels).toBeDefined()
    })

    it('should return 404 for non-existent product', async () => {
      vi.mocked(prisma.product.findUnique).mockResolvedValue(null)

      const response = await app.inject({
        method: 'GET',
        url: '/api/products/non_existent',
      })

      expect(response.statusCode).toBe(404)
      const body = JSON.parse(response.body)
      expect(body.success).toBe(false)
    })
  })

  describe('GET /api/products/sku/:sku', () => {
    it('should return product by SKU (200)', async () => {
      const mockProduct = {
        id: 'prod-123',
        sku: 'PROD-001',
        name: 'Wireless Mouse',
        description: 'Ergonomic wireless mouse',
        category: 'Electronics',
        price: 29.99,
        cost: 12.50,
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

    it('should return 404 for non-existent SKU', async () => {
      vi.mocked(prisma.product.findUnique).mockResolvedValue(null)

      const response = await app.inject({
        method: 'GET',
        url: '/api/products/sku/NON-EXISTENT',
      })

      expect(response.statusCode).toBe(404)
      const body = JSON.parse(response.body)
      expect(body.success).toBe(false)
    })
  })

  describe('PUT /api/products/:id', () => {
    it('should update product successfully (200)', async () => {
      const mockUpdatedProduct = {
        id: 'prod-123',
        sku: 'PROD-001',
        name: 'Wireless Mouse Pro',
        description: 'Ergonomic wireless mouse with enhanced features',
        category: 'Electronics',
        price: 34.99,
        cost: 12.50,
        reorderLevel: 10,
        supplier: 'Tech Supplies Inc',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      vi.mocked(prisma.product.update).mockResolvedValue(mockUpdatedProduct)

      const response = await app.inject({
        method: 'PUT',
        url: '/api/products/prod-123',
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

    it('should return 404 when updating non-existent product', async () => {
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
      const body = JSON.parse(response.body)
      expect(body.success).toBe(false)
    })
  })

  describe('PATCH /api/products/:id/deactivate', () => {
    it('should deactivate product successfully (200)', async () => {
      const mockDeactivatedProduct = {
        id: 'prod-123',
        sku: 'PROD-001',
        name: 'Wireless Mouse',
        description: 'Ergonomic wireless mouse',
        category: 'Electronics',
        price: 29.99,
        cost: 12.50,
        reorderLevel: 10,
        supplier: 'Tech Supplies Inc',
        isActive: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      vi.mocked(prisma.product.update).mockResolvedValue(mockDeactivatedProduct)

      const response = await app.inject({
        method: 'PATCH',
        url: '/api/products/prod-123/deactivate',
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.success).toBe(true)
      expect(body.data.isActive).toBe(false)
    })

    it('should return 404 when deactivating non-existent product', async () => {
      // Mock Prisma error for not found
      const error = new Error('Product not found')
      ;(error as any).code = 'P2025'
      vi.mocked(prisma.product.update).mockRejectedValue(error)

      const response = await app.inject({
        method: 'PATCH',
        url: '/api/products/non_existent/deactivate',
      })

      expect(response.statusCode).toBe(404)
      const body = JSON.parse(response.body)
      expect(body.success).toBe(false)
    })
  })

  describe('DELETE /api/products/:id', () => {
    it('should delete product successfully (204)', async () => {
      vi.mocked(prisma.product.delete).mockResolvedValue({} as any)

      const response = await app.inject({
        method: 'DELETE',
        url: '/api/products/prod-123',
      })

      expect(response.statusCode).toBe(204)
    })

    it('should return 404 when deleting non-existent product', async () => {
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