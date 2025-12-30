import { randomUUID } from 'crypto'
import { prisma } from '@inventory/db'

/**
 * Generate unique test identifier
 */
export function generateTestId(): string {
  return randomUUID().slice(0, 8)
}

/**
 * Generate unique SKU for testing
 */
export function generateTestSKU(prefix: string = 'TEST'): string {
  const testId = generateTestId()
  return `${prefix}-${testId}`
}

/**
 * Create test product
 */
export async function createTestProduct(overrides?: Partial<{
  sku: string
  name: string
  description: string
  category: string
  price: number
  cost: number
  reorderLevel: number
  supplier: string
  isActive: boolean
}>) {
  const testId = generateTestId()
  
  const product = await prisma.product.create({
    data: {
      sku: overrides?.sku || `TEST-PROD-${testId}`,
      name: overrides?.name || `Test Product ${testId}`,
      description: overrides?.description || 'Test product description',
      category: overrides?.category || 'Electronics',
      price: overrides?.price || 29.99,
      cost: overrides?.cost || 12.50,
      reorderLevel: overrides?.reorderLevel || 10,
      supplier: overrides?.supplier || 'Test Supplier Inc',
      isActive: overrides?.isActive !== undefined ? overrides.isActive : true,
    },
  })

  // Create inventory level
  await prisma.inventoryLevel.create({
    data: {
      productId: product.id,
      currentQuantity: 0,
      reservedQuantity: 0,
      availableQuantity: 0,
    },
  })

  return product
}

/**
 * Create test supplier
 */
export async function createTestSupplier(overrides?: Partial<{
  name: string
  email: string
  phone: string
  contactPerson: string
  isActive: boolean
}>) {
  const testId = generateTestId()
  
  return await prisma.supplier.create({
    data: {
      name: overrides?.name || `Test Supplier ${testId}`,
      email: overrides?.email || `supplier-${testId}@test.com`,
      phone: overrides?.phone || '555-0100',
      contactPerson: overrides?.contactPerson || 'Test Contact',
      isActive: overrides?.isActive !== undefined ? overrides.isActive : true,
    },
  })
}

/**
 * Create test order
 */
export async function createTestOrder(
  productIds: string[],
  overrides?: Partial<{
    customerId: string
    customerName: string
    customerEmail: string
    status: string
    shippingAddress: string
    createdBy: string
  }>
) {
  const testId = generateTestId()
  
  // Get products to calculate total
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
  })

  const items = products.map((product: any) => ({
    productId: product.id,
    quantity: 1,
    unitPrice: product.price,
    subtotal: product.price,
  }))

  const totalAmount = items.reduce((sum: number, item: any) => sum + item.subtotal, 0)

  return await prisma.order.create({
    data: {
      orderNumber: `TEST-ORD-${testId}`,
      customerId: overrides?.customerId || `cust-${testId}`,
      customerName: overrides?.customerName || `Test Customer ${testId}`,
      customerEmail: overrides?.customerEmail || `customer-${testId}@test.com`,
      status: (overrides?.status as any) || 'PENDING',
      totalAmount,
      shippingAddress: overrides?.shippingAddress || '123 Test St, Test City',
      createdBy: overrides?.createdBy || 'test-user',
      items: {
        create: items,
      },
    },
    include: {
      items: true,
    },
  })
}

/**
 * Set inventory level for a product
 */
export async function setInventoryLevel(
  productId: string,
  levels: {
    currentQuantity?: number
    reservedQuantity?: number
    availableQuantity?: number
  }
) {
  const currentQuantity = levels.currentQuantity ?? 0
  const reservedQuantity = levels.reservedQuantity ?? 0
  const availableQuantity = levels.availableQuantity ?? (currentQuantity - reservedQuantity)

  return await prisma.inventoryLevel.upsert({
    where: { productId },
    update: {
      currentQuantity,
      reservedQuantity,
      availableQuantity,
    },
    create: {
      productId,
      currentQuantity,
      reservedQuantity,
      availableQuantity,
    },
  })
}

/**
 * Create test purchase order
 */
export async function createTestPurchaseOrder(
  supplierId: string,
  productIds: string[],
  overrides?: Partial<{
    status: string
    expectedDate: Date
    notes: string
  }>
) {
  const testId = generateTestId()
  
  // Get products to calculate total
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
  })

  const items = products.map((product: any) => ({
    productId: product.id,
    quantity: 10,
    unitPrice: product.cost,
    subtotal: product.cost * 10,
  }))

  const totalAmount = items.reduce((sum: number, item: any) => sum + item.subtotal, 0)

  return await prisma.purchaseOrder.create({
    data: {
      poNumber: `TEST-PO-${testId}`,
      supplierId,
      status: (overrides?.status as any) || 'DRAFT',
      totalAmount,
      expectedDate: overrides?.expectedDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      notes: overrides?.notes ?? null,
      items: {
        create: items,
      },
    },
    include: {
      items: true,
      supplier: true,
    },
  })
}

/**
 * Clean up test data
 */
export async function cleanupTestData() {
  try {
    // Try to check if database is available by attempting a simple query
    await prisma.$queryRaw`SELECT 1`

    // Find test orders first
    const testOrders = await prisma.order.findMany({
      where: {
        orderNumber: {
          startsWith: 'TEST-',
        },
      },
      select: { id: true },
    })
    const testOrderIds = testOrders.map((o) => o.id)

    // Find test purchase orders
    const testPOs = await prisma.purchaseOrder.findMany({
      where: {
        poNumber: {
          startsWith: 'TEST-',
        },
      },
      select: { id: true },
    })
    const testPOIds = testPOs.map((po) => po.id)

    // Find test products
    const testProducts = await prisma.product.findMany({
      where: {
        sku: {
          startsWith: 'TEST-',
        },
      },
      select: { id: true },
    })
    const testProductIds = testProducts.map((p) => p.id)

    // Delete in order to respect foreign key constraints
    if (testOrderIds.length > 0) {
      await prisma.orderItem.deleteMany({
        where: {
          orderId: {
            in: testOrderIds,
          },
        },
      })

      await prisma.order.deleteMany({
        where: {
          id: {
            in: testOrderIds,
          },
        },
      })
    }

    if (testPOIds.length > 0) {
      await prisma.purchaseOrderItem.deleteMany({
        where: {
          purchaseOrderId: {
            in: testPOIds,
          },
        },
      })

      await prisma.goodsReceipt.deleteMany({
        where: {
          purchaseOrderId: {
            in: testPOIds,
          },
        },
      })

      await prisma.purchaseOrder.deleteMany({
        where: {
          id: {
            in: testPOIds,
          },
        },
      })
    }

    // Delete inventory transactions
    await prisma.inventoryTransaction.deleteMany({
      where: {
        reference: {
          startsWith: 'TEST-',
        },
      },
    })

    // Delete stock alerts for test products
    if (testProductIds.length > 0) {
      await prisma.stockAlert.deleteMany({
        where: {
          productId: {
            in: testProductIds,
          },
        },
      })

      await prisma.inventoryLevel.deleteMany({
        where: {
          productId: {
            in: testProductIds,
          },
        },
      })
    }

    // Delete test products
    await prisma.product.deleteMany({
      where: {
        sku: {
          startsWith: 'TEST-',
        },
      },
    })

    // Delete test suppliers
    await prisma.supplier.deleteMany({
      where: {
        name: {
          startsWith: 'Test Supplier',
        },
      },
    })

    // Delete test users
    await prisma.user.deleteMany({
      where: {
        email: {
          contains: 'test-',
        },
      },
    })
  } catch (error) {
    // Database not available or connection failed - skip cleanup
    // This is expected for unit tests that don't need database
    console.log('Database not available - skipping cleanup')
  }
}
