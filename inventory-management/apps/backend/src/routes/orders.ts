import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { prisma } from '@inventory/db'
import { CreateOrderRequestSchema, UpdateOrderStatusRequestSchema, OrderFiltersSchema } from '@inventory/contracts'

const OrderItemSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().positive(),
  unitPrice: z.number().positive(),
})

export async function orderRoutes(app: FastifyInstance) {
  // POST /api/orders - Create new order
  app.post('/api/orders', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const orderData = CreateOrderRequestSchema.parse(request.body)

      // Generate order number
      const orderNumber = `ORD-${Date.now()}`

      // Calculate total amount and validate inventory
      let totalAmount = 0
      const orderItems: Array<{
        productId: string
        quantity: number
        unitPrice: number
        subtotal: number
      }> = []

      for (const item of orderData.items) {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          include: { inventoryLevels: true },
        })

        if (!product || !product.isActive) {
          reply.status(400)
          return { success: false, error: `Product ${item.productId} not found or inactive` }
        }

        const inventoryLevel = product.inventoryLevels
        if (!inventoryLevel || inventoryLevel.availableQuantity < item.quantity) {
          reply.status(400)
          return { success: false, error: `Insufficient inventory for product ${product.sku}` }
        }

        const subtotal = item.quantity * item.unitPrice
        totalAmount += subtotal

        orderItems.push({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          subtotal,
        })
      }

      // Create order in transaction
      const order = await prisma.$transaction(async (tx: any) => {
        // Create order
        const newOrder = await tx.order.create({
          data: {
            orderNumber,
            customerId: orderData.customerId,
            customerName: orderData.customerName,
            customerEmail: orderData.customerEmail,
            customerPhone: orderData.customerPhone,
            totalAmount,
            shippingAddress: orderData.shippingAddress,
            notes: orderData.notes,
            createdBy: 'system', // TODO: Get from auth context
            items: {
              create: orderItems,
            },
          },
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
        })

        // Reserve inventory for each item
        for (const item of orderItems) {
          await tx.inventoryLevel.update({
            where: { productId: item.productId },
            data: {
              reservedQuantity: {
                increment: item.quantity,
              },
              availableQuantity: {
                decrement: item.quantity,
              },
            },
          })
        }

        return newOrder
      })

      reply.status(201)
      return { success: true, data: order }
    } catch (error) {
      if (error instanceof z.ZodError) {
        reply.status(400)
        return { success: false, error: 'Validation failed', details: error.issues }
      }
      reply.status(500)
      return { success: false, error: 'Internal server error' }
    }
  })

  // GET /api/orders - List orders with filters
  app.get('/api/orders', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const filters = OrderFiltersSchema.parse(request.query)

      const where: any = {}

      if (filters.status) {
        where.status = filters.status
      }

      if (filters.customerId) {
        where.customerId = filters.customerId
      }

      if (filters.startDate && filters.endDate) {
        where.createdAt = {
          gte: filters.startDate,
          lte: filters.endDate,
        }
      }

      const [orders, total] = await Promise.all([
        prisma.order.findMany({
          where,
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
          skip: (filters.page - 1) * filters.pageSize,
          take: filters.pageSize,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.order.count({ where }),
      ])

      return {
        success: true,
        data: orders,
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

  // GET /api/orders/:id - Get order by ID
  app.get<{ Params: { id: string } }>('/api/orders/:id', async (request, reply) => {
    try {
      const order = await prisma.order.findUnique({
        where: { id: request.params.id },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      })

      if (!order) {
        reply.status(404)
        return { success: false, error: 'Order not found' }
      }

      return { success: true, data: order }
    } catch (error) {
      reply.status(500)
      return { success: false, error: 'Internal server error' }
    }
  })

  // PUT /api/orders/:id/status - Update order status
  app.put<{ Params: { id: string } }>('/api/orders/:id/status', async (request, reply) => {
    try {
      const { status, notes } = UpdateOrderStatusRequestSchema.parse(request.body)

      const order = await prisma.order.findUnique({
        where: { id: request.params.id },
        include: { items: true },
      })

      if (!order) {
        reply.status(404)
        return { success: false, error: 'Order not found' }
      }

      // Handle status-specific logic
      const updateData: any = { status }

      if (notes) {
        updateData.notes = notes
      }

      if (status === 'CONFIRMED' && order.status === 'PENDING') {
        // Inventory already reserved during creation
      } else if (status === 'SHIPPED' && order.status === 'CONFIRMED') {
        updateData.shippedAt = new Date()
        // Deduct from inventory
        await prisma.$transaction(async (tx: any) => {
          for (const item of order.items) {
            await tx.inventoryLevel.update({
              where: { productId: item.productId },
              data: {
                currentQuantity: { decrement: item.quantity },
                reservedQuantity: { decrement: item.quantity },
              },
            })

            // Record sale transaction
            await tx.inventoryTransaction.create({
              data: {
                productId: item.productId,
                type: 'SALE',
                quantity: item.quantity,
                reference: order.orderNumber,
                notes: `Order ${order.orderNumber}`,
                createdBy: 'system',
              },
            })
          }
        })
      } else if (status === 'DELIVERED' && order.status === 'SHIPPED') {
        updateData.deliveredAt = new Date()
      } else if (status === 'CANCELLED') {
        // Release reserved inventory
        await prisma.$transaction(async (tx: any) => {
          for (const item of order.items) {
            await tx.inventoryLevel.update({
              where: { productId: item.productId },
              data: {
                reservedQuantity: { decrement: item.quantity },
                availableQuantity: { increment: item.quantity },
              },
            })
          }
        })
      } else if (status === 'RETURNED') {
        // Restore inventory
        await prisma.$transaction(async (tx: any) => {
          for (const item of order.items) {
            await tx.inventoryLevel.update({
              where: { productId: item.productId },
              data: {
                currentQuantity: { increment: item.quantity },
                availableQuantity: { increment: item.quantity },
              },
            })

            // Record return transaction
            await tx.inventoryTransaction.create({
              data: {
                productId: item.productId,
                type: 'RETURN',
                quantity: item.quantity,
                reference: order.orderNumber,
                notes: `Return for order ${order.orderNumber}`,
                createdBy: 'system',
              },
            })
          }
        })
      }

      const updatedOrder = await prisma.order.update({
        where: { id: request.params.id },
        data: updateData,
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      })

      return { success: true, data: updatedOrder }
    } catch (error) {
      if (error instanceof z.ZodError) {
        reply.status(400)
        return { success: false, error: 'Validation failed', details: error.issues }
      }
      reply.status(500)
      return { success: false, error: 'Internal server error' }
    }
  })

  // POST /api/orders/:id/items - Add items to existing order
  app.post<{ Params: { id: string } }>('/api/orders/:id/items', async (request, reply) => {
    try {
      const orderId = request.params.id
      const { productId, quantity, unitPrice } = OrderItemSchema.parse(request.body)

      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { items: true },
      })

      if (!order) {
        reply.status(404)
        return { success: false, error: 'Order not found' }
      }

      if (order.status !== 'PENDING') {
        reply.status(400)
        return { success: false, error: 'Can only add items to pending orders' }
      }

      // Validate product and inventory
      const product = await prisma.product.findUnique({
        where: { id: productId },
        include: { inventoryLevels: true },
      })

      if (!product || !product.isActive) {
        reply.status(400)
        return { success: false, error: 'Product not found or inactive' }
      }

      const inventoryLevel = product.inventoryLevels
      if (!inventoryLevel || inventoryLevel.availableQuantity < quantity) {
        reply.status(400)
        return { success: false, error: 'Insufficient inventory' }
      }

      const subtotal = quantity * unitPrice

      // Add item and update order total
      await prisma.$transaction(async (tx: any) => {
        await tx.orderItem.create({
          data: {
            orderId,
            productId,
            quantity,
            unitPrice,
            subtotal,
          },
        })

        await tx.order.update({
          where: { id: orderId },
          data: {
            totalAmount: { increment: subtotal },
          },
        })

        // Reserve inventory
        await tx.inventoryLevel.update({
          where: { productId },
          data: {
            reservedQuantity: { increment: quantity },
            availableQuantity: { decrement: quantity },
          },
        })
      })

      const updatedOrder = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      })

      return { success: true, data: updatedOrder }
    } catch (error) {
      if (error instanceof z.ZodError) {
        reply.status(400)
        return { success: false, error: 'Validation failed', details: error.issues }
      }
      reply.status(500)
      return { success: false, error: 'Internal server error' }
    }
  })

  // DELETE /api/orders/:id/items/:itemId - Remove item from order
  app.delete<{ Params: { id: string; itemId: string } }>('/api/orders/:id/items/:itemId', async (request, reply) => {
    try {
      const { id: orderId, itemId } = request.params

      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { items: true },
      })

      if (!order) {
        reply.status(404)
        return { success: false, error: 'Order not found' }
      }

      if (order.status !== 'PENDING') {
        reply.status(400)
        return { success: false, error: 'Can only remove items from pending orders' }
      }

      const item = order.items.find((i: any) => i.id === itemId)
      if (!item) {
        reply.status(404)
        return { success: false, error: 'Order item not found' }
      }

      // Remove item and update order total
      await prisma.$transaction(async (tx: any) => {
        await tx.orderItem.delete({
          where: { id: itemId },
        })

        await tx.order.update({
          where: { id: orderId },
          data: {
            totalAmount: { decrement: item.subtotal },
          },
        })

        // Release reserved inventory
        await tx.inventoryLevel.update({
          where: { productId: item.productId },
          data: {
            reservedQuantity: { decrement: item.quantity },
            availableQuantity: { increment: item.quantity },
          },
        })
      })

      const updatedOrder = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      })

      return { success: true, data: updatedOrder }
    } catch (error) {
      reply.status(500)
      return { success: false, error: 'Internal server error' }
    }
  })

  // GET /api/orders/summary - Get order summary report
  app.get('/api/orders/summary', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const summary = await prisma.order.groupBy({
        by: ['status'],
        _count: {
          id: true,
        },
        _sum: {
          totalAmount: true,
        },
      })

      const totalOrders = summary.reduce((sum: number, s: any) => sum + s._count.id, 0)
      const totalRevenue = summary.reduce((sum: number, s: any) => sum + (s._sum.totalAmount || 0), 0)
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

      const pendingOrders = summary.find((s: any) => s.status === 'PENDING')?._count.id || 0
      const deliveredOrders = summary.find((s: any) => s.status === 'DELIVERED')?._count.id || 0

      return {
        success: true,
        data: {
          totalOrders,
          totalRevenue,
          averageOrderValue,
          pendingOrders,
          deliveredOrders,
        },
      }
    } catch (error) {
      reply.status(500)
      return { success: false, error: 'Internal server error' }
    }
  })
}