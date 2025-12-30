import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { prisma } from '@inventory/db'

const DateRangeSchema = z.object({
  startDate: z.string().transform(str => new Date(str)).optional(),
  endDate: z.string().transform(str => new Date(str)).optional(),
})

export async function reportRoutes(app: FastifyInstance) {
  // GET /api/reports/inventory-summary - Inventory summary report
  app.get('/api/reports/inventory-summary', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const products = await prisma.product.findMany({
        where: { isActive: true },
        include: { inventoryLevels: true },
      })

      const totalProducts = products.length
      const totalQuantity = products.reduce((sum: number, p: any) => sum + (p.inventoryLevels?.currentQuantity || 0), 0)
      const totalValue = products.reduce((sum: number, p: any) => sum + ((p.inventoryLevels?.currentQuantity || 0) * p.price), 0)
      const averageValue = totalProducts > 0 ? totalValue / totalProducts : 0

      // Low stock items (quantity <= reorder level)
      const lowStockItems = products.filter((p: any) =>
        p.inventoryLevels && p.inventoryLevels.currentQuantity <= p.reorderLevel
      )

      // Out of stock items
      const outOfStockItems = products.filter((p: any) =>
        p.inventoryLevels && p.inventoryLevels.currentQuantity === 0
      )

      return {
        success: true,
        data: {
          totalProducts,
          totalQuantity,
          totalValue,
          averageValue,
          lowStockCount: lowStockItems.length,
          outOfStockCount: outOfStockItems.length,
          lowStockItems: lowStockItems.map((p: any) => ({
            sku: p.sku,
            name: p.name,
            currentQuantity: p.inventoryLevels?.currentQuantity || 0,
            reorderLevel: p.reorderLevel,
          })),
          outOfStockItems: outOfStockItems.map((p: any) => ({
            sku: p.sku,
            name: p.name,
          })),
        },
      }
    } catch (error) {
      reply.status(500)
      return { success: false, error: 'Internal server error' }
    }
  })

  // GET /api/reports/low-stock - Low stock report
  app.get('/api/reports/low-stock', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const lowStockProducts = await prisma.product.findMany({
        where: {
          isActive: true,
          inventoryLevels: {
            // Compare against a constant threshold here; dynamic per-product reorderLevel comparison
            // isn't supported directly via field refs on related models in Prisma queries
            currentQuantity: {
              lte: 0,
            },
          },
        },
        include: { inventoryLevels: true },
        orderBy: { inventoryLevels: { currentQuantity: 'asc' } },
      })

      const reportData = lowStockProducts.map((product: any) => ({
        productId: product.id,
        sku: product.sku,
        name: product.name,
        currentQuantity: product.inventoryLevels?.currentQuantity || 0,
        reorderLevel: product.reorderLevel,
        status: (product.inventoryLevels?.currentQuantity || 0) === 0 ? 'OUT_OF_STOCK' : 'LOW_STOCK',
      }))

      return {
        success: true,
        data: reportData,
        total: reportData.length,
      }
    } catch (error) {
      reply.status(500)
      return { success: false, error: 'Internal server error' }
    }
  })

  // GET /api/reports/sales - Sales report
  app.get('/api/reports/sales', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { startDate, endDate } = DateRangeSchema.parse(request.query)

      const where: any = {
        status: 'DELIVERED',
      }

      if (startDate && endDate) {
        where.createdAt = {
          gte: startDate,
          lte: endDate,
        }
      }

      const orders = await prisma.order.findMany({
        where,
        include: { items: true },
      })

      const totalOrders = orders.length
      const totalRevenue = orders.reduce((sum: number, order: any) => sum + order.totalAmount, 0)
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

      const completedOrders = orders.length
      const pendingOrders = await prisma.order.count({
        where: { status: 'PENDING' },
      })

      // Group by date for time series
      const ordersByDate = orders.reduce((acc: Record<string, { count: number; revenue: number }>, order: any) => {
        const date = order.createdAt.toISOString().split('T')[0]
        if (!acc[date]) {
          acc[date] = { count: 0, revenue: 0 }
        }
        acc[date].count++
        acc[date].revenue += order.totalAmount
        return acc
      }, {} as Record<string, { count: number; revenue: number }>)

      return {
        success: true,
        data: {
          totalOrders,
          completedOrders,
          totalRevenue,
          averageOrderValue,
          pendingRevenue: 0, // Would need to calculate from pending orders
          ordersByDate,
        },
        period: startDate && endDate ? { startDate, endDate } : 'all',
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

  // GET /api/reports/inventory-movement - Inventory movement report
  app.get('/api/reports/inventory-movement', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { startDate, endDate } = DateRangeSchema.parse(request.query)

      const where: any = {}
      if (startDate && endDate) {
        where.createdAt = {
          gte: startDate,
          lte: endDate,
        }
      }

      const transactions = await prisma.inventoryTransaction.findMany({
        where,
        include: { product: true },
      })

      const summary = transactions.reduce((acc: any, transaction: any) => {
        switch (transaction.type) {
          case 'PURCHASE':
            acc.totalPurchases += transaction.quantity
            break
          case 'SALE':
            acc.totalSales += transaction.quantity
            break
          case 'ADJUSTMENT':
            acc.totalAdjustments += transaction.quantity
            break
          case 'RETURN':
            acc.totalReturns += transaction.quantity
            break
        }
        return acc
      }, {
        totalPurchases: 0,
        totalSales: 0,
        totalAdjustments: 0,
        totalReturns: 0,
      })

      summary.netMovement = summary.totalPurchases + summary.totalAdjustments + summary.totalReturns - summary.totalSales

      return {
        success: true,
        data: summary,
        period: startDate && endDate ? { startDate, endDate } : 'all',
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

  // GET /api/reports/product-performance - Product performance report
  app.get('/api/reports/product-performance', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { startDate, endDate } = DateRangeSchema.parse(request.query)

      // Get all products with their sales data
      const products = await prisma.product.findMany({
        where: { isActive: true },
        include: {
          orderItems: {
            include: {
              order: true,
            },
          },
        },
      })

      const productPerformance = products.map((product: any) => {
        const relevantOrderItems = product.orderItems.filter((item: any) => {
          if (!startDate || !endDate) return true
          return item.order.createdAt >= startDate && item.order.createdAt <= endDate
        })

        const unitsSold = relevantOrderItems.reduce((sum: number, item: any) => sum + item.quantity, 0)
        const revenue = relevantOrderItems.reduce((sum: number, item: any) => sum + item.subtotal, 0)

        return {
          productId: product.id,
          sku: product.sku,
          name: product.name,
          unitsSold,
          revenue,
        }
      }).sort((a: any, b: any) => b.revenue - a.revenue)

      // Add ranking
      productPerformance.forEach((product: any, index: number) => {
        (product as any).rank = index + 1
      })

      return {
        success: true,
        data: productPerformance,
        period: startDate && endDate ? { startDate, endDate } : 'all',
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

  // GET /api/reports/dashboard - Dashboard metrics
  app.get('/api/reports/dashboard', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      // Get inventory metrics
      const products = await prisma.product.findMany({
        where: { isActive: true },
        include: { inventoryLevels: true },
      })

      const totalProducts = products.length
      const lowStockItems = products.filter((p: any) =>
        p.inventoryLevels && p.inventoryLevels.currentQuantity <= p.reorderLevel
      ).length
      const outOfStockItems = products.filter((p: any) =>
        p.inventoryLevels && p.inventoryLevels.currentQuantity === 0
      ).length
      const totalInventoryValue = products.reduce((sum: number, p: any) =>
        sum + ((p.inventoryLevels?.currentQuantity || 0) * p.price), 0
      )

      // Get order metrics
      const pendingOrders = await prisma.order.count({
        where: { status: 'PENDING' },
      })

      const recentOrders = await prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          orderNumber: true,
          customerName: true,
          totalAmount: true,
          status: true,
          createdAt: true,
        },
      })

      // Get low stock alerts
      const lowStockAlerts = await prisma.stockAlert.findMany({
        where: { isResolved: false },
        include: { product: true },
        take: 5,
        orderBy: { createdAt: 'desc' },
      })

      return {
        success: true,
        data: {
          inventory: {
            totalProducts,
            lowStockItems,
            outOfStockItems,
            totalInventoryValue,
          },
          orders: {
            pendingOrders,
            recentOrders,
          },
          alerts: {
            lowStockAlerts: lowStockAlerts.map((alert: any) => ({
              id: alert.id,
              productName: alert.product.name,
              sku: alert.product.sku,
              currentQuantity: alert.currentQuantity,
              reorderLevel: alert.reorderLevel,
              alertType: alert.alertType,
            })),
          },
        },
      }
    } catch (error) {
      reply.status(500)
      return { success: false, error: 'Internal server error' }
    }
  })

  // GET /api/reports/:type/export - Export report
  app.get<{ Params: { type: string } }>('/api/reports/:type/export', async (request, reply) => {
    try {
      const { type } = request.params
      const format = (request.query as any).format || 'json'

      let data: any = {}
      let filename = ''

      switch (type) {
        case 'inventory-summary':
          const inventoryData = await getInventorySummaryData()
          data = inventoryData
          filename = 'inventory-summary'
          break
        case 'sales':
          const salesData = await getSalesReportData(request.query)
          data = salesData
          filename = 'sales-report'
          break
        default:
          reply.status(400)
          return { success: false, error: 'Unknown report type' }
      }

      if (format === 'csv') {
        // Convert to CSV (simplified implementation)
        const csv = convertToCSV(data)
        reply.header('Content-Type', 'text/csv')
        reply.header('Content-Disposition', `attachment; filename="${filename}.csv"`)
        return csv
      } else {
        // Return JSON
        reply.header('Content-Type', 'application/json')
        reply.header('Content-Disposition', `attachment; filename="${filename}.json"`)
        return data
      }
    } catch (error) {
      reply.status(500)
      return { success: false, error: 'Internal server error' }
    }
  })
}

// Helper functions for report data
async function getInventorySummaryData() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    include: { inventoryLevels: true },
  })

  return products.map((p: any) => ({
    sku: p.sku,
    name: p.name,
    category: p.category,
    currentQuantity: p.inventoryLevels?.currentQuantity || 0,
    reorderLevel: p.reorderLevel,
    value: (p.inventoryLevels?.currentQuantity || 0) * p.price,
  }))
}

async function getSalesReportData(query: any) {
  const { startDate, endDate } = DateRangeSchema.parse(query)

  const where: any = { status: 'DELIVERED' }
  if (startDate && endDate) {
    where.createdAt = { gte: startDate, lte: endDate }
  }

  const orders = await prisma.order.findMany({
    where,
    include: { items: { include: { product: true } } },
  })

  return orders.map((order: any) => ({
    orderNumber: order.orderNumber,
    customerName: order.customerName,
    totalAmount: order.totalAmount,
    status: order.status,
    createdAt: order.createdAt,
    items: order.items.map((item: any) => ({
      productName: item.product.name,
      sku: item.product.sku,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      subtotal: item.subtotal,
    })),
  }))
}

function convertToCSV(data: any): string {
  if (!Array.isArray(data) || data.length === 0) {
    return 'No data available'
  }

  const headers = Object.keys(data[0])
  const csvRows = [
    headers.join(','),
    ...data.map((row: any) =>
      headers.map((header: string) => JSON.stringify(row[header] || '')).join(',')
    ),
  ]

  return csvRows.join('\n')
}