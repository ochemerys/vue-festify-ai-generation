import { randomUUID } from 'crypto'
import { In, Like } from 'typeorm'
import { AppDataSource, Product, Supplier, Order, OrderItem, PurchaseOrder, PurchaseOrderItem, InventoryLevel, InventoryTransaction, StockAlert, User, GoodsReceipt } from '@inventory/db'

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

  const productRepository = AppDataSource.getRepository(Product)
  const inventoryRepository = AppDataSource.getRepository(InventoryLevel)

  const product = productRepository.create({
    sku: overrides?.sku || `TEST-PROD-${testId}`,
    name: overrides?.name || `Test Product ${testId}`,
    description: overrides?.description || 'Test product description',
    category: overrides?.category || 'Electronics',
    price: overrides?.price || 29.99,
    cost: overrides?.cost || 12.50,
    reorderLevel: overrides?.reorderLevel || 10,
    supplier: overrides?.supplier || 'Test Supplier Inc',
    isActive: overrides?.isActive !== undefined ? overrides.isActive : true,
  })

  await productRepository.save(product)

  // Create inventory level
  const inventoryLevel = inventoryRepository.create({
    productId: product.id,
    currentQuantity: 0,
    reservedQuantity: 0,
    availableQuantity: 0,
  })
  await inventoryRepository.save(inventoryLevel)

  return product
}

/**
 * Create test supplier
 */
export async function createTestSupplier(overrides?: Partial<{
  name: string
  email: string
  phone: string
  contactName: string
  isActive: boolean
}>) {
  const testId = generateTestId()

  const supplierRepository = AppDataSource.getRepository(Supplier)
  const supplier = supplierRepository.create({
    name: overrides?.name || `Test Supplier ${testId}`,
    email: overrides?.email || `supplier-${testId}@test.com`,
    phone: overrides?.phone || '555-0100',
    contactName: overrides?.contactName || 'Test Contact',
    isActive: overrides?.isActive !== undefined ? overrides.isActive : true,
  })

  return await supplierRepository.save(supplier)
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

  const productRepo = AppDataSource.getRepository(Product)
  const orderRepo = AppDataSource.getRepository(Order)
  const orderItemRepo = AppDataSource.getRepository(OrderItem)

  // Get products to calculate total
  const products = await productRepo.find({
    where: { id: In(productIds) },
  })

  const items = products.map((product: any) => ({
    productId: product.id,
    quantity: 1,
    unitPrice: product.price,
    subtotal: product.price,
  }))

  const totalAmount = items.reduce((sum: number, item: any) => sum + item.subtotal, 0)

  const order = orderRepo.create({
    orderNumber: `TEST-ORD-${testId}`,
    customerId: overrides?.customerId || `cust-${testId}`,
    customerName: overrides?.customerName || `Test Customer ${testId}`,
    customerEmail: overrides?.customerEmail || `customer-${testId}@test.com`,
    status: (overrides?.status as any) || 'PENDING',
    totalAmount,
    shippingAddress: overrides?.shippingAddress || '123 Test St, Test City',
    createdBy: overrides?.createdBy || 'test-user',
  })

  const savedOrder = await orderRepo.save(order)

  // Create order items
  const orderItems = items.map(item => orderItemRepo.create({
    ...item,
    orderId: savedOrder.id,
  }))
  await orderItemRepo.save(orderItems)

  return {
    ...savedOrder,
    items: orderItems,
  }
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

  const inventoryRepo = AppDataSource.getRepository(InventoryLevel)

  const existing = await inventoryRepo.findOne({ where: { productId } })
  if (existing) {
    existing.currentQuantity = currentQuantity
    existing.reservedQuantity = reservedQuantity
    existing.availableQuantity = availableQuantity
    return await inventoryRepo.save(existing)
  } else {
    const newLevel = inventoryRepo.create({
      productId,
      currentQuantity,
      reservedQuantity,
      availableQuantity,
    })
    return await inventoryRepo.save(newLevel)
  }
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

  const productRepo = AppDataSource.getRepository(Product)
  const poRepo = AppDataSource.getRepository(PurchaseOrder)
  const poItemRepo = AppDataSource.getRepository(PurchaseOrderItem)
  const supplierRepo = AppDataSource.getRepository(Supplier)

  // Get products to calculate total
  const products = await productRepo.find({
    where: { id: In(productIds) },
  })

  const items = products.map((product: any) => ({
    productId: product.id,
    quantity: 10,
    unitPrice: product.cost,
    subtotal: product.cost * 10,
  }))

  const totalAmount = items.reduce((sum: number, item: any) => sum + item.subtotal, 0)

  const poData = {
    poNumber: `TEST-PO-${testId}`,
    supplierId,
    status: (overrides?.status as any) || 'DRAFT',
    totalAmount,
    expectedDate: overrides?.expectedDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    createdBy: 'test-user',
  } as any

  if (overrides?.notes !== undefined) {
    poData.notes = overrides.notes
  }

  const po = poRepo.create(poData)

  const savedPOResult = await poRepo.save(po)
  const savedPO = Array.isArray(savedPOResult) ? savedPOResult[0]! : savedPOResult

  // Create PO items
  const poItems = items.map(item => poItemRepo.create({
    ...item,
    purchaseOrderId: savedPO.id,
  }))
  await poItemRepo.save(poItems)

  // Get supplier
  const supplier = await supplierRepo.findOne({ where: { id: supplierId } })

  return {
    ...savedPO,
    items: poItems,
    supplier,
  }
}

/**
 * Clean up test data
 */
export async function cleanupTestData() {
  try {
    // Try to check if database is available by attempting a simple query
    await AppDataSource.query('SELECT 1')

    const orderRepo = AppDataSource.getRepository(Order)
    const orderItemRepo = AppDataSource.getRepository(OrderItem)
    const poRepo = AppDataSource.getRepository(PurchaseOrder)
    const poItemRepo = AppDataSource.getRepository(PurchaseOrderItem)
    const goodsReceiptRepo = AppDataSource.getRepository(GoodsReceipt)
    const inventoryTransactionRepo = AppDataSource.getRepository(InventoryTransaction)
    const stockAlertRepo = AppDataSource.getRepository(StockAlert)
    const inventoryLevelRepo = AppDataSource.getRepository(InventoryLevel)
    const productRepo = AppDataSource.getRepository(Product)
    const supplierRepo = AppDataSource.getRepository(Supplier)
    const userRepo = AppDataSource.getRepository(User)

    // Find test orders first
    const testOrders = await orderRepo.createQueryBuilder('order')
      .select('order.id')
      .where('order.orderNumber LIKE :pattern', { pattern: 'TEST-%' })
      .getMany()
    const testOrderIds = testOrders.map((o: any) => o.id)

    // Find test purchase orders
    const testPOs = await poRepo.createQueryBuilder('po')
      .select('po.id')
      .where('po.poNumber LIKE :pattern', { pattern: 'TEST-%' })
      .getMany()
    const testPOIds = testPOs.map((po: any) => po.id)

    // Find test products
    const testProducts = await productRepo.createQueryBuilder('product')
      .select('product.id')
      .where('product.sku LIKE :pattern', { pattern: 'TEST-%' })
      .getMany()
    const testProductIds = testProducts.map((p: any) => p.id)

    // Delete in order to respect foreign key constraints
    if (testOrderIds.length > 0) {
      await orderItemRepo.delete({ orderId: In(testOrderIds) })
      await orderRepo.delete({ id: In(testOrderIds) })
    }

    if (testPOIds.length > 0) {
      await poItemRepo.delete({ purchaseOrderId: In(testPOIds) })
      await goodsReceiptRepo.delete({ purchaseOrderId: In(testPOIds) })
      await poRepo.delete({ id: In(testPOIds) })
    }

    // Delete inventory transactions
    await inventoryTransactionRepo.createQueryBuilder()
      .delete()
      .from(InventoryTransaction)
      .where('reference LIKE :pattern', { pattern: 'TEST-%' })
      .execute()

    // Delete stock alerts for test products
    if (testProductIds.length > 0) {
      await stockAlertRepo.delete({ productId: In(testProductIds) })
      await inventoryLevelRepo.delete({ productId: In(testProductIds) })
    }

    // Delete test products
    await productRepo.createQueryBuilder()
      .delete()
      .from(Product)
      .where('sku LIKE :pattern', { pattern: 'TEST-%' })
      .execute()

    // Delete test suppliers
    await supplierRepo.createQueryBuilder()
      .delete()
      .from(Supplier)
      .where('name LIKE :pattern', { pattern: 'Test Supplier%' })
      .execute()

    // Delete test users
    await userRepo.createQueryBuilder()
      .delete()
      .from(User)
      .where('email LIKE :pattern', { pattern: '%test-%' })
      .execute()
  } catch (error) {
    // Database not available or connection failed - skip cleanup
    // This is expected for unit tests that don't need database
    console.log('Database not available - skipping cleanup')
  }
}
