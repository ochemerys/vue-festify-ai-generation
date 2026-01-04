import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { AppDataSource, InventoryLevel, InventoryTransaction, StockAlert, Product } from '@inventory/db'

const TransactionSchema = z.object({
  productId: z.string(),
  type: z.enum(['PURCHASE', 'SALE', 'ADJUSTMENT', 'RETURN', 'DAMAGE', 'TRANSFER']),
  quantity: z.number().int(),
  reference: z.string(),
  notes: z.string().optional(),
})

const ReserveInventorySchema = z.object({
  productId: z.string(),
  quantity: z.number().int().positive(),
})

export async function inventoryRoutes(app: FastifyInstance) {
  // POST /api/inventory/transactions - Record inventory transaction
  app.post('/api/inventory/transactions', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const transactionData = TransactionSchema.parse(request.body)

      // Get current inventory level
      const inventoryRepository = AppDataSource.getRepository(InventoryLevel)
      const inventoryLevel = await inventoryRepository.findOne({
        where: { productId: transactionData.productId },
      })

      if (!inventoryLevel) {
        reply.status(404)
        return { success: false, error: 'Product inventory not found' }
      }

      // Calculate new quantity based on transaction type
      let quantityChange = 0
      switch (transactionData.type) {
        case 'PURCHASE':
        case 'RETURN':
          quantityChange = transactionData.quantity
          break
        case 'SALE':
        case 'DAMAGE':
          quantityChange = -transactionData.quantity
          break
        case 'ADJUSTMENT':
          quantityChange = transactionData.quantity
          break
      }

      const newQuantity = inventoryLevel.currentQuantity + quantityChange

      // Check if we have enough inventory for sales
      if (transactionData.type === 'SALE') {
        const availableQuantity = inventoryLevel.currentQuantity - inventoryLevel.reservedQuantity
        if (transactionData.quantity > availableQuantity) {
          reply.status(400)
          return { success: false, error: 'Insufficient available inventory' }
        }
      }

      // Create transaction and update inventory level in a transaction
      await AppDataSource.transaction(async (manager) => {
        const transactionRepository = manager.getRepository(InventoryTransaction)
        const inventoryLevelRepository = manager.getRepository(InventoryLevel)

        const transaction = transactionRepository.create({
          ...transactionData,
          notes: transactionData.notes ?? undefined,
          createdBy: 'system', // TODO: Get from auth context
        })
        await transactionRepository.save(transaction)

        await inventoryLevelRepository.update(
          { productId: transactionData.productId },
          {
            currentQuantity: newQuantity,
            availableQuantity: newQuantity - inventoryLevel.reservedQuantity,
          }
        )

        return transaction
      })

      reply.status(201)
      return { success: true, data: { message: 'Transaction recorded successfully' } }
    } catch (error) {
      if (error instanceof z.ZodError) {
        reply.status(400)
        return { success: false, error: 'Validation failed', details: error.issues }
      }
      reply.status(500)
      return { success: false, error: 'Internal server error' }
    }
  })

  // GET /api/inventory/transactions/product/:productId - Get transaction history
  app.get<{ Params: { productId: string } }>(
    '/api/inventory/transactions/product/:productId',
    async (request, reply) => {
      try {
        const transactionRepository = AppDataSource.getRepository(InventoryTransaction)
        const transactions = await transactionRepository.find({
          where: { productId: request.params.productId },
          order: { createdAt: 'ASC' },
          relations: ['product'],
        })

        return { success: true, data: transactions }
      } catch (error) {
        reply.status(500)
        return { success: false, error: 'Internal server error' }
      }
    }
  )

  // GET /api/inventory/levels/:productId - Get inventory level
  app.get<{ Params: { productId: string } }>(
    '/api/inventory/levels/:productId',
    async (request, reply) => {
      try {
        const inventoryRepository = AppDataSource.getRepository(InventoryLevel)
        const inventoryLevel = await inventoryRepository.findOne({
          where: { productId: request.params.productId },
          relations: ['product'],
        })

        if (!inventoryLevel) {
          reply.status(404)
          return { success: false, error: 'Inventory level not found' }
        }

        return { success: true, data: inventoryLevel }
      } catch (error) {
        reply.status(500)
        return { success: false, error: 'Internal server error' }
      }
    }
  )

  // POST /api/inventory/levels - Create/Update inventory level
  app.post('/api/inventory/levels', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const data = request.body as any
      const inventoryRepository = AppDataSource.getRepository(InventoryLevel)

      // Check if inventory level exists
      let inventoryLevel = await inventoryRepository.findOne({
        where: { productId: data.productId },
      })

      if (inventoryLevel) {
        // Update existing
        await inventoryRepository.update(
          { productId: data.productId },
          {
            currentQuantity: data.currentQuantity ?? inventoryLevel.currentQuantity,
            reservedQuantity: data.reservedQuantity ?? inventoryLevel.reservedQuantity,
            availableQuantity: data.availableQuantity ?? inventoryLevel.availableQuantity,
          }
        )
        inventoryLevel = await inventoryRepository.findOne({
          where: { productId: data.productId },
        })
      } else {
        // Create new
        inventoryLevel = inventoryRepository.create({
          productId: data.productId,
          currentQuantity: data.currentQuantity || 0,
          reservedQuantity: data.reservedQuantity || 0,
          availableQuantity: data.availableQuantity || 0,
        })
        await inventoryRepository.save(inventoryLevel)
      }

      return { success: true, data: inventoryLevel }
    } catch (error) {
      reply.status(500)
      return { success: false, error: 'Internal server error' }
    }
  })

  // POST /api/inventory/reserve - Reserve inventory
  app.post('/api/inventory/reserve', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { productId, quantity } = ReserveInventorySchema.parse(request.body)

      const inventoryRepository = AppDataSource.getRepository(InventoryLevel)
      const inventoryLevel = await inventoryRepository.findOne({
        where: { productId },
      })

      if (!inventoryLevel) {
        reply.status(404)
        return { success: false, error: 'Product inventory not found' }
      }

      const availableQuantity = inventoryLevel.currentQuantity - inventoryLevel.reservedQuantity
      if (quantity > availableQuantity) {
        reply.status(400)
        return { success: false, error: 'Insufficient available inventory' }
      }

      await inventoryRepository.update(
        { productId },
        {
          reservedQuantity: inventoryLevel.reservedQuantity + quantity,
          availableQuantity: availableQuantity - quantity,
        }
      )

      const updated = await inventoryRepository.findOne({
        where: { productId },
      })

      return { success: true, data: updated }
    } catch (error) {
      if (error instanceof z.ZodError) {
        reply.status(400)
        return { success: false, error: 'Validation failed', details: error.issues }
      }
      reply.status(500)
      return { success: false, error: 'Internal server error' }
    }
  })

  // POST /api/inventory/release - Release reserved inventory
  app.post('/api/inventory/release', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { productId } = request.body as any

      const inventoryLevel = await prisma.inventoryLevel.findUnique({
        where: { productId },
      })

      if (!inventoryLevel) {
        reply.status(404)
        return { success: false, error: 'Product inventory not found' }
      }

      const updated = await prisma.inventoryLevel.update({
        where: { productId },
        data: {
          reservedQuantity: 0,
          availableQuantity: inventoryLevel.currentQuantity,
        },
      })

      return { success: true, data: updated }
    } catch (error) {
      reply.status(500)
      return { success: false, error: 'Internal server error' }
    }
  })

  // GET /api/inventory/alerts/product/:productId - Get stock alerts
  app.get<{ Params: { productId: string } }>(
    '/api/inventory/alerts/product/:productId',
    async (request, reply) => {
      try {
        const alerts = await prisma.stockAlert.findMany({
          where: { 
            productId: request.params.productId,
            isResolved: false,
          },
          include: {
            product: true,
          },
          orderBy: { createdAt: 'desc' },
        })

        return { success: true, data: alerts }
      } catch (error) {
        reply.status(500)
        return { success: false, error: 'Internal server error' }
      }
    }
  )

  // GET /api/inventory/levels/:productId/total - Get total inventory
  app.get<{ Params: { productId: string } }>(
    '/api/inventory/levels/:productId/total',
    async (request, reply) => {
      try {
        const inventoryLevel = await prisma.inventoryLevel.findUnique({
          where: { productId: request.params.productId },
        })

        if (!inventoryLevel) {
          reply.status(404)
          return { success: false, error: 'Inventory level not found' }
        }

        return { 
          success: true, 
          data: { 
            totalQuantity: inventoryLevel.currentQuantity,
            reservedQuantity: inventoryLevel.reservedQuantity,
            availableQuantity: inventoryLevel.availableQuantity,
          } 
        }
      } catch (error) {
        reply.status(500)
        return { success: false, error: 'Internal server error' }
      }
    }
  )
}
