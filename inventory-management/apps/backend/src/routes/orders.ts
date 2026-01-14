import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { AppDataSource, Order, OrderItem, Product, InventoryLevel, InventoryTransaction, TransactionType } from '@inventory/db'
import { Between, EntityManager } from 'typeorm'
import { CreateOrderRequestSchema, UpdateOrderStatusRequestSchema, OrderFiltersSchema } from '@inventory/contracts'

const OrderItemSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().positive(),
  unitPrice: z.number().positive(),
})

export async function orderRoutes(app: FastifyInstance) {
  // GET /api/orders/summary - Get order summary report (MUST be before parameterized routes)
  app.get('/api/orders/summary', {
    schema: {
      description: 'Get order summary statistics',
      tags: ['Orders'],
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const orderRepo = AppDataSource.getRepository(Order)
      const raw = await orderRepo
        .createQueryBuilder('order')
        .select('order.status', 'status')
        .addSelect('COUNT(order.id)', 'count')
        .addSelect('COALESCE(SUM(order.totalAmount),0)', 'sum')
        .groupBy('order.status')
        .getRawMany<{ status: string; count: string; sum: string }>()

      const totalOrders = raw.reduce((sum: number, s: any) => sum + Number(s.count), 0)
      const totalRevenue = raw.reduce((sum: number, s: any) => sum + Number(s.sum || 0), 0)
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

      const pendingOrders = Number(raw.find((s: any) => s.status === 'PENDING')?.count || 0)
      const deliveredOrders = Number(raw.find((s: any) => s.status === 'DELIVERED')?.count || 0)

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

  // POST /api/orders - Create new order
  app.post('/api/orders', {
    schema: {
      description: 'Create a new sales order',
      tags: ['Orders'],
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
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
        const product = await AppDataSource.getRepository(Product).findOne({
          where: { id: item.productId },
          relations: { inventoryLevels: true },
        })

        if (!product || !product.isActive) {
          reply.status(400)
          return { success: false, error: `Product ${item.productId} not found or inactive` }
        }

        const inventoryLevel = (product as any).inventoryLevels
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
      const order = await AppDataSource.transaction(async (manager: EntityManager) => {
        const orderDataToCreate: any = {
          orderNumber,
          customerName: orderData.customerName,
          totalAmount,
          createdBy: 'system',
        }

        if (orderData.customerId) orderDataToCreate.customerId = orderData.customerId
        if (orderData.customerEmail) orderDataToCreate.customerEmail = orderData.customerEmail
        if (orderData.customerPhone) orderDataToCreate.customerPhone = orderData.customerPhone
        if (orderData.shippingAddress) orderDataToCreate.shippingAddress = orderData.shippingAddress
        if (orderData.notes) orderDataToCreate.notes = orderData.notes

        const newOrder = manager.create(Order, orderDataToCreate)
        await manager.save(newOrder)

        for (const it of orderItems) {
          const oi = manager.create(OrderItem, { orderId: newOrder.id, productId: it.productId, quantity: it.quantity, unitPrice: it.unitPrice, subtotal: it.subtotal })
          await manager.save(oi)

          await manager
            .getRepository(InventoryLevel)
            .createQueryBuilder()
            .update(InventoryLevel)
            .set({
              reservedQuantity: () => `reserved_quantity + ${it.quantity}`,
              availableQuantity: () => `available_quantity - ${it.quantity}`,
            })
            .where('product_id = :pid', { pid: it.productId })
            .execute()
        }

        return manager.findOne(Order, { where: { id: newOrder.id }, relations: { items: { product: true } } })
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
  app.get('/api/orders', {
    schema: {
      description: 'Get paginated list of orders with optional filters',
      tags: ['Orders'],
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
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
        where.createdAt = Between(filters.startDate, filters.endDate)
      }

      const orderRepo = AppDataSource.getRepository(Order)
      const qb = orderRepo
        .createQueryBuilder('order')
        .leftJoinAndSelect('order.items', 'item')
        .leftJoinAndSelect('item.product', 'product')
        .orderBy('order.createdAt', 'DESC')

      if (where.status) qb.andWhere('order.status = :status', { status: where.status })
      if (where.customerId) qb.andWhere('order.customerId = :customerId', { customerId: where.customerId })
      if (where.createdAt) qb.andWhere('order.createdAt BETWEEN :start AND :end', { start: (where.createdAt as any).gte, end: (where.createdAt as any).lte })

      const [orders, total] = await qb
        .skip((filters.page - 1) * filters.pageSize)
        .take(filters.pageSize)
        .getManyAndCount()

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
  app.get<{ Params: { id: string } }>('/api/orders/:id', {
    schema: {
      description: 'Get a single order by ID',
      tags: ['Orders'],
    },
  }, async (request, reply) => {
    try {
      const order = await AppDataSource.getRepository(Order).findOne({
        where: { id: request.params.id },
        relations: { items: { product: true } },
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

  // PUT /api/orders/:id - Update order (proxy to status update per frontend expectation)
  app.put<{ Params: { id: string } }>('/api/orders/:id', {
    schema: {
      description: 'Update order status and details',
      tags: ['Orders'],
    },
  }, async (request, reply) => {
    // Delegate to status update logic using the same schema
    try {
      const { status, notes } = UpdateOrderStatusRequestSchema.parse(request.body)
      // Reuse handler by calling underlying repository logic similar to status route
      const order = await AppDataSource.getRepository(Order).findOne({ where: { id: request.params.id }, relations: { items: true } })

      if (!order) {
        reply.status(404)
        return { success: false, error: 'Order not found' }
      }

      const updateData: any = { status }
      if (notes) updateData.notes = notes

      if (status === 'CONFIRMED' && order.status === 'PENDING') {
        // inventory already reserved during creation
      } else if (status === 'SHIPPED' && order.status === 'CONFIRMED') {
        updateData.shippedAt = new Date()
        await AppDataSource.transaction(async (manager: EntityManager) => {
          for (const item of order.items as any[]) {
            await manager
              .getRepository(InventoryLevel)
              .createQueryBuilder()
              .update(InventoryLevel)
              .set({
                currentQuantity: () => `current_quantity - ${item.quantity}`,
                reservedQuantity: () => `reserved_quantity - ${item.quantity}`,
              })
              .where('product_id = :pid', { pid: item.productId })
              .execute()

            const invTx = manager.create(InventoryTransaction, {
              productId: item.productId,
              type: TransactionType.SALE,
              quantity: item.quantity,
              reference: order.orderNumber,
              notes: `Order ${order.orderNumber}`,
              createdBy: 'system',
            })
            await manager.save(invTx)
          }
        })
      } else if (status === 'DELIVERED' && order.status === 'SHIPPED') {
        updateData.deliveredAt = new Date()
      } else if (status === 'CANCELLED') {
        await AppDataSource.transaction(async (manager: EntityManager) => {
          for (const item of order.items as any[]) {
            await manager
              .getRepository(InventoryLevel)
              .createQueryBuilder()
              .update(InventoryLevel)
              .set({
                reservedQuantity: () => `reserved_quantity - ${item.quantity}`,
                availableQuantity: () => `available_quantity + ${item.quantity}`,
              })
              .where('product_id = :pid', { pid: item.productId })
              .execute()
          }
        })
      } else if (status === 'RETURNED') {
        await AppDataSource.transaction(async (manager: EntityManager) => {
          for (const item of order.items as any[]) {
            await manager
              .getRepository(InventoryLevel)
              .createQueryBuilder()
              .update(InventoryLevel)
              .set({
                currentQuantity: () => `current_quantity + ${item.quantity}`,
                availableQuantity: () => `available_quantity + ${item.quantity}`,
              })
              .where('product_id = :pid', { pid: item.productId })
              .execute()

            const invTx = manager.create(InventoryTransaction, {
              productId: item.productId,
              type: TransactionType.RETURN,
              quantity: item.quantity,
              reference: order.orderNumber,
              notes: `Return for order ${order.orderNumber}`,
              createdBy: 'system',
            })
            await manager.save(invTx)
          }
        })
      }

      await AppDataSource.getRepository(Order).update({ id: request.params.id }, updateData as any)
      const updatedOrder = await AppDataSource.getRepository(Order).findOne({ where: { id: request.params.id }, relations: { items: { product: true } } })
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

  // PUT /api/orders/:id/status - Update order status
  app.put<{ Params: { id: string } }>('/api/orders/:id/status', {
    schema: {
      description: 'Update order status',
      tags: ['Orders'],
    },
  }, async (request, reply) => {
    try {
      const { status, notes } = UpdateOrderStatusRequestSchema.parse(request.body)

      const order = await AppDataSource.getRepository(Order).findOne({ where: { id: request.params.id }, relations: { items: true } })

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
        await AppDataSource.transaction(async (manager: EntityManager) => {
          for (const item of order.items as any[]) {
            await manager
              .getRepository(InventoryLevel)
              .createQueryBuilder()
              .update(InventoryLevel)
              .set({
                currentQuantity: () => `current_quantity - ${item.quantity}`,
                reservedQuantity: () => `reserved_quantity - ${item.quantity}`,
              })
              .where('product_id = :pid', { pid: item.productId })
              .execute()

            const invTx = manager.create(InventoryTransaction, {
              productId: item.productId,
              type: TransactionType.SALE,
              quantity: item.quantity,
              reference: order.orderNumber,
              notes: `Order ${order.orderNumber}`,
              createdBy: 'system',
            })
            await manager.save(invTx)
          }
        })
      } else if (status === 'DELIVERED' && order.status === 'SHIPPED') {
        updateData.deliveredAt = new Date()
      } else if (status === 'CANCELLED') {
        // Release reserved inventory
        await AppDataSource.transaction(async (manager: EntityManager) => {
          for (const item of order.items as any[]) {
            await manager
              .getRepository(InventoryLevel)
              .createQueryBuilder()
              .update(InventoryLevel)
              .set({
                reservedQuantity: () => `reserved_quantity - ${item.quantity}`,
                availableQuantity: () => `available_quantity + ${item.quantity}`,
              })
              .where('product_id = :pid', { pid: item.productId })
              .execute()
          }
        })
      } else if (status === 'RETURNED') {
        // Restore inventory
        await AppDataSource.transaction(async (manager: EntityManager) => {
          for (const item of order.items as any[]) {
            await manager
              .getRepository(InventoryLevel)
              .createQueryBuilder()
              .update(InventoryLevel)
              .set({
                currentQuantity: () => `current_quantity + ${item.quantity}`,
                availableQuantity: () => `available_quantity + ${item.quantity}`,
              })
              .where('product_id = :pid', { pid: item.productId })
              .execute()

            const invTx = manager.create(InventoryTransaction, {
              productId: item.productId,
              type: TransactionType.RETURN,
              quantity: item.quantity,
              reference: order.orderNumber,
              notes: `Return for order ${order.orderNumber}`,
              createdBy: 'system',
            })
            await manager.save(invTx)
          }
        })
      }

      await AppDataSource.getRepository(Order).update({ id: request.params.id }, updateData as any)
      const updatedOrder = await AppDataSource.getRepository(Order).findOne({ where: { id: request.params.id }, relations: { items: { product: true } } })

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
  app.post<{ Params: { id: string } }>('/api/orders/:id/items', {
    schema: {
      description: 'Add items to an existing order',
      tags: ['Orders'],
    },
  }, async (request, reply) => {
    try {
      const orderId = request.params.id
      const { productId, quantity, unitPrice } = OrderItemSchema.parse(request.body)

      const order = await AppDataSource.getRepository(Order).findOne({ where: { id: orderId }, relations: { items: true } })

      if (!order) {
        reply.status(404)
        return { success: false, error: 'Order not found' }
      }

      if (order.status !== 'PENDING') {
        reply.status(400)
        return { success: false, error: 'Can only add items to pending orders' }
      }

      // Validate product and inventory
      const product = await AppDataSource.getRepository(Product).findOne({ where: { id: productId }, relations: { inventoryLevels: true } })

      if (!product || !product.isActive) {
        reply.status(400)
        return { success: false, error: 'Product not found or inactive' }
      }

      const inventoryLevel = (product as any).inventoryLevels
      if (!inventoryLevel || inventoryLevel.availableQuantity < quantity) {
        reply.status(400)
        return { success: false, error: 'Insufficient inventory' }
      }

      const subtotal = quantity * unitPrice

      // Add item and update order total
      await AppDataSource.transaction(async (manager: EntityManager) => {
        const oi = manager.create(OrderItem, { orderId, productId, quantity, unitPrice, subtotal })
        await manager.save(oi)

        await manager
          .getRepository(Order)
          .createQueryBuilder()
          .update(Order)
          .set({ totalAmount: () => `total_amount + ${subtotal}` })
          .where('id = :id', { id: orderId })
          .execute()

        await manager
          .getRepository(InventoryLevel)
          .createQueryBuilder()
          .update(InventoryLevel)
          .set({
            reservedQuantity: () => `reserved_quantity + ${quantity}`,
            availableQuantity: () => `available_quantity - ${quantity}`,
          })
          .where('product_id = :pid', { pid: productId })
          .execute()
      })

      const updatedOrder = await AppDataSource.getRepository(Order).findOne({ where: { id: orderId }, relations: { items: { product: true } } })

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
  app.delete<{ Params: { id: string; itemId: string } }>('/api/orders/:id/items/:itemId', {
    schema: {
      description: 'Remove an item from an order',
      tags: ['Orders'],
    },
  }, async (request, reply) => {
    try {
      const { id: orderId, itemId } = request.params

      const order = await AppDataSource.getRepository(Order).findOne({ where: { id: orderId }, relations: { items: true } })

      if (!order) {
        reply.status(404)
        return { success: false, error: 'Order not found' }
      }

      if (order.status !== 'PENDING') {
        reply.status(400)
        return { success: false, error: 'Can only remove items from pending orders' }
      }

      const item = (order.items as any[]).find((i: any) => i.id === itemId)
      if (!item) {
        reply.status(404)
        return { success: false, error: 'Order item not found' }
      }

      // Remove item and update order total
      await AppDataSource.transaction(async (manager: EntityManager) => {
        await manager.delete(OrderItem, { id: itemId })

        await manager
          .getRepository(Order)
          .createQueryBuilder()
          .update(Order)
          .set({ totalAmount: () => `total_amount - ${item.subtotal}` })
          .where('id = :id', { id: orderId })
          .execute()

        await manager
          .getRepository(InventoryLevel)
          .createQueryBuilder()
          .update(InventoryLevel)
          .set({
            reservedQuantity: () => `reserved_quantity - ${item.quantity}`,
            availableQuantity: () => `available_quantity + ${item.quantity}`,
          })
          .where('product_id = :pid', { pid: item.productId })
          .execute()
      })

      const updatedOrder = await AppDataSource.getRepository(Order).findOne({ where: { id: orderId }, relations: { items: { product: true } } })

      return { success: true, data: updatedOrder }
    } catch (error) {
      reply.status(500)
      return { success: false, error: 'Internal server error' }
    }
  })
}