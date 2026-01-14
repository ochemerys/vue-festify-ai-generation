import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { AppDataSource, InventoryLevel, InventoryTransaction, StockAlert, Product } from '@inventory/db'

const TransactionSchema = z.object({
  productId: z.string(),
  type: z.enum(['PURCHASE', 'SALE', 'ADJUSTMENT', 'RETURN', 'DAMAGE', 'TRANSFER']),
  quantity: z.number().int().positive(),
  reference: z.string(),
  notes: z.string().optional(),
})

const ReserveInventorySchema = z.object({
  productId: z.string(),
  quantity: z.number().int().positive(),
})

export async function inventoryRoutes(app: FastifyInstance) {
  // POST /api/inventory/transactions - Record inventory transaction
  app.post('/api/inventory/transactions', {
    schema: {
      description: 'Record an inventory transaction',
      tags: ['Inventory'],
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
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

        const data: any = {
          productId: transactionData.productId,
          type: transactionData.type as any,
          quantity: transactionData.quantity,
          reference: transactionData.reference,
          createdBy: 'system', // TODO: Get from auth context
        }
        if (transactionData.notes !== undefined) {
          data.notes = transactionData.notes
        }
        const transaction = transactionRepository.create(data)
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
    {
      schema: {
        description: 'Get transaction history for a product',
        tags: ['Inventory'],
      },
    },
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

  // GET /api/inventory - List inventory levels (frontend expects paginated; simple list for now)
  app.get('/api/inventory', {
    schema: {
      description: 'Get list of all inventory levels',
      tags: ['Inventory'],
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const inventoryRepository = AppDataSource.getRepository(InventoryLevel)
      const items = await inventoryRepository.find({ order: { updatedAt: 'DESC' } })
      return { success: true, data: items, pagination: { page: 1, pageSize: items.length, total: items.length, totalPages: 1 }, timestamp: new Date().toISOString() }
    } catch (error) {
      reply.status(500)
      return { success: false, error: 'Internal server error' }
    }
  })

  // GET /api/inventory/product/:productId - Get inventory for specific product
  app.get<{ Params: { productId: string } }>('/api/inventory/product/:productId', {
    schema: {
      description: 'Get inventory level for a specific product',
      tags: ['Inventory'],
    },
  }, async (request, reply) => {
    try {
      const inventoryRepository = AppDataSource.getRepository(InventoryLevel)
      const inventoryLevel = await inventoryRepository.findOne({ where: { productId: request.params.productId } })
      if (!inventoryLevel) {
        reply.status(404)
        return { success: false, error: 'Inventory level not found' }
      }
      return { success: true, data: inventoryLevel }
    } catch (error) {
      reply.status(500)
      return { success: false, error: 'Internal server error' }
    }
  })

  // POST /api/inventory/adjust - Adjust inventory (frontend adjusts with type IN/OUT/ADJUSTMENT -> map to contract types)
  app.post('/api/inventory/adjust', {
    schema: {
      description: 'Adjust inventory for a product',
      tags: ['Inventory'],
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const body = request.body as any
      const mapType = (t: string) => {
        if (t === 'IN') return 'PURCHASE'
        if (t === 'OUT') return 'SALE'
        if (t === 'ADJUSTMENT') return 'ADJUSTMENT'
        return 'ADJUSTMENT'
      }
      const parsed = TransactionSchema.parse({
        productId: body.productId,
        type: mapType(body.type),
        quantity: body.quantity,
        reference: body.reference ?? 'Manual Adjustment',
        notes: body.reason ?? body.notes,
      })

      const inventoryRepository = AppDataSource.getRepository(InventoryLevel)
      const inventoryLevel = await inventoryRepository.findOne({ where: { productId: parsed.productId } })
      if (!inventoryLevel) {
        reply.status(404)
        return { success: false, error: 'Product inventory not found' }
      }

      // Reuse the transaction creation logic by invoking the /transactions handler logic inline
      // Calculate new quantity
      let quantityChange = 0
      switch (parsed.type) {
        case 'PURCHASE':
        case 'RETURN':
          quantityChange = parsed.quantity
          break
        case 'SALE':
        case 'DAMAGE':
          quantityChange = -parsed.quantity
          break
        case 'ADJUSTMENT':
          quantityChange = parsed.quantity
          break
      }
      const newQuantity = inventoryLevel.currentQuantity + quantityChange

      if (parsed.type === 'SALE') {
        const availableQuantity = inventoryLevel.currentQuantity - inventoryLevel.reservedQuantity
        if (parsed.quantity > availableQuantity) {
          reply.status(400)
          return { success: false, error: 'Insufficient available inventory' }
        }
      }

      await AppDataSource.transaction(async (manager) => {
        const transactionRepository = manager.getRepository(InventoryTransaction)
        const inventoryLevelRepository = manager.getRepository(InventoryLevel)

        const txData: any = {
          productId: parsed.productId,
          type: parsed.type as any,
          quantity: parsed.quantity,
          reference: parsed.reference,
          createdBy: 'system',
        }
        if (parsed.notes !== undefined) {
          txData.notes = parsed.notes
        }
        const tx = transactionRepository.create(txData)
        await transactionRepository.save(tx)

        await inventoryLevelRepository.update(
          { productId: parsed.productId },
          {
            currentQuantity: newQuantity,
            availableQuantity: newQuantity - inventoryLevel.reservedQuantity,
          }
        )
      })

      reply.status(201)
      return { success: true, data: { message: 'Inventory adjusted' } }
    } catch (error) {
      if (error instanceof z.ZodError) {
        reply.status(400)
        return { success: false, error: 'Validation failed', details: error.issues }
      }
      reply.status(500)
      return { success: false, error: 'Internal server error' }
    }
  })

  // GET /api/inventory/levels/:productId - Get inventory level
  app.get<{ Params: { productId: string } }>(
    '/api/inventory/levels/:productId',
    {
      schema: {
        description: 'Get inventory level for a product',
        tags: ['Inventory'],
      },
    },
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
  app.post('/api/inventory/levels', {
    schema: {
      description: 'Create or update inventory level for a product',
      tags: ['Inventory'],
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
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
  app.post('/api/inventory/reserve', {
    schema: {
      description: 'Reserve inventory for a product',
      tags: ['Inventory'],
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
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
  app.post('/api/inventory/release', {
    schema: {
      description: 'Release reserved inventory for a product',
      tags: ['Inventory'],
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { productId } = request.body as any

      const inventoryRepository = AppDataSource.getRepository(InventoryLevel)
      const inventoryLevel = await inventoryRepository.findOne({
        where: { productId },
      })

      if (!inventoryLevel) {
        reply.status(404)
        return { success: false, error: 'Product inventory not found' }
      }

      await inventoryRepository.update(
        { productId },
        {
          reservedQuantity: 0,
          availableQuantity: inventoryLevel.currentQuantity,
        }
      )

      const updated = await inventoryRepository.findOne({
        where: { productId },
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
    {
      schema: {
        description: 'Get stock alerts for a product',
        tags: ['Inventory'],
      },
    },
    async (request, reply) => {
      try {
        const alertRepository = AppDataSource.getRepository(StockAlert)
        const alerts = await alertRepository.find({
          where: { 
            productId: request.params.productId,
            isResolved: false,
          },
          relations: ['product'],
          order: { createdAt: 'DESC' },
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
    {
      schema: {
        description: 'Get total inventory quantities for a product',
        tags: ['Inventory'],
      },
    },
    async (request, reply) => {
      try {
        const inventoryRepository = AppDataSource.getRepository(InventoryLevel)
        const inventoryLevel = await inventoryRepository.findOne({
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
