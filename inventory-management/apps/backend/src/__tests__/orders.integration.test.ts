import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest'
import Fastify, { FastifyInstance } from 'fastify'
import { orderRoutes } from '../routes/orders.js'
import { prisma } from '@inventory/db'
import './setup.js'

/**
 * Order API Integration Tests
 * 
 * Tests the order management endpoints with:
 * - Real Fastify HTTP layer
 * - Mocked Prisma (database isolation)
 * - Zod contract validation
 * - Status code verification
 * - Business logic validation
 */

describe('Order API Integration Tests', () => {
  let app: FastifyInstance

  beforeAll(async () => {
    app = Fastify()
    await app.register(orderRoutes)
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('POST /api/orders', () => {
    it('should create order successfully (201)', async () => {
      // Arrange
      const mockProduct = {
        id: 'cjld2cjxh0000qzrmn831i7rn', // Valid CUID
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
          id: 'inv-001',
          productId: 'cjld2cjxh0000qzrmn831i7rn', // Valid CUID
          currentQuantity: 100,
          reservedQuantity: 0,
          availableQuantity: 100,
          lastRestockDate: null,
          nextRestockDate: null,
          updatedAt: new Date(),
        },
      }

      const mockProduct2 = {
        id: 'cjld2cjxh0001qzrmn831i7rn', // Valid CUID
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
        inventoryLevels: {
          id: 'inv-002',
          productId: 'cjld2cjxh0001qzrmn831i7rn', // Valid CUID
          currentQuantity: 50,
          reservedQuantity: 0,
          availableQuantity: 50,
          lastRestockDate: null,
          nextRestockDate: null,
          updatedAt: new Date(),
        },
      }

      vi.mocked(prisma.product.findUnique)
        .mockResolvedValueOnce(mockProduct)
        .mockResolvedValueOnce(mockProduct2)

      vi.mocked(prisma.$transaction).mockResolvedValue({
        id: 'ord-001',
        orderNumber: 'ORD-1234567890',
        customerId: 'cust-001',
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        customerPhone: '555-1234',
        status: 'PENDING',
        totalAmount: 72.97,
        shippingAddress: '123 Main St, Springfield',
        notes: 'Deliver before 5 PM',
        createdBy: 'system',
        createdAt: new Date(),
        updatedAt: new Date(),
        shippedAt: null,
        deliveredAt: null,
        items: [
          {
            id: 'item-001',
            orderId: 'ord-001',
            productId: 'prod-001',
            quantity: 2,
            unitPrice: 29.99,
            subtotal: 59.98,
          },
          {
            id: 'item-002',
            orderId: 'ord-001',
            productId: 'prod-002',
            quantity: 1,
            unitPrice: 12.99,
            subtotal: 12.99,
          },
        ],
      } as any)

      // Act
      const response = await app.inject({
        method: 'POST',
        url: '/api/orders',
        payload: {
          customerId: 'cust-001',
          customerName: 'John Doe',
          customerEmail: 'john@example.com',
          customerPhone: '555-1234',
          shippingAddress: '123 Main St, Springfield',
          notes: 'Deliver before 5 PM',
          items: [
            {
              productId: 'cjld2cjxh0000qzrmn831i7rn', // Valid CUID
              quantity: 2,
              unitPrice: 29.99,
              subtotal: 59.98, // Required by CreateOrderRequestSchema
            },
            {
              productId: 'cjld2cjxh0001qzrmn831i7rn', // Valid CUID
              quantity: 1,
              unitPrice: 12.99,
              subtotal: 12.99, // Required by CreateOrderRequestSchema
            },
          ],
        },
      })

      // Assert
      expect(response.statusCode).toBe(201)
      const body = JSON.parse(response.body)
      expect(body.success).toBe(true)
      expect(body.data.status).toBe('PENDING')
      expect(body.data.totalAmount).toBeCloseTo(72.97, 2)
      expect(body.data.items).toHaveLength(2)
    })

    it('should fail with insufficient inventory (400)', async () => {
      // Arrange
      const mockProduct = {
        id: 'cjld2cjxh0000qzrmn831i7rn', // Valid CUID
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
          id: 'inv-001',
          productId: 'cjld2cjxh0000qzrmn831i7rn', // Valid CUID
          currentQuantity: 5,
          reservedQuantity: 0,
          availableQuantity: 5,
          lastRestockDate: null,
          nextRestockDate: null,
          updatedAt: new Date(),
        },
      }

      vi.mocked(prisma.product.findUnique).mockResolvedValue(mockProduct)

      // Act
      const response = await app.inject({
        method: 'POST',
        url: '/api/orders',
        payload: {
          customerId: 'cust-001',
          customerName: 'John Doe',
          shippingAddress: '123 Main St, Springfield',
          items: [
            {
              productId: 'cjld2cjxh0000qzrmn831i7rn', // Valid CUID
              quantity: 10,
              unitPrice: 29.99,
              subtotal: 299.90, // Required by CreateOrderRequestSchema
            },
          ],
        },
      })

      // Assert
      expect(response.statusCode).toBe(400)
      const body = JSON.parse(response.body)
      expect(body.success).toBe(false)
      expect(body.error).toContain('Insufficient inventory')
    })

    it('should fail with invalid data (400)', async () => {
      // Act
      const response = await app.inject({
        method: 'POST',
        url: '/api/orders',
        payload: {
          customerId: 'cust-001',
          customerName: 'John Doe',
          shippingAddress: '123 Main St, Springfield',
          // Missing items
        },
      })

      // Assert
      expect(response.statusCode).toBe(400)
      const body = JSON.parse(response.body)
      expect(body.success).toBe(false)
    })

    it('should fail with empty items array (400)', async () => {
      // Act
      const response = await app.inject({
        method: 'POST',
        url: '/api/orders',
        payload: {
          customerId: 'cust-001',
          customerName: 'John Doe',
          shippingAddress: '123 Main St, Springfield',
          items: [],
        },
      })

      // Assert
      expect(response.statusCode).toBe(400)
      const body = JSON.parse(response.body)
      expect(body.success).toBe(false)
    })

    it('should fail with inactive product (400)', async () => {
      // Arrange
      const mockProduct = {
        id: 'prod-001',
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
        inventoryLevels: null,
      }

      vi.mocked(prisma.product.findUnique).mockResolvedValue(mockProduct)

      // Act
      const response = await app.inject({
        method: 'POST',
        url: '/api/orders',
        payload: {
          customerId: 'cust-001',
          customerName: 'John Doe',
          shippingAddress: '123 Main St, Springfield',
          items: [
            {
              productId: 'prod-001',
              quantity: 2,
              unitPrice: 29.99,
            },
          ],
        },
      })

      // Assert
      expect(response.statusCode).toBe(400)
      const body = JSON.parse(response.body)
      expect(body.success).toBe(false)
    })

    it('should fail with non-existent product (400)', async () => {
      // Arrange
      vi.mocked(prisma.product.findUnique).mockResolvedValue(null)

      // Act
      const response = await app.inject({
        method: 'POST',
        url: '/api/orders',
        payload: {
          customerId: 'cust-001',
          customerName: 'John Doe',
          shippingAddress: '123 Main St, Springfield',
          items: [
            {
              productId: 'prod-nonexistent',
              quantity: 2,
              unitPrice: 29.99,
            },
          ],
        },
      })

      // Assert
      expect(response.statusCode).toBe(400)
      const body = JSON.parse(response.body)
      expect(body.success).toBe(false)
    })
  })

  describe('GET /api/orders', () => {
    it('should return list of orders (200)', async () => {
      // Arrange
      const mockOrders = [
        {
          id: 'ord-001',
          orderNumber: 'ORD-001',
          customerId: 'cust-001',
          customerName: 'John Doe',
          customerEmail: 'john@example.com',
          customerPhone: '555-1234',
          status: 'PENDING',
          totalAmount: 72.97,
          shippingAddress: '123 Main St, Springfield',
          notes: null,
          createdBy: 'system',
          createdAt: new Date(),
          updatedAt: new Date(),
          shippedAt: null,
          deliveredAt: null,
          items: [],
        },
        {
          id: 'ord-002',
          orderNumber: 'ORD-002',
          customerId: 'cust-002',
          customerName: 'Jane Smith',
          customerEmail: 'jane@example.com',
          customerPhone: '555-5678',
          status: 'CONFIRMED',
          totalAmount: 100.00,
          shippingAddress: '456 Oak Ave, Springfield',
          notes: null,
          createdBy: 'system',
          createdAt: new Date(),
          updatedAt: new Date(),
          shippedAt: null,
          deliveredAt: null,
          items: [],
        },
      ]

      vi.mocked(prisma.order.findMany).mockResolvedValue(mockOrders)
      vi.mocked(prisma.order.count).mockResolvedValue(2)

      // Act
      const response = await app.inject({
        method: 'GET',
        url: '/api/orders',
      })

      // Assert
      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.success).toBe(true)
      expect(body.data).toHaveLength(2)
      expect(body.total).toBe(2)
    })

    it('should filter orders by status (200)', async () => {
      // Arrange
      const mockOrders = [
        {
          id: 'ord-001',
          orderNumber: 'ORD-001',
          customerId: 'cust-001',
          customerName: 'John Doe',
          customerEmail: 'john@example.com',
          customerPhone: '555-1234',
          status: 'PENDING',
          totalAmount: 72.97,
          shippingAddress: '123 Main St, Springfield',
          notes: null,
          createdBy: 'system',
          createdAt: new Date(),
          updatedAt: new Date(),
          shippedAt: null,
          deliveredAt: null,
          items: [],
        },
        {
          id: 'ord-004',
          orderNumber: 'ORD-004',
          customerId: 'cust-004',
          customerName: 'Bob Johnson',
          customerEmail: 'bob@example.com',
          customerPhone: '555-9999',
          status: 'PENDING',
          totalAmount: 50.00,
          shippingAddress: '789 Pine Rd, Springfield',
          notes: null,
          createdBy: 'system',
          createdAt: new Date(),
          updatedAt: new Date(),
          shippedAt: null,
          deliveredAt: null,
          items: [],
        },
      ]

      vi.mocked(prisma.order.findMany).mockResolvedValue(mockOrders)
      vi.mocked(prisma.order.count).mockResolvedValue(2)

      // Act
      const response = await app.inject({
        method: 'GET',
        url: '/api/orders?status=PENDING',
      })

      // Assert
      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.success).toBe(true)
      expect(body.data).toHaveLength(2)
      expect(body.data.every((o: any) => o.status === 'PENDING')).toBe(true)
    })

    it('should filter orders by customerId (200)', async () => {
      // Arrange
      const mockOrders = [
        {
          id: 'ord-001',
          orderNumber: 'ORD-001',
          customerId: 'cust-001',
          customerName: 'John Doe',
          customerEmail: 'john@example.com',
          customerPhone: '555-1234',
          status: 'PENDING',
          totalAmount: 72.97,
          shippingAddress: '123 Main St, Springfield',
          notes: null,
          createdBy: 'system',
          createdAt: new Date(),
          updatedAt: new Date(),
          shippedAt: null,
          deliveredAt: null,
          items: [],
        },
      ]

      vi.mocked(prisma.order.findMany).mockResolvedValue(mockOrders)
      vi.mocked(prisma.order.count).mockResolvedValue(1)

      // Act
      const response = await app.inject({
        method: 'GET',
        url: '/api/orders?customerId=cust-001',
      })

      // Assert
      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.success).toBe(true)
      expect(body.data).toHaveLength(1)
      expect(body.data[0].customerId).toBe('cust-001')
    })
  })

  describe('GET /api/orders/:id', () => {
    it('should return order by ID (200)', async () => {
      // Arrange
      const mockOrder = {
        id: 'ord-001',
        orderNumber: 'ORD-001',
        customerId: 'cust-001',
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        customerPhone: '555-1234',
        status: 'CONFIRMED',
        totalAmount: 72.97,
        shippingAddress: '123 Main St, Springfield',
        notes: null,
        createdBy: 'system',
        createdAt: new Date(),
        updatedAt: new Date(),
        shippedAt: null,
        deliveredAt: null,
        items: [
          {
            id: 'item-001',
            orderId: 'ord-001',
            productId: 'prod-001',
            quantity: 2,
            unitPrice: 29.99,
            subtotal: 59.98,
            product: {
              id: 'prod-001',
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
          },
        ],
      }

      vi.mocked(prisma.order.findUnique).mockResolvedValue(mockOrder)

      // Act
      const response = await app.inject({
        method: 'GET',
        url: '/api/orders/ord-001',
      })

      // Assert
      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.success).toBe(true)
      expect(body.data.id).toBe('ord-001')
      expect(body.data.items).toHaveLength(1)
    })

    it('should return 404 for non-existent order', async () => {
      // Arrange
      vi.mocked(prisma.order.findUnique).mockResolvedValue(null)

      // Act
      const response = await app.inject({
        method: 'GET',
        url: '/api/orders/non-existent',
      })

      // Assert
      expect(response.statusCode).toBe(404)
      const body = JSON.parse(response.body)
      expect(body.success).toBe(false)
    })
  })

  describe('PUT /api/orders/:id/status', () => {
    it('should confirm order (PENDING → CONFIRMED) (200)', async () => {
      // Arrange
      const mockOrder = {
        id: 'ord-001',
        orderNumber: 'ORD-001',
        customerId: 'cust-001',
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        customerPhone: '555-1234',
        status: 'PENDING',
        totalAmount: 72.97,
        shippingAddress: '123 Main St, Springfield',
        notes: null,
        createdBy: 'system',
        createdAt: new Date(),
        updatedAt: new Date(),
        shippedAt: null,
        deliveredAt: null,
        items: [
          {
            id: 'item-001',
            orderId: 'ord-001',
            productId: 'prod-001',
            quantity: 2,
            unitPrice: 29.99,
            subtotal: 59.98,
          },
        ],
      }

      const mockUpdatedOrder = {
        ...mockOrder,
        status: 'CONFIRMED',
      }

      vi.mocked(prisma.order.findUnique).mockResolvedValue(mockOrder)
      vi.mocked(prisma.order.update).mockResolvedValue(mockUpdatedOrder)

      // Act
      const response = await app.inject({
        method: 'PUT',
        url: '/api/orders/ord-001/status',
        payload: {
          status: 'CONFIRMED',
        },
      })

      // Assert
      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.success).toBe(true)
      expect(body.data.status).toBe('CONFIRMED')
    })

    it('should ship order (CONFIRMED → SHIPPED) (200)', async () => {
      // Arrange
      const mockOrder = {
        id: 'ord-001',
        orderNumber: 'ORD-001',
        customerId: 'cust-001',
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        customerPhone: '555-1234',
        status: 'CONFIRMED',
        totalAmount: 72.97,
        shippingAddress: '123 Main St, Springfield',
        notes: null,
        createdBy: 'system',
        createdAt: new Date(),
        updatedAt: new Date(),
        shippedAt: null,
        deliveredAt: null,
        items: [
          {
            id: 'item-001',
            orderId: 'ord-001',
            productId: 'prod-001',
            quantity: 2,
            unitPrice: 29.99,
            subtotal: 59.98,
          },
        ],
      }

      const mockUpdatedOrder = {
        ...mockOrder,
        status: 'SHIPPED',
        shippedAt: new Date(),
      }

      vi.mocked(prisma.order.findUnique).mockResolvedValue(mockOrder)
      vi.mocked(prisma.$transaction).mockResolvedValue(undefined)
      vi.mocked(prisma.order.update).mockResolvedValue(mockUpdatedOrder)

      // Act
      const response = await app.inject({
        method: 'PUT',
        url: '/api/orders/ord-001/status',
        payload: {
          status: 'SHIPPED',
        },
      })

      // Assert
      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.success).toBe(true)
      expect(body.data.status).toBe('SHIPPED')
      expect(body.data.shippedAt).toBeDefined()
    })

    it('should deliver order (SHIPPED → DELIVERED) (200)', async () => {
      // Arrange
      const mockOrder = {
        id: 'ord-001',
        orderNumber: 'ORD-001',
        customerId: 'cust-001',
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        customerPhone: '555-1234',
        status: 'SHIPPED',
        totalAmount: 72.97,
        shippingAddress: '123 Main St, Springfield',
        notes: null,
        createdBy: 'system',
        createdAt: new Date(),
        updatedAt: new Date(),
        shippedAt: new Date(),
        deliveredAt: null,
        items: [],
      }

      const mockUpdatedOrder = {
        ...mockOrder,
        status: 'DELIVERED',
        deliveredAt: new Date(),
      }

      vi.mocked(prisma.order.findUnique).mockResolvedValue(mockOrder)
      vi.mocked(prisma.order.update).mockResolvedValue(mockUpdatedOrder)

      // Act
      const response = await app.inject({
        method: 'PUT',
        url: '/api/orders/ord-001/status',
        payload: {
          status: 'DELIVERED',
        },
      })

      // Assert
      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.success).toBe(true)
      expect(body.data.status).toBe('DELIVERED')
      expect(body.data.deliveredAt).toBeDefined()
    })

    it('should cancel order (PENDING → CANCELLED) (200)', async () => {
      // Arrange
      const mockOrder = {
        id: 'ord-001',
        orderNumber: 'ORD-001',
        customerId: 'cust-001',
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        customerPhone: '555-1234',
        status: 'PENDING',
        totalAmount: 72.97,
        shippingAddress: '123 Main St, Springfield',
        notes: null,
        createdBy: 'system',
        createdAt: new Date(),
        updatedAt: new Date(),
        shippedAt: null,
        deliveredAt: null,
        items: [
          {
            id: 'item-001',
            orderId: 'ord-001',
            productId: 'prod-001',
            quantity: 2,
            unitPrice: 29.99,
            subtotal: 59.98,
          },
        ],
      }

      const mockUpdatedOrder = {
        ...mockOrder,
        status: 'CANCELLED',
      }

      vi.mocked(prisma.order.findUnique).mockResolvedValue(mockOrder)
      vi.mocked(prisma.$transaction).mockResolvedValue(undefined)
      vi.mocked(prisma.order.update).mockResolvedValue(mockUpdatedOrder)

      // Act
      const response = await app.inject({
        method: 'PUT',
        url: '/api/orders/ord-001/status',
        payload: {
          status: 'CANCELLED',
        },
      })

      // Assert
      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.success).toBe(true)
      expect(body.data.status).toBe('CANCELLED')
    })

    it('should return order (DELIVERED → RETURNED) (200)', async () => {
      // Arrange
      const mockOrder = {
        id: 'ord-001',
        orderNumber: 'ORD-001',
        customerId: 'cust-001',
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        customerPhone: '555-1234',
        status: 'DELIVERED',
        totalAmount: 72.97,
        shippingAddress: '123 Main St, Springfield',
        notes: null,
        createdBy: 'system',
        createdAt: new Date(),
        updatedAt: new Date(),
        shippedAt: new Date(),
        deliveredAt: new Date(),
        items: [
          {
            id: 'item-001',
            orderId: 'ord-001',
            productId: 'prod-001',
            quantity: 2,
            unitPrice: 29.99,
            subtotal: 59.98,
          },
        ],
      }

      const mockUpdatedOrder = {
        ...mockOrder,
        status: 'RETURNED',
      }

      vi.mocked(prisma.order.findUnique).mockResolvedValue(mockOrder)
      vi.mocked(prisma.$transaction).mockResolvedValue(undefined)
      vi.mocked(prisma.order.update).mockResolvedValue(mockUpdatedOrder)

      // Act
      const response = await app.inject({
        method: 'PUT',
        url: '/api/orders/ord-001/status',
        payload: {
          status: 'RETURNED',
        },
      })

      // Assert
      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.success).toBe(true)
      expect(body.data.status).toBe('RETURNED')
    })

    it('should return 404 for non-existent order', async () => {
      // Arrange
      vi.mocked(prisma.order.findUnique).mockResolvedValue(null)

      // Act
      const response = await app.inject({
        method: 'PUT',
        url: '/api/orders/non-existent/status',
        payload: {
          status: 'CONFIRMED',
        },
      })

      // Assert
      expect(response.statusCode).toBe(404)
      const body = JSON.parse(response.body)
      expect(body.success).toBe(false)
    })
  })

  describe('POST /api/orders/:id/items', () => {
    it('should add item to PENDING order (200)', async () => {
      // Arrange
      const mockOrder = {
        id: 'ord-001',
        orderNumber: 'ORD-001',
        customerId: 'cust-001',
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        customerPhone: '555-1234',
        status: 'PENDING',
        totalAmount: 59.98,
        shippingAddress: '123 Main St, Springfield',
        notes: null,
        createdBy: 'system',
        createdAt: new Date(),
        updatedAt: new Date(),
        shippedAt: null,
        deliveredAt: null,
        items: [
          {
            id: 'item-001',
            orderId: 'ord-001',
            productId: 'prod-001',
            quantity: 2,
            unitPrice: 29.99,
            subtotal: 59.98,
          },
        ],
      }

      const mockProduct = {
        id: 'prod-002',
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
        inventoryLevels: {
          id: 'inv-002',
          productId: 'prod-002',
          currentQuantity: 50,
          reservedQuantity: 0,
          availableQuantity: 50,
          lastRestockDate: null,
          nextRestockDate: null,
          updatedAt: new Date(),
        },
      }

      const mockUpdatedOrder = {
        ...mockOrder,
        totalAmount: 72.97,
        items: [
          ...mockOrder.items,
          {
            id: 'item-002',
            orderId: 'ord-001',
            productId: 'prod-002',
            quantity: 1,
            unitPrice: 12.99,
            subtotal: 12.99,
          },
        ],
      }

      // Setup mocks with proper sequencing for POST /api/orders/:id/items
      vi.mocked(prisma.order.findUnique)
        .mockResolvedValueOnce(mockOrder) // First call: find order to check status
        .mockResolvedValueOnce(mockUpdatedOrder) // Second call: find updated order after transaction

      vi.mocked(prisma.product.findUnique).mockResolvedValue(mockProduct)
      vi.mocked(prisma.$transaction).mockResolvedValue(undefined)

      // Act
      const response = await app.inject({
        method: 'POST',
        url: '/api/orders/ord-001/items',
        payload: {
          productId: 'prod-002',
          quantity: 1,
          unitPrice: 12.99,
        },
      })

      // Assert
      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.success).toBe(true)
      expect(body.data.items).toHaveLength(2)
      expect(body.data.totalAmount).toBeCloseTo(72.97, 2)
    })

    it('should fail adding item to non-PENDING order (400)', async () => {
      // Arrange
      const mockOrder = {
        id: 'ord-001',
        orderNumber: 'ORD-001',
        customerId: 'cust-001',
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        customerPhone: '555-1234',
        status: 'CONFIRMED',
        totalAmount: 59.98,
        shippingAddress: '123 Main St, Springfield',
        notes: null,
        createdBy: 'system',
        createdAt: new Date(),
        updatedAt: new Date(),
        shippedAt: null,
        deliveredAt: null,
        items: [],
      }

      vi.mocked(prisma.order.findUnique).mockResolvedValue(mockOrder)

      // Act
      const response = await app.inject({
        method: 'POST',
        url: '/api/orders/ord-001/items',
        payload: {
          productId: 'prod-002',
          quantity: 1,
          unitPrice: 12.99,
        },
      })

      // Assert
      expect(response.statusCode).toBe(400)
      const body = JSON.parse(response.body)
      expect(body.success).toBe(false)
      expect(body.error).toContain('pending')
    })

    it('should fail with insufficient inventory (400)', async () => {
      // Arrange
      const mockOrder = {
        id: 'ord-001',
        orderNumber: 'ORD-001',
        customerId: 'cust-001',
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        customerPhone: '555-1234',
        status: 'PENDING',
        totalAmount: 59.98,
        shippingAddress: '123 Main St, Springfield',
        notes: null,
        createdBy: 'system',
        createdAt: new Date(),
        updatedAt: new Date(),
        shippedAt: null,
        deliveredAt: null,
        items: [],
      }

      const mockProduct = {
        id: 'prod-002',
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
        inventoryLevels: {
          id: 'inv-002',
          productId: 'prod-002',
          currentQuantity: 5,
          reservedQuantity: 0,
          availableQuantity: 5,
          lastRestockDate: null,
          nextRestockDate: null,
          updatedAt: new Date(),
        },
      }

      vi.mocked(prisma.order.findUnique).mockResolvedValue(mockOrder)
      vi.mocked(prisma.product.findUnique).mockResolvedValue(mockProduct)

      // Act
      const response = await app.inject({
        method: 'POST',
        url: '/api/orders/ord-001/items',
        payload: {
          productId: 'prod-002',
          quantity: 10,
          unitPrice: 12.99,
        },
      })

      // Assert
      expect(response.statusCode).toBe(400)
      const body = JSON.parse(response.body)
      expect(body.success).toBe(false)
      expect(body.error).toContain('Insufficient inventory')
    })
  })

  describe('DELETE /api/orders/:id/items/:itemId', () => {
    it('should remove item from PENDING order (200)', async () => {
      // Arrange
      const mockOrder = {
        id: 'ord-001',
        orderNumber: 'ORD-001',
        customerId: 'cust-001',
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        customerPhone: '555-1234',
        status: 'PENDING',
        totalAmount: 72.97,
        shippingAddress: '123 Main St, Springfield',
        notes: null,
        createdBy: 'system',
        createdAt: new Date(),
        updatedAt: new Date(),
        shippedAt: null,
        deliveredAt: null,
        items: [
          {
            id: 'item-001',
            orderId: 'ord-001',
            productId: 'prod-001',
            quantity: 2,
            unitPrice: 29.99,
            subtotal: 59.98,
          },
          {
            id: 'item-002',
            orderId: 'ord-001',
            productId: 'prod-002',
            quantity: 1,
            unitPrice: 12.99,
            subtotal: 12.99,
          },
        ],
      }

      const mockUpdatedOrder = {
        ...mockOrder,
        totalAmount: 59.98,
        items: [mockOrder.items[0]],
      }

      // Setup mocks with proper sequencing
      vi.mocked(prisma.order.findUnique)
        .mockResolvedValueOnce(mockOrder) // First call: find order to check status
        .mockResolvedValueOnce(mockUpdatedOrder) // Second call: find updated order after delete

      vi.mocked(prisma.$transaction).mockResolvedValue(undefined)

      // Act
      const response = await app.inject({
        method: 'DELETE',
        url: '/api/orders/ord-001/items/item-002',
      })

      // Assert
      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.success).toBe(true)
      expect(body.data.items).toHaveLength(1)
      expect(body.data.totalAmount).toBeCloseTo(59.98, 2)
    })

    it('should fail removing item from non-PENDING order (400)', async () => {
      // Arrange
      const mockOrder = {
        id: 'ord-001',
        orderNumber: 'ORD-001',
        customerId: 'cust-001',
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        customerPhone: '555-1234',
        status: 'CONFIRMED',
        totalAmount: 72.97,
        shippingAddress: '123 Main St, Springfield',
        notes: null,
        createdBy: 'system',
        createdAt: new Date(),
        updatedAt: new Date(),
        shippedAt: null,
        deliveredAt: null,
        items: [],
      }

      vi.mocked(prisma.order.findUnique).mockResolvedValue(mockOrder)

      // Act
      const response = await app.inject({
        method: 'DELETE',
        url: '/api/orders/ord-001/items/item-001',
      })

      // Assert
      expect(response.statusCode).toBe(400)
      const body = JSON.parse(response.body)
      expect(body.success).toBe(false)
      expect(body.error).toContain('pending')
    })

    it('should return 404 for non-existent order', async () => {
      // Arrange
      vi.mocked(prisma.order.findUnique).mockResolvedValue(null)

      // Act
      const response = await app.inject({
        method: 'DELETE',
        url: '/api/orders/non-existent/items/item-001',
      })

      // Assert
      expect(response.statusCode).toBe(404)
      const body = JSON.parse(response.body)
      expect(body.success).toBe(false)
    })

    it('should return 404 for non-existent item', async () => {
      // Arrange
      const mockOrder = {
        id: 'ord-001',
        orderNumber: 'ORD-001',
        customerId: 'cust-001',
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        customerPhone: '555-1234',
        status: 'PENDING',
        totalAmount: 59.98,
        shippingAddress: '123 Main St, Springfield',
        notes: null,
        createdBy: 'system',
        createdAt: new Date(),
        updatedAt: new Date(),
        shippedAt: null,
        deliveredAt: null,
        items: [
          {
            id: 'item-001',
            orderId: 'ord-001',
            productId: 'prod-001',
            quantity: 2,
            unitPrice: 29.99,
            subtotal: 59.98,
          },
        ],
      }

      vi.mocked(prisma.order.findUnique).mockResolvedValue(mockOrder)

      // Act
      const response = await app.inject({
        method: 'DELETE',
        url: '/api/orders/ord-001/items/non-existent',
      })

      // Assert
      expect(response.statusCode).toBe(404)
      const body = JSON.parse(response.body)
      expect(body.success).toBe(false)
    })
  })

  describe('GET /api/orders/summary', () => {
    it('should return order summary report (200)', async () => {
      // Arrange
      vi.mocked(prisma.order.groupBy).mockResolvedValue([
        {
          status: 'PENDING',
          _count: { id: 1 },
          _sum: { totalAmount: 72.97 },
        },
        {
          status: 'DELIVERED',
          _count: { id: 2 },
          _sum: { totalAmount: 200.00 },
        },
      ])

      // Act
      const response = await app.inject({
        method: 'GET',
        url: '/api/orders/summary',
      })

      // Assert
      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.success).toBe(true)
      expect(body.data.totalOrders).toBe(3)
      expect(body.data.totalRevenue).toBeCloseTo(272.97, 2)
      expect(body.data.pendingOrders).toBe(1)
      expect(body.data.deliveredOrders).toBe(2)
    })
  })
})
