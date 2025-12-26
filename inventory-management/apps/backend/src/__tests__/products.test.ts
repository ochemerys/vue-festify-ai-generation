import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import Fastify, { FastifyInstance } from 'fastify'
import { productRoutes } from '../routes/products.js'
import { prisma } from '@inventory/db'

describe('Product API', () => {
  let app: FastifyInstance

  beforeEach(async () => {
    app = Fastify()
    await app.register(productRoutes)
  })

  afterEach(async () => {
    await app.close()
  })

  describe('POST /api/products', () => {
    it('should create a new product successfully', async () => {
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
          reorderLevel: 10,
          supplier: 'Tech Supplies Inc',
        },
      })

      expect(response.statusCode).toBe(201)
      const body = JSON.parse(response.body)
      expect(body.success).toBe(true)
      expect(body.data.sku).toBe('PROD-001')
      expect(body.data.name).toBe('Wireless Mouse')
    })

    it('should fail when creating product with duplicate SKU', async () => {
      const existingProduct = {
        id: 'prod_123',
        sku: 'PROD-001',
        name: 'Existing Product',
        description: null,
        category: 'Electronics',
        price: 29.99,
        cost: 12.5,
        reorderLevel: 10,
        supplier: 'Test Supplier',
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
          name: 'New Product',
          category: 'Electronics',
          price: 29.99,
          cost: 12.5,
          supplier: 'Test Supplier',
        },
      })

      expect(response.statusCode).toBe(409)
      const body = JSON.parse(response.body)
      expect(body.success).toBe(false)
      expect(body.error).toContain('SKU already exists')
    })

    it('should fail with invalid product data', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/products',
        payload: {
          sku: 'PROD-001',
          name: 'Test Product',
          // Missing required fields: category, price, cost, supplier
        },
      })

      expect(response.statusCode).toBe(400)
      const body = JSON.parse(response.body)
      expect(body.success).toBe(false)
      expect(body.error).toContain('Validation failed')
    })

    it('should fail with negative price', async () => {
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
      const body = JSON.parse(response.body)
      expect(body.success).toBe(false)
    })
  })

  describe('GET /api/products', () => {
    it('should return list of active products', async () => {
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
        {
          id: 'prod_2',
          sku: 'PROD-002',
          name: 'USB-C Cable',
          description: null,
          category: 'Electronics',
          price: 12.99,
          cost: 5.0,
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
        url: '/api/products',
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.success).toBe(true)
      expect(body.data).toHaveLength(2)
      expect(body.total).toBe(2)
    })

    it('should filter products by category', async () => {
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
      expect(body.data).toHaveLength(1)
      expect(body.data[0].category).toBe('Electronics')
    })

    it('should filter products by price range', async () => {
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
        url: '/api/products?minPrice=20&maxPrice=40',
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.success).toBe(true)
      expect(body.data).toHaveLength(1)
    })

    it('should search products by name', async () => {
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
      expect(body.data).toHaveLength(1)
      expect(body.data[0].name).toContain('Mouse')
    })
  })

  describe('GET /api/products/:id', () => {
    it('should return product by ID', async () => {
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

    it('should return 404 for non-existent product', async () => {
      vi.mocked(prisma.product.findUnique).mockResolvedValue(null)

      const response = await app.inject({
        method: 'GET',
        url: '/api/products/non_existent',
      })

      expect(response.statusCode).toBe(404)
      const body = JSON.parse(response.body)
      expect(body.success).toBe(false)
      expect(body.error).toContain('Product not found')
    })
  })

  describe('GET /api/products/sku/:sku', () => {
    it('should return product by SKU', async () => {
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
    it('should update product successfully', async () => {
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

    it('should return 404 when updating non-existent product', async () => {
      vi.mocked(prisma.product.update).mockRejectedValue({ code: 'P2025' })

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
    it('should deactivate product successfully', async () => {
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

    it('should return 404 when deactivating non-existent product', async () => {
      vi.mocked(prisma.product.update).mockRejectedValue({ code: 'P2025' })

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
    it('should delete product successfully', async () => {
      vi.mocked(prisma.product.delete).mockResolvedValue({} as any)

      const response = await app.inject({
        method: 'DELETE',
        url: '/api/products/prod_123',
      })

      expect(response.statusCode).toBe(204)
    })

    it('should return 404 when deleting non-existent product', async () => {
      vi.mocked(prisma.product.delete).mockRejectedValue({ code: 'P2025' })

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
