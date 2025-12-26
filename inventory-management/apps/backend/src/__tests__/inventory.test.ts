import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import Fastify, { FastifyInstance } from 'fastify'
import { inventoryRoutes } from '../routes/inventory.js'
import { prisma } from '@inventory/db'

describe('Inventory API', () => {
  let app: FastifyInstance

  beforeEach(async () => {
    app = Fastify()
    await app.register(inventoryRoutes)
  })

  afterEach(async () => {
    await app.close()
  })

  describe('POST /api/inventory/transactions', () => {
    it('should record a purchase transaction successfully', async () => {
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

      const mockTransaction = {
        id: 'trans_123',
        productId: 'prod_123',
        type: 'PURCHASE' as const,
        quantity: 100,
        reference: 'PO-2024-001',
        notes: 'Initial stock',
        createdBy: 'system',
        createdAt: new Date(),
      }

      vi.mocked(prisma.inventoryLevel.findUnique).mockResolvedValue(mockInventoryLevel)
      vi.mocked(prisma.$transaction).mockResolvedValue([mockTransaction, mockInventoryLevel])

      const response = await app.inject({
        method: 'POST',
        url: '/api/inventory/transactions',
        payload: {
          productId: 'prod_123',
          type: 'PURCHASE',
          quantity: 100,
          reference: 'PO-2024-001',
          notes: 'Initial stock',
        },
      })

      expect(response.statusCode).toBe(201)
      const body = JSON.parse(response.body)
      expect(body.success).toBe(true)
      expect(body.data.type).toBe('PURCHASE')
      expect(body.data.quantity).toBe(100)
    })

    it('should record a sale transaction successfully', async () => {
      const mockInventoryLevel = {
        id: 'inv_123',
        productId: 'prod_123',
        currentQuantity: 100,
        reservedQuantity: 0,
        availableQuantity: 100,
        lastRestockDate: null,
        nextRestockDate: null,
        updatedAt: new Date(),
      }

      const mockTransaction = {
        id: 'trans_123',
        productId: 'prod_123',
        type: 'SALE' as const,
        quantity: 5,
        reference: 'ORD-2024-001',
        notes: 'Customer order',
        createdBy: 'system',
        createdAt: new Date(),
      }

      vi.mocked(prisma.inventoryLevel.findUnique).mockResolvedValue(mockInventoryLevel)
      vi.mocked(prisma.$transaction).mockResolvedValue([mockTransaction, mockInventoryLevel])

      const response = await app.inject({
        method: 'POST',
        url: '/api/inventory/transactions',
        payload: {
          productId: 'prod_123',
          type: 'SALE',
          quantity: 5,
          reference: 'ORD-2024-001',
          notes: 'Customer order',
        },
      })

      expect(response.statusCode).toBe(201)
      const body = JSON.parse(response.body)
      expect(body.success).toBe(true)
      expect(body.data.type).toBe('SALE')
    })

    it('should fail sale transaction with insufficient inventory', async () => {
      const mockInventoryLevel = {
        id: 'inv_123',
        productId: 'prod_123',
        currentQuantity: 50,
        reservedQuantity: 30,
        availableQuantity: 20,
        lastRestockDate: null,
        nextRestockDate: null,
        updatedAt: new Date(),
      }

      vi.mocked(prisma.inventoryLevel.findUnique).mockResolvedValue(mockInventoryLevel)

      const response = await app.inject({
        method: 'POST',
        url: '/api/inventory/transactions',
        payload: {
          productId: 'prod_123',
          type: 'SALE',
          quantity: 25,
          reference: 'ORD-2024-001',
        },
      })

      expect(response.statusCode).toBe(400)
      const body = JSON.parse(response.body)
      expect(body.success).toBe(false)
      expect(body.error).toContain('Insufficient available inventory')
    })

    it('should record an adjustment transaction', async () => {
      const mockInventoryLevel = {
        id: 'inv_123',
        productId: 'prod_123',
        currentQuantity: 100,
        reservedQuantity: 0,
        availableQuantity: 100,
        lastRestockDate: null,
        nextRestockDate: null,
        updatedAt: new Date(),
      }

      const mockTransaction = {
        id: 'trans_123',
        productId: 'prod_123',
        type: 'ADJUSTMENT' as const,
        quantity: -10,
        reference: 'ADJ-2024-001',
        notes: 'Inventory count discrepancy',
        createdBy: 'system',
        createdAt: new Date(),
      }

      vi.mocked(prisma.inventoryLevel.findUnique).mockResolvedValue(mockInventoryLevel)
      vi.mocked(prisma.$transaction).mockResolvedValue([mockTransaction, mockInventoryLevel])

      const response = await app.inject({
        method: 'POST',
        url: '/api/inventory/transactions',
        payload: {
          productId: 'prod_123',
          type: 'ADJUSTMENT',
          quantity: -10,
          reference: 'ADJ-2024-001',
          notes: 'Inventory count discrepancy',
        },
      })

      expect(response.statusCode).toBe(201)
      const body = JSON.parse(response.body)
      expect(body.success).toBe(true)
      expect(body.data.type).toBe('ADJUSTMENT')
    })

    it('should record a damage transaction', async () => {
      const mockInventoryLevel = {
        id: 'inv_123',
        productId: 'prod_123',
        currentQuantity: 100,
        reservedQuantity: 0,
        availableQuantity: 100,
        lastRestockDate: null,
        nextRestockDate: null,
        updatedAt: new Date(),
      }

      const mockTransaction = {
        id: 'trans_123',
        productId: 'prod_123',
        type: 'DAMAGE' as const,
        quantity: 3,
        reference: 'DMG-2024-001',
        notes: 'Damaged during shipping',
        createdBy: 'system',
        createdAt: new Date(),
      }

      vi.mocked(prisma.inventoryLevel.findUnique).mockResolvedValue(mockInventoryLevel)
      vi.mocked(prisma.$transaction).mockResolvedValue([mockTransaction, mockInventoryLevel])

      const response = await app.inject({
        method: 'POST',
        url: '/api/inventory/transactions',
        payload: {
          productId: 'prod_123',
          type: 'DAMAGE',
          quantity: 3,
          reference: 'DMG-2024-001',
          notes: 'Damaged during shipping',
        },
      })

      expect(response.statusCode).toBe(201)
      const body = JSON.parse(response.body)
      expect(body.success).toBe(true)
      expect(body.data.type).toBe('DAMAGE')
    })

    it('should record a return transaction', async () => {
      const mockInventoryLevel = {
        id: 'inv_123',
        productId: 'prod_123',
        currentQuantity: 95,
        reservedQuantity: 0,
        availableQuantity: 95,
        lastRestockDate: null,
        nextRestockDate: null,
        updatedAt: new Date(),
      }

      const mockTransaction = {
        id: 'trans_123',
        productId: 'prod_123',
        type: 'RETURN' as const,
        quantity: 2,
        reference: 'RET-2024-001',
        notes: 'Customer return',
        createdBy: 'system',
        createdAt: new Date(),
      }

      vi.mocked(prisma.inventoryLevel.findUnique).mockResolvedValue(mockInventoryLevel)
      vi.mocked(prisma.$transaction).mockResolvedValue([mockTransaction, mockInventoryLevel])

      const response = await app.inject({
        method: 'POST',
        url: '/api/inventory/transactions',
        payload: {
          productId: 'prod_123',
          type: 'RETURN',
          quantity: 2,
          reference: 'RET-2024-001',
          notes: 'Customer return',
        },
      })

      expect(response.statusCode).toBe(201)
      const body = JSON.parse(response.body)
      expect(body.success).toBe(true)
      expect(body.data.type).toBe('RETURN')
    })

    it('should return 404 for non-existent product', async () => {
      vi.mocked(prisma.inventoryLevel.findUnique).mockResolvedValue(null)

      const response = await app.inject({
        method: 'POST',
        url: '/api/inventory/transactions',
        payload: {
          productId: 'non_existent',
          type: 'PURCHASE',
          quantity: 100,
          reference: 'PO-2024-001',
        },
      })

      expect(response.statusCode).toBe(404)
      const body = JSON.parse(response.body)
      expect(body.success).toBe(false)
      expect(body.error).toContain('Product inventory not found')
    })
  })

  describe('GET /api/inventory/transactions/product/:productId', () => {
    it('should return transaction history for a product', async () => {
      const mockTransactions = [
        {
          id: 'trans_1',
          productId: 'prod_123',
          type: 'PURCHASE' as const,
          quantity: 100,
          reference: 'PO-2024-001',
          notes: null,
          createdBy: 'system',
          createdAt: new Date('2024-01-01'),
          product: {
            id: 'prod_123',
            sku: 'PROD-001',
            name: 'Test Product',
            description: null,
            category: 'Test',
            price: 29.99,
            cost: 15.0,
            reorderLevel: 10,
            supplier: 'Test Supplier',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        },
        {
          id: 'trans_2',
          productId: 'prod_123',
          type: 'SALE' as const,
          quantity: 5,
          reference: 'ORD-2024-001',
          notes: null,
          createdBy: 'system',
          createdAt: new Date('2024-01-02'),
          product: {
            id: 'prod_123',
            sku: 'PROD-001',
            name: 'Test Product',
            description: null,
            category: 'Test',
            price: 29.99,
            cost: 15.0,
            reorderLevel: 10,
            supplier: 'Test Supplier',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        },
      ]

      vi.mocked(prisma.inventoryTransaction.findMany).mockResolvedValue(mockTransactions)

      const response = await app.inject({
        method: 'GET',
        url: '/api/inventory/transactions/product/prod_123',
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.success).toBe(true)
      expect(body.data).toHaveLength(2)
      expect(body.data[0].type).toBe('PURCHASE')
      expect(body.data[1].type).toBe('SALE')
    })
  })

  describe('GET /api/inventory/levels/:productId', () => {
    it('should return inventory level for a product', async () => {
      const mockInventoryLevel = {
        id: 'inv_123',
        productId: 'prod_123',
        currentQuantity: 100,
        reservedQuantity: 20,
        availableQuantity: 80,
        lastRestockDate: null,
        nextRestockDate: null,
        updatedAt: new Date(),
        product: {
          id: 'prod_123',
          sku: 'PROD-001',
          name: 'Test Product',
          description: null,
          category: 'Test',
          price: 29.99,
          cost: 15.0,
          reorderLevel: 10,
          supplier: 'Test Supplier',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      }

      vi.mocked(prisma.inventoryLevel.findUnique).mockResolvedValue(mockInventoryLevel)

      const response = await app.inject({
        method: 'GET',
        url: '/api/inventory/levels/prod_123',
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.success).toBe(true)
      expect(body.data.currentQuantity).toBe(100)
      expect(body.data.reservedQuantity).toBe(20)
      expect(body.data.availableQuantity).toBe(80)
    })

    it('should return 404 for non-existent inventory level', async () => {
      vi.mocked(prisma.inventoryLevel.findUnique).mockResolvedValue(null)

      const response = await app.inject({
        method: 'GET',
        url: '/api/inventory/levels/non_existent',
      })

      expect(response.statusCode).toBe(404)
      const body = JSON.parse(response.body)
      expect(body.success).toBe(false)
    })
  })

  describe('POST /api/inventory/reserve', () => {
    it('should reserve inventory successfully', async () => {
      const mockInventoryLevel = {
        id: 'inv_123',
        productId: 'prod_123',
        currentQuantity: 100,
        reservedQuantity: 0,
        availableQuantity: 100,
        lastRestockDate: null,
        nextRestockDate: null,
        updatedAt: new Date(),
      }

      const mockUpdatedLevel = {
        ...mockInventoryLevel,
        reservedQuantity: 20,
        availableQuantity: 80,
      }

      vi.mocked(prisma.inventoryLevel.findUnique).mockResolvedValue(mockInventoryLevel)
      vi.mocked(prisma.inventoryLevel.update).mockResolvedValue(mockUpdatedLevel)

      const response = await app.inject({
        method: 'POST',
        url: '/api/inventory/reserve',
        payload: {
          productId: 'prod_123',
          quantity: 20,
        },
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.success).toBe(true)
      expect(body.data.reservedQuantity).toBe(20)
      expect(body.data.availableQuantity).toBe(80)
    })

    it('should fail to reserve more than available', async () => {
      const mockInventoryLevel = {
        id: 'inv_123',
        productId: 'prod_123',
        currentQuantity: 50,
        reservedQuantity: 30,
        availableQuantity: 20,
        lastRestockDate: null,
        nextRestockDate: null,
        updatedAt: new Date(),
      }

      vi.mocked(prisma.inventoryLevel.findUnique).mockResolvedValue(mockInventoryLevel)

      const response = await app.inject({
        method: 'POST',
        url: '/api/inventory/reserve',
        payload: {
          productId: 'prod_123',
          quantity: 25,
        },
      })

      expect(response.statusCode).toBe(400)
      const body = JSON.parse(response.body)
      expect(body.success).toBe(false)
      expect(body.error).toContain('Insufficient available inventory')
    })
  })

  describe('POST /api/inventory/release', () => {
    it('should release reserved inventory successfully', async () => {
      const mockInventoryLevel = {
        id: 'inv_123',
        productId: 'prod_123',
        currentQuantity: 100,
        reservedQuantity: 20,
        availableQuantity: 80,
        lastRestockDate: null,
        nextRestockDate: null,
        updatedAt: new Date(),
      }

      const mockUpdatedLevel = {
        ...mockInventoryLevel,
        reservedQuantity: 0,
        availableQuantity: 100,
      }

      vi.mocked(prisma.inventoryLevel.findUnique).mockResolvedValue(mockInventoryLevel)
      vi.mocked(prisma.inventoryLevel.update).mockResolvedValue(mockUpdatedLevel)

      const response = await app.inject({
        method: 'POST',
        url: '/api/inventory/release',
        payload: {
          productId: 'prod_123',
        },
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.success).toBe(true)
      expect(body.data.reservedQuantity).toBe(0)
      expect(body.data.availableQuantity).toBe(100)
    })
  })

  describe('GET /api/inventory/alerts/product/:productId', () => {
    it('should return stock alerts for a product', async () => {
      const mockAlerts = [
        {
          id: 'alert_1',
          productId: 'prod_123',
          alertType: 'LOW_STOCK' as const,
          currentQuantity: 8,
          reorderLevel: 10,
          isResolved: false,
          resolvedAt: null,
          createdAt: new Date(),
          product: {
            id: 'prod_123',
            sku: 'PROD-001',
            name: 'Test Product',
            description: null,
            category: 'Test',
            price: 29.99,
            cost: 15.0,
            reorderLevel: 10,
            supplier: 'Test Supplier',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        },
      ]

      vi.mocked(prisma.stockAlert.findMany).mockResolvedValue(mockAlerts)

      const response = await app.inject({
        method: 'GET',
        url: '/api/inventory/alerts/product/prod_123',
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.success).toBe(true)
      expect(body.data).toHaveLength(1)
      expect(body.data[0].alertType).toBe('LOW_STOCK')
    })
  })

  describe('GET /api/inventory/levels/:productId/total', () => {
    it('should return total inventory for a product', async () => {
      const mockInventoryLevel = {
        id: 'inv_123',
        productId: 'prod_123',
        currentQuantity: 100,
        reservedQuantity: 20,
        availableQuantity: 80,
        lastRestockDate: null,
        nextRestockDate: null,
        updatedAt: new Date(),
      }

      vi.mocked(prisma.inventoryLevel.findUnique).mockResolvedValue(mockInventoryLevel)

      const response = await app.inject({
        method: 'GET',
        url: '/api/inventory/levels/prod_123/total',
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.success).toBe(true)
      expect(body.data.totalQuantity).toBe(100)
      expect(body.data.reservedQuantity).toBe(20)
      expect(body.data.availableQuantity).toBe(80)
    })
  })
})
