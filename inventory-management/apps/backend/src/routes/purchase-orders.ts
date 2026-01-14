import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { AppDataSource, Product, Supplier, PurchaseOrder, PurchaseOrderItem, GoodsReceipt, InventoryLevel, InventoryTransaction, PurchaseOrderStatus, TransactionType } from '@inventory/db'
import { Between, EntityManager } from 'typeorm'

const CreatePurchaseOrderRequestSchema = z.object({
  supplierId: z.string(),
  expectedDate: z.string().transform(str => new Date(str)),
  notes: z.string().optional(),
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().int().positive(),
    unitPrice: z.number().positive(),
  })).min(1),
})

const PurchaseOrderFiltersSchema = z.object({
  status: z.enum(['DRAFT', 'SUBMITTED', 'CONFIRMED', 'PARTIALLY_RECEIVED', 'RECEIVED', 'CANCELLED']).optional(),
  supplierId: z.string().optional(),
  startDate: z.string().transform(str => new Date(str)).optional(),
  endDate: z.string().transform(str => new Date(str)).optional(),
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().default(10),
})

const GoodsReceiptRequestSchema = z.object({
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().int().positive(),
  })).min(1),
  notes: z.string().optional(),
})

export async function purchaseOrderRoutes(app: FastifyInstance) {
  // POST /api/purchase-orders - Create purchase order
  app.post('/api/purchase-orders', {
    schema: {
      description: 'Create a new purchase order',
      tags: ['Purchase Orders'],
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const poData = CreatePurchaseOrderRequestSchema.parse(request.body)

      // Generate PO number
      const poNumber = `PO-${Date.now()}`

      const purchaseOrder = await AppDataSource.transaction(async (manager: EntityManager) => {
        // Calculate total amount
        let totalAmount = 0
        const poItems = []

        for (const item of poData.items) {
          const product = await manager.findOne(Product, { where: { id: item.productId } })

          if (!product || !(product as any).isActive) {
            reply.status(400)
            throw new Error(`Product ${item.productId} not found or inactive`)
          }

          const subtotal = item.quantity * item.unitPrice
          totalAmount += subtotal

          poItems.push({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            subtotal,
          })
        }

        // Validate supplier exists
        const supplier = await manager.findOne(Supplier, { where: { id: poData.supplierId } })

        if (!supplier || !(supplier as any).isActive) {
          reply.status(400)
          throw new Error('Supplier not found or inactive')
        }

        const createData: any = {
          poNumber,
          supplierId: poData.supplierId,
          totalAmount,
          expectedDate: poData.expectedDate,
        }
        if (poData.notes) {
          createData.notes = poData.notes
        }
        const po = manager.create(PurchaseOrder, createData)
        await manager.save(po)

        for (const item of poItems) {
          const poItem = manager.create(PurchaseOrderItem, {
            purchaseOrderId: (po as any).id,
            ...item,
          })
          await manager.save(poItem)
        }

        return manager.findOne(PurchaseOrder, { where: { id: (po as any).id }, relations: ['supplier', 'items'] })
      })

      reply.status(201)
      return { success: true, data: purchaseOrder }
    } catch (error) {
      if (error instanceof z.ZodError) {
        reply.status(400)
        return { success: false, error: 'Validation failed', details: error.issues }
      }
      reply.status(500)
      return { success: false, error: 'Internal server error' }
    }
  })

  // GET /api/purchase-orders - List purchase orders
  app.get('/api/purchase-orders', {
    schema: {
      description: 'Get paginated list of purchase orders with optional filters',
      tags: ['Purchase Orders'],
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const filters = PurchaseOrderFiltersSchema.parse(request.query)

      const where: any = {}

      if (filters.status) {
        where.status = filters.status
      }

      if (filters.supplierId) {
        where.supplierId = filters.supplierId
      }

      if (filters.startDate && filters.endDate) {
        where.createdAt = Between(filters.startDate, filters.endDate)
      }

      const poRepo = AppDataSource.getRepository(PurchaseOrder)
      const qb = poRepo.createQueryBuilder('po')
        .leftJoinAndSelect('po.supplier', 'supplier')
        .leftJoinAndSelect('po.items', 'items')
        .orderBy('po.createdAt', 'DESC')

      if (filters.status) {
        qb.andWhere('po.status = :status', { status: filters.status })
      }
      if (filters.supplierId) {
        qb.andWhere('po.supplierId = :supplierId', { supplierId: filters.supplierId })
      }
      if (filters.startDate && filters.endDate) {
        qb.andWhere('po.createdAt BETWEEN :startDate AND :endDate', { startDate: filters.startDate, endDate: filters.endDate })
      }

      const [purchaseOrders, total] = await qb
        .skip((filters.page - 1) * filters.pageSize)
        .take(filters.pageSize)
        .getManyAndCount()

      return {
        success: true,
        data: purchaseOrders,
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

  // GET /api/purchase-orders/:id - Get purchase order by ID
  app.get<{ Params: { id: string } }>('/api/purchase-orders/:id', {
    schema: {
      description: 'Get a single purchase order by ID',
      tags: ['Purchase Orders'],
    },
  }, async (request, reply) => {
    try {
      const purchaseOrder = await AppDataSource.getRepository(PurchaseOrder).findOne({
        where: { id: request.params.id },
        relations: ['supplier', 'items', 'receipts'],
      })

      if (!purchaseOrder) {
        reply.status(404)
        return { success: false, error: 'Purchase order not found' }
      }

      return { success: true, data: purchaseOrder }
    } catch (error) {
      reply.status(500)
      return { success: false, error: 'Internal server error' }
    }
  })

  // PUT /api/purchase-orders/:id/status - Update PO status
  app.put<{ Params: { id: string } }>('/api/purchase-orders/:id/status', {
    schema: {
      description: 'Update purchase order status',
      tags: ['Purchase Orders'],
    },
  }, async (request, reply) => {
    try {
      const { status } = request.body as { status: string }

      const validStatuses = ['DRAFT', 'SUBMITTED', 'CONFIRMED', 'PARTIALLY_RECEIVED', 'RECEIVED', 'CANCELLED']
      if (!validStatuses.includes(status)) {
        reply.status(400)
        return { success: false, error: 'Invalid status' }
      }

      const poRepo = AppDataSource.getRepository(PurchaseOrder)
      const purchaseOrder = await poRepo.findOne({ where: { id: request.params.id }, relations: ['items'] })

      if (!purchaseOrder) {
        reply.status(404)
        return { success: false, error: 'Purchase order not found' }
      }

      const updateData: any = { status: status as PurchaseOrderStatus }

      if (status === 'RECEIVED') {
        updateData.receivedDate = new Date()
      }

      await poRepo.update({ id: request.params.id }, updateData)

      const updatedPO = await poRepo.findOne({ where: { id: request.params.id }, relations: ['supplier', 'items'] })

      return { success: true, data: updatedPO }
    } catch (error) {
      reply.status(500)
      return { success: false, error: 'Internal server error' }
    }
  })

  // PUT /api/purchase-orders/:id/expected-date - Update expected date
  app.put<{ Params: { id: string } }>('/api/purchase-orders/:id/expected-date', {
    schema: {
      description: 'Update purchase order expected delivery date',
      tags: ['Purchase Orders'],
    },
  }, async (request, reply) => {
    try {
      const { expectedDate } = request.body as { expectedDate: string }

      const poRepo = AppDataSource.getRepository(PurchaseOrder)
      const result = await poRepo.update({ id: request.params.id }, { expectedDate: new Date(expectedDate) })

      if (result.affected === 0) {
        reply.status(404)
        return { success: false, error: 'Purchase order not found' }
      }

      const updatedPO = await poRepo.findOne({ where: { id: request.params.id }, relations: ['supplier', 'items'] })

      return { success: true, data: updatedPO }
    } catch (error) {
      reply.status(500)
      return { success: false, error: 'Internal server error' }
    }
  })

  // POST /api/purchase-orders/:id/receive - Receive goods
  app.post<{ Params: { id: string } }>('/api/purchase-orders/:id/receive', {
    schema: {
      description: 'Record goods receipt for a purchase order',
      tags: ['Purchase Orders'],
    },
  }, async (request, reply) => {
    try {
      const poId = request.params.id
      const receiptData = GoodsReceiptRequestSchema.parse(request.body)

      await AppDataSource.transaction(async (manager: EntityManager) => {
        const poRepo = manager.getRepository(PurchaseOrder)
        const purchaseOrder = await poRepo.findOne({ where: { id: poId }, relations: ['items'] })

        if (!purchaseOrder) {
          reply.status(404)
          throw new Error('Purchase order not found')
        }

        if (purchaseOrder.status === PurchaseOrderStatus.RECEIVED || purchaseOrder.status === PurchaseOrderStatus.CANCELLED) {
          reply.status(400)
          throw new Error('Cannot receive goods for this purchase order')
        }

        // Validate received quantities don't exceed ordered
        for (const receivedItem of receiptData.items) {
          const poItem = purchaseOrder.items.find((item) => item.productId === receivedItem.productId)
          if (!poItem) {
            reply.status(400)
            throw new Error(`Product ${receivedItem.productId} not in purchase order`)
          }

          if (poItem.receivedQuantity + receivedItem.quantity > poItem.quantity) {
            reply.status(400)
            throw new Error(`Cannot receive more than ordered quantity for product ${receivedItem.productId}`)
          }
        }

        // Create goods receipt
        const receiptDataToCreate: any = { purchaseOrderId: poId }
        if (receiptData.notes) {
          receiptDataToCreate.notes = receiptData.notes
        }
        const receipt = manager.create(GoodsReceipt, receiptDataToCreate)
        await manager.save(receipt)

        // Update received quantities and inventory
        for (const receivedItem of receiptData.items) {
          const poItem = purchaseOrder.items.find((item) => item.productId === receivedItem.productId)!

          // Update PO item received quantity
          await manager.update(PurchaseOrderItem, { id: (poItem as any).id }, { receivedQuantity: () => `receivedQuantity + ${receivedItem.quantity}` })

          // Update inventory
          await manager.update(InventoryLevel, { productId: receivedItem.productId }, {
            currentQuantity: () => `currentQuantity + ${receivedItem.quantity}`,
            availableQuantity: () => `availableQuantity + ${receivedItem.quantity}`,
            lastRestockDate: new Date(),
          })

          // Record purchase transaction
          const invTx = manager.create(InventoryTransaction, {
            productId: receivedItem.productId,
            type: TransactionType.PURCHASE,
            quantity: receivedItem.quantity,
            reference: purchaseOrder.poNumber,
            notes: `PO ${purchaseOrder.poNumber} - Receipt ${(receipt as any).id}`,
            createdBy: 'system',
          })
          await manager.save(invTx)
        }

        // Update PO status
        const updatedPoItems = await manager.find(PurchaseOrderItem, { where: { purchaseOrderId: poId } })
        const totalReceived = updatedPoItems.reduce((sum, item) => sum + (item as any).receivedQuantity, 0)
        const totalOrdered = updatedPoItems.reduce((sum, item) => sum + (item as any).quantity, 0)

        let newStatus: PurchaseOrderStatus = purchaseOrder.status
        if (totalReceived === totalOrdered) {
          newStatus = PurchaseOrderStatus.RECEIVED
        } else if (totalReceived > 0) {
          newStatus = PurchaseOrderStatus.PARTIALLY_RECEIVED
        }

        await poRepo.update({ id: poId }, { status: newStatus })
      })

      const updatedPO = await AppDataSource.getRepository(PurchaseOrder).findOne({ where: { id: poId }, relations: ['supplier', 'items', 'receipts'] })

      return { success: true, data: updatedPO }
    } catch (error) {
      if (error instanceof z.ZodError) {
        reply.status(400)
        return { success: false, error: 'Validation failed', details: error.issues }
      }
      reply.status(500)
      return { success: false, error: 'Internal server error' }
    }
  })

  // GET /api/purchase-orders/summary - Get PO summary report
  app.get('/api/purchase-orders/summary', {
    schema: {
      description: 'Get purchase order summary statistics',
      tags: ['Purchase Orders'],
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const poRepo = AppDataSource.getRepository(PurchaseOrder)
      const summary = await poRepo.createQueryBuilder('po')
        .select('po.status', 'status')
        .addSelect('COUNT(po.id)', 'count')
        .addSelect('SUM(po.totalAmount)', 'total')
        .groupBy('po.status')
        .getRawMany()

      const totalPOs = summary.reduce((sum, s) => sum + Number(s.count), 0)
      const totalSpend = summary.reduce((sum, s) => sum + Number(s.total) || 0, 0)
      const averagePOValue = totalPOs > 0 ? totalSpend / totalPOs : 0

      const receivedPOs = Number(summary.find(s => s.status === 'RECEIVED')?.count || 0)
      const pendingPOs = summary
        .filter(s => ['DRAFT', 'SUBMITTED', 'CONFIRMED', 'PARTIALLY_RECEIVED'].includes(s.status))
        .reduce((sum, s) => sum + Number(s.count), 0)

      return {
        success: true,
        data: {
          totalPOs,
          totalSpend,
          averagePOValue,
          receivedPOs,
          pendingPOs,
        },
      }
    } catch (error) {
      reply.status(500)
      return { success: false, error: 'Internal server error' }
    }
  })

  // GET /api/purchase-orders/supplier-performance - Get supplier performance report
  app.get('/api/purchase-orders/supplier-performance', {
    schema: {
      description: 'Get supplier performance metrics',
      tags: ['Purchase Orders'],
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const poRepo = AppDataSource.getRepository(PurchaseOrder)
      const supplierPerformance = await poRepo.createQueryBuilder('po')
        .select('po.supplierId', 'supplierId')
        .addSelect('s.name', 'supplierName')
        .addSelect('COUNT(po.id)', 'totalOrders')
        .addSelect('SUM(po.totalAmount)', 'totalSpend')
        .innerJoin(Supplier, 's', 's.id = po.supplierId')
        .where('po.status = :status', { status: PurchaseOrderStatus.RECEIVED })
        .groupBy('po.supplierId, s.name')
        .getRawMany()

      return { success: true, data: supplierPerformance }
    } catch (error) {
      reply.status(500)
      return { success: false, error: 'Internal server error' }
    }
  })
}