import { prisma } from '../src/client.js'

async function main() {
  console.log('🌱 Starting database seed...')

  // Clear existing data
  await prisma.auditLog.deleteMany()
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.purchaseOrderItem.deleteMany()
  await prisma.goodsReceipt.deleteMany()
  await prisma.purchaseOrder.deleteMany()
  await prisma.inventoryTransaction.deleteMany()
  await prisma.stockAlert.deleteMany()
  await prisma.inventoryLevel.deleteMany()
  await prisma.product.deleteMany()
  await prisma.supplier.deleteMany()
  await prisma.category.deleteMany()
  await prisma.user.deleteMany()

  console.log('✓ Cleared existing data')

  // Create users
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@inventory.local',
      password: 'hashed_password_here', // In production, use proper hashing
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
    },
  })

  const managerUser = await prisma.user.create({
    data: {
      email: 'manager@inventory.local',
      password: 'hashed_password_here',
      firstName: 'Manager',
      lastName: 'User',
      role: 'MANAGER',
    },
  })

  const staffUser = await prisma.user.create({
    data: {
      email: 'staff@inventory.local',
      password: 'hashed_password_here',
      firstName: 'Staff',
      lastName: 'User',
      role: 'STAFF',
    },
  })

  console.log('✓ Created users')

  // Create categories
  const electronicsCategory = await prisma.category.create({
    data: {
      name: 'Electronics',
      description: 'Electronic devices and components',
    },
  })

  const clothingCategory = await prisma.category.create({
    data: {
      name: 'Clothing',
      description: 'Apparel and fashion items',
    },
  })

  const furnitureCategory = await prisma.category.create({
    data: {
      name: 'Furniture',
      description: 'Furniture and home decor',
    },
  })

  console.log('✓ Created categories')

  // Create suppliers
  const supplier1 = await prisma.supplier.create({
    data: {
      name: 'Tech Supplies Inc',
      email: 'contact@techsupplies.com',
      phone: '+1-555-0101',
      address: '123 Tech Street',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94105',
      country: 'USA',
      contactPerson: 'John Smith',
      paymentTerms: 'Net 30',
    },
  })

  const supplier2 = await prisma.supplier.create({
    data: {
      name: 'Fashion Wholesale Ltd',
      email: 'sales@fashionwholesale.com',
      phone: '+1-555-0102',
      address: '456 Fashion Ave',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA',
      contactPerson: 'Jane Doe',
      paymentTerms: 'Net 45',
    },
  })

  console.log('✓ Created suppliers')

  // Create products
  const product1 = await prisma.product.create({
    data: {
      sku: 'ELEC-001',
      name: 'Wireless Mouse',
      description: 'Ergonomic wireless mouse with USB receiver',
      category: electronicsCategory.name,
      price: 29.99,
      cost: 12.5,
      reorderLevel: 20,
      supplier: supplier1.name,
    },
  })

  const product2 = await prisma.product.create({
    data: {
      sku: 'ELEC-002',
      name: 'USB-C Cable',
      description: '2m USB-C charging and data cable',
      category: electronicsCategory.name,
      price: 12.99,
      cost: 4.0,
      reorderLevel: 50,
      supplier: supplier1.name,
    },
  })

  const product3 = await prisma.product.create({
    data: {
      sku: 'CLOTH-001',
      name: 'Cotton T-Shirt',
      description: '100% cotton comfortable t-shirt',
      category: clothingCategory.name,
      price: 19.99,
      cost: 7.5,
      reorderLevel: 30,
      supplier: supplier2.name,
    },
  })

  const product4 = await prisma.product.create({
    data: {
      sku: 'FURN-001',
      name: 'Office Chair',
      description: 'Ergonomic office chair with lumbar support',
      category: furnitureCategory.name,
      price: 199.99,
      cost: 85.0,
      reorderLevel: 5,
      supplier: supplier1.name,
    },
  })

  console.log('✓ Created products')

  // Create inventory levels
  await prisma.inventoryLevel.create({
    data: {
      productId: product1.id,
      currentQuantity: 150,
      reservedQuantity: 20,
      availableQuantity: 130,
      lastRestockDate: new Date('2024-01-15'),
    },
  })

  await prisma.inventoryLevel.create({
    data: {
      productId: product2.id,
      currentQuantity: 45,
      reservedQuantity: 10,
      availableQuantity: 35,
      lastRestockDate: new Date('2024-01-10'),
    },
  })

  await prisma.inventoryLevel.create({
    data: {
      productId: product3.id,
      currentQuantity: 200,
      reservedQuantity: 50,
      availableQuantity: 150,
      lastRestockDate: new Date('2024-01-20'),
    },
  })

  await prisma.inventoryLevel.create({
    data: {
      productId: product4.id,
      currentQuantity: 12,
      reservedQuantity: 2,
      availableQuantity: 10,
      lastRestockDate: new Date('2024-01-05'),
    },
  })

  console.log('✓ Created inventory levels')

  // Create inventory transactions
  await prisma.inventoryTransaction.create({
    data: {
      productId: product1.id,
      type: 'PURCHASE',
      quantity: 100,
      reference: 'PO-2024-001',
      notes: 'Initial stock purchase',
      createdBy: adminUser.id,
    },
  })

  await prisma.inventoryTransaction.create({
    data: {
      productId: product2.id,
      type: 'SALE',
      quantity: 5,
      reference: 'ORD-2024-001',
      notes: 'Customer order',
      createdBy: staffUser.id,
    },
  })

  console.log('✓ Created inventory transactions')

  // Create stock alerts
  await prisma.stockAlert.create({
    data: {
      productId: product2.id,
      alertType: 'LOW_STOCK',
      currentQuantity: 45,
      reorderLevel: 50,
    },
  })

  console.log('✓ Created stock alerts')

  // Create orders
  const order1 = await prisma.order.create({
    data: {
      orderNumber: 'ORD-2024-001',
      customerId: 'CUST-001',
      customerName: 'John Customer',
      customerEmail: 'john@example.com',
      customerPhone: '+1-555-1234',
      status: 'CONFIRMED',
      totalAmount: 89.97,
      shippingAddress: '789 Main St, Springfield, IL 62701',
      notes: 'Please deliver before 5 PM',
      createdBy: staffUser.id,
      shippedAt: new Date(),
    },
  })

  await prisma.orderItem.create({
    data: {
      orderId: order1.id,
      productId: product1.id,
      quantity: 2,
      unitPrice: 29.99,
      subtotal: 59.98,
    },
  })

  await prisma.orderItem.create({
    data: {
      orderId: order1.id,
      productId: product2.id,
      quantity: 1,
      unitPrice: 12.99,
      subtotal: 12.99,
    },
  })

  console.log('✓ Created orders')

  // Create purchase orders
  const po1 = await prisma.purchaseOrder.create({
    data: {
      poNumber: 'PO-2024-001',
      supplierId: supplier1.id,
      status: 'CONFIRMED',
      totalAmount: 1250.0,
      expectedDate: new Date('2024-02-15'),
    },
  })

  await prisma.purchaseOrderItem.create({
    data: {
      purchaseOrderId: po1.id,
      productId: product1.id,
      quantity: 50,
      unitPrice: 12.5,
      subtotal: 625.0,
      receivedQuantity: 50,
    },
  })

  console.log('✓ Created purchase orders')

  // Create audit logs
  await prisma.auditLog.create({
    data: {
      userId: adminUser.id,
      action: 'CREATE',
      entity: 'Product',
      entityId: product1.id,
      changes: {
        name: product1.name,
        sku: product1.sku,
      },
    },
  })

  console.log('✓ Created audit logs')

  // Create daily inventory summary
  await prisma.dailyInventorySummary.create({
    data: {
      date: new Date(),
      totalProducts: 4,
      totalValue: 4407.96,
      lowStockCount: 1,
      outOfStockCount: 0,
    },
  })

  console.log('✓ Created daily inventory summary')

  console.log('✅ Database seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
