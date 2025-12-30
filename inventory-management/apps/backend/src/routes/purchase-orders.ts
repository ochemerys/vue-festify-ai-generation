import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { prisma } from '@inventory/db'

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
  app.post('/api/purchase-orders', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const poData = CreatePurchaseOrderRequestSchema.parse(request.body)

      // Generate PO number
      const poNumber = `PO-${Date.now()}`

      // Calculate total amount
      let totalAmount = 0
      const poItems = []

      for (const item of poData.items) {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
        })

        if (!product || !product.isActive) {
          reply.status(400)
          return { success: false, error: `Product ${item.productId} not found or inactive` }
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
      const supplier = await prisma.supplier.findUnique({
        where: { id: poData.supplierId },
      })

      if (!supplier || !supplier.isActive) {
        reply.status(400)
        return { success: false, error: 'Supplier not found or inactive' }
      }

      const purchaseOrder = await prisma.purchaseOrder.create({
        data: {
          poNumber,
          supplierId: poData.supplierId,
          totalAmount,
          expectedDate: poData.expectedDate,
          notes: poData.notes ?? null,
          items: {
            create: poItems,
          },
        },
        include: {
          supplier: true,
          items: true,
        },
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
  app.get('/api/purchase-orders', async (request: FastifyRequest, reply: FastifyReply) => {
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
        where.createdAt = {
          gte: filters.startDate,
          lte: filters.endDate,
        }
      }

      const [purchaseOrders, total] = await Promise.all([
        prisma.purchaseOrder.findMany({
          where,
          include: {
            supplier: true,
            items: true,
          },
          skip: (filters.page - 1) * filters.pageSize,
          take: filters.pageSize,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.purchaseOrder.count({ where }),
      ])

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
  app.get<{ Params: { id: string } }>('/api/purchase-orders/:id', async (request, reply) => {
    try {
      const purchaseOrder = await prisma.purchaseOrder.findUnique({
        where: { id: request.params.id },
        include: {
          supplier: true,
          items: true,
          receipts: true,
        },
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
  app.put<{ Params: { id: string } }>('/api/purchase-orders/:id/status', async (request, reply) => {
    try {
      const { status } = request.body as { status: string }

      const validStatuses = ['DRAFT', 'SUBMITTED', 'CONFIRMED', 'PARTIALLY_RECEIVED', 'RECEIVED', 'CANCELLED']
      if (!validStatuses.includes(status)) {
        reply.status(400)
        return { success: false, error: 'Invalid status' }
      }

      const purchaseOrder = await prisma.purchaseOrder.findUnique({
        where: { id: request.params.id },
        include: { items: true },
      })

      if (!purchaseOrder) {
        reply.status(404)
        return { success: false, error: 'Purchase order not found' }
      }

      const updateData: any = { status }

      if (status === 'RECEIVED') {
        updateData.receivedDate = new Date()
      }

      const updatedPO = await prisma.purchaseOrder.update({
        where: { id: request.params.id },
        data: updateData,
        include: {
          supplier: true,
          items: true,
        },
      })

      return { success: true, data: updatedPO }
    } catch (error) {
      reply.status(500)
      return { success: false, error: 'Internal server error' }
    }
  })

  // PUT /api/purchase-orders/:id/expected-date - Update expected date
  app.put<{ Params: { id: string } }>('/api/purchase-orders/:id/expected-date', async (request, reply) => {
    try {
      const { expectedDate } = request.body as { expectedDate: string }

      const updatedPO = await prisma.purchaseOrder.update({
        where: { id: request.params.id },
        data: { expectedDate: new Date(expectedDate) },
        include: {
          supplier: true,
          items: true,
        },
      })

      return { success: true, data: updatedPO }
    } catch (error) {
      if ((error as any).code === 'P2025') {
        reply.status(404)
        return { success: false, error: 'Purchase order not found' }
      }
      reply.status(500)
      return { success: false, error: 'Internal server error' }
    }
  })

  // POST /api/purchase-orders/:id/receive - Receive goods
  app.post<{ Params: { id: string } }>('/api/purchase-orders/:id/receive', async (request, reply) => {
    try {
      const poId = request.params.id
      const receiptData = GoodsReceiptRequestSchema.parse(request.body)

      const purchaseOrder = await prisma.purchaseOrder.findUnique({
        where: { id: poId },
        include: { items: true },
      })

      if (!purchaseOrder) {
        reply.status(404)
        return { success: false, error: 'Purchase order not found' }
      }

      if (purchaseOrder.status === 'RECEIVED' || purchaseOrder.status === 'CANCELLED') {
        reply.status(400)
        return { success: false, error: 'Cannot receive goods for this purchase order' }
      }

      // Validate received quantities don't exceed ordered
      for (const receivedItem of receiptData.items) {
        const poItem = purchaseOrder.items.find((item: any) => item.productId === receivedItem.productId)
        if (!poItem) {
          reply.status(400)
          return { success: false, error: `Product ${receivedItem.productId} not in purchase order` }
        }

        if (poItem.receivedQuantity + receivedItem.quantity > poItem.quantity) {
          reply.status(400)
          return { success: false, error: `Cannot receive more than ordered quantity for product ${receivedItem.productId}` }
        }
      }

      // Create goods receipt and update inventory
      await prisma.$transaction(async (tx: any) => {
        // Create goods receipt
        const receipt = await tx.goodsReceipt.create({
          data: {
            purchaseOrderId: poId,
            notes: receiptData.notes,
          },
        })

        // Update received quantities and inventory
        for (const receivedItem of receiptData.items) {
          const poItem = purchaseOrder.items.find((item: any) => item.productId === receivedItem.productId)!

          // Update PO item received quantity
          await tx.purchaseOrderItem.update({
            where: { id: poItem.id },
            data: {
              receivedQuantity: { increment: receivedItem.quantity },
            },
          })

          // Update inventory
          await tx.inventoryLevel.update({
            where: { productId: receivedItem.productId },
            data: {
              currentQuantity: { increment: receivedItem.quantity },
              availableQuantity: { increment: receivedItem.quantity },
              lastRestockDate: new Date(),
            },
          })

          // Record purchase transaction
          await tx.inventoryTransaction.create({
            data: {
              productId: receivedItem.productId,
              type: 'PURCHASE',
              quantity: receivedItem.quantity,
              reference: purchaseOrder.poNumber,
              notes: `PO ${purchaseOrder.poNumber} - Receipt ${receipt.receiptNumber}`,
              createdBy: 'system',
            },
          })
        }

        // Update PO status
        const totalReceived = purchaseOrder.items.reduce((sum: number, item: any) => {
          const receivedItem = receiptData.items.find((ri: any) => ri.productId === item.productId)
          return sum + (receivedItem ? receivedItem.quantity : 0) + item.receivedQuantity
        }, 0)

        const totalOrdered = purchaseOrder.items.reduce((sum: number, item: any) => sum + item.quantity, 0)

        let newStatus = purchaseOrder.status
        if (totalReceived === totalOrdered) {
          newStatus = 'RECEIVED'
        } else if (totalReceived > 0) {
          newStatus = 'PARTIALLY_RECEIVED'
        }

        await tx.purchaseOrder.update({
          where: { id: poId },
          data: { status: newStatus },
        })
      })

      const updatedPO = await prisma.purchaseOrder.findUnique({
        where: { id: poId },
        include: {
          supplier: true,
          items: true,
          receipts: true,
        },
      })

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
  app.get('/api/purchase-orders/summary', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const summary = await prisma.purchaseOrder.groupBy({
        by: ['status'],
        _count: {
          id: true,
        },
        _sum: {
          totalAmount: true,
        },
      })

      const totalPOs = summary.reduce((sum: number, s: any) => sum + s._count.id, 0)
      const totalSpend = summary.reduce((sum: number, s: any) => sum + (s._sum.totalAmount || 0), 0)
      const averagePOValue = totalPOs > 0 ? totalSpend / totalPOs : 0

      const receivedPOs = summary.find((s: any) => s.status === 'RECEIVED')?._count.id || 0
      const pendingPOs = summary.filter((s: any) => ['DRAFT', 'SUBMITTED', 'CONFIRMED', 'PARTIALLY_RECEIVED'].includes(s.status))
        .reduce((sum: number, s: any) => sum + s._count.id, 0)

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
  app.get('/api/purchase-orders/supplier-performance', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const supplierPerformance = await prisma.purchaseOrder.groupBy({
        by: ['supplierId'],
        where: {
          status: 'RECEIVED',
        },
        _count: {
          id: true,
        },
        _sum: {
          totalAmount: true,
        },
        _avg: {
          // Note: This would need a custom calculation for delivery days
          // For now, we'll return basic metrics
        },
      })

      // Get supplier details
      const performanceWithSuppliers = await Promise.all(
        supplierPerformance.map(async (perf: any) => {
          const supplier = await prisma.supplier.findUnique({
            where: { id: perf.supplierId },
            select: { name: true },
          })

          return {
            supplierId: perf.supplierId,
            supplierName: supplier?.name || 'Unknown',
            totalOrders: perf._count.id,
            totalSpend: perf._sum.totalAmount || 0,
            // avgDeliveryDays would need additional calculation
          }
        })
      )

      return { success: true, data: performanceWithSuppliers }
    } catch (error) {
      reply.status(500)
      return { success: false, error: 'Internal server error' }
    }
  })
}