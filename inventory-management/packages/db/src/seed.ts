import 'reflect-metadata'
import { AppDataSource } from './data-source.js'
import { User } from './entities/user.entity.js'
import { Product } from './entities/product.entity.js'
import { InventoryLevel } from './entities/inventory-level.entity.js'
import { Supplier } from './entities/supplier.entity.js'
import { Order, OrderStatus } from './entities/order.entity.js'
import { OrderItem } from './entities/order-item.entity.js'
import { PurchaseOrder, PurchaseOrderStatus } from './entities/purchase-order.entity.js'
import { PurchaseOrderItem } from './entities/purchase-order-item.entity.js'
import { GoodsReceipt } from './entities/goods-receipt.entity.js'
import { InventoryTransaction, TransactionType } from './entities/inventory-transaction.entity.js'
import { StockAlert } from './entities/stock-alert.entity.js'
import bcrypt from 'bcryptjs'

async function seed() {
  try {
    await AppDataSource.initialize()

    // Check if seed already exists
    const existingUser = await AppDataSource.getRepository(User).findOne({
      where: { email: 'admin@example.com' },
    })

    if (existingUser) {
      console.log('Database already seeded. Skipping.')
      return
    }

    console.log('Starting database seed...')

    // Seed users
    const users = await seedUsers()
    console.log(`✓ Seeded ${users.length} users`)

    // Seed suppliers
    const suppliers = await seedSuppliers()
    console.log(`✓ Seeded ${suppliers.length} suppliers`)

    // Seed products
    const products = await seedProducts()
    console.log(`✓ Seeded ${products.length} products`)

    // Seed inventory levels
    const inventoryLevels = await seedInventoryLevels(products)
    console.log(`✓ Seeded ${inventoryLevels.length} inventory levels`)

    // Seed purchase orders and goods receipts
    const { purchaseOrders, goodsReceipts } = await seedPurchaseOrders(
      suppliers,
      products,
      users[0]
    )
    console.log(`✓ Seeded ${purchaseOrders.length} purchase orders`)
    console.log(`✓ Seeded ${goodsReceipts.length} goods receipts`)

    // Seed orders and inventory transactions
    const { orders, transactions } = await seedOrders(products, users[0])
    console.log(`✓ Seeded ${orders.length} orders`)
    console.log(`✓ Seeded ${transactions.length} inventory transactions`)

    // Seed stock alerts
    const alerts = await seedStockAlerts(products)
    console.log(`✓ Seeded ${alerts.length} stock alerts`)

    console.log('\n✅ Database seeding completed successfully!')
    console.log('\nTest credentials:')
    console.log('  Admin: admin@example.com / Password123!')
    console.log('  Manager: manager@example.com / Password123!')
    console.log('  Staff: staff@example.com / Password123!')
  } catch (error) {
    console.error('❌ Error seeding database:', error)
    throw error
  } finally {
    await AppDataSource.destroy()
  }
}

async function seedUsers(): Promise<User[]> {
  const userRepository = AppDataSource.getRepository(User)

  const usersData = [
    {
      email: 'admin@example.com',
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      password: 'Password123!',
    },
    {
      email: 'manager@example.com',
      firstName: 'Manager',
      lastName: 'User',
      role: 'MANAGER',
      password: 'Password123!',
    },
    {
      email: 'staff@example.com',
      firstName: 'Staff',
      lastName: 'User',
      role: 'STAFF',
      password: 'Password123!',
    },
    {
      email: 'viewer@example.com',
      firstName: 'Viewer',
      lastName: 'User',
      role: 'VIEWER',
      password: 'Password123!',
    },
  ]

  const users: User[] = []

  for (const userData of usersData) {
    const user = new User()
    user.email = userData.email
    user.firstName = userData.firstName
    user.lastName = userData.lastName
    user.role = userData.role
    user.isActive = true

    const salt = await bcrypt.genSalt(10)
    user.password = await bcrypt.hash(userData.password, salt)

    const savedUser = await userRepository.save(user)
    users.push(savedUser)
  }

  return users
}

async function seedSuppliers(): Promise<Supplier[]> {
  const supplierRepository = AppDataSource.getRepository(Supplier)

  const suppliersData = [
    {
      name: 'TechSupply Co.',
      contactName: 'John Smith',
      email: 'john@techsupply.com',
      phone: '+1-555-0101',
      address: '123 Tech Street, Silicon Valley, CA 94025',
    },
    {
      name: 'Global Imports Ltd.',
      contactName: 'Maria Garcia',
      email: 'maria@globalimports.com',
      phone: '+1-555-0102',
      address: '456 Trade Ave, New York, NY 10001',
    },
    {
      name: 'Premium Parts Inc.',
      contactName: 'David Chen',
      email: 'david@premiumparts.com',
      phone: '+1-555-0103',
      address: '789 Industrial Blvd, Chicago, IL 60601',
    },
    {
      name: 'Eco Supplies',
      contactName: 'Sarah Johnson',
      email: 'sarah@ecosupplies.com',
      phone: '+1-555-0104',
      address: '321 Green Lane, Portland, OR 97201',
    },
  ]

  const suppliers: Supplier[] = []

  for (const supplierData of suppliersData) {
    const supplier = new Supplier()
    supplier.name = supplierData.name
    supplier.contactName = supplierData.contactName
    supplier.email = supplierData.email
    supplier.phone = supplierData.phone
    supplier.address = supplierData.address
    supplier.isActive = true

    const savedSupplier = await supplierRepository.save(supplier)
    suppliers.push(savedSupplier)
  }

  return suppliers
}

async function seedProducts(): Promise<Product[]> {
  const productRepository = AppDataSource.getRepository(Product)

  const productsData = [
    // Electronics
    {
      sku: 'PROD-0001',
      name: 'Wireless Mouse',
      description: 'Ergonomic wireless mouse with 2.4GHz connection',
      category: 'Electronics',
      supplier: 'TechSupply Co.',
      price: 29.99,
      cost: 12.5,
      reorderLevel: 20,
    },
    {
      sku: 'PROD-0002',
      name: 'USB-C Cable',
      description: '2m USB-C charging and data cable',
      category: 'Electronics',
      supplier: 'TechSupply Co.',
      price: 12.99,
      cost: 4.0,
      reorderLevel: 50,
    },
    {
      sku: 'PROD-0003',
      name: 'Mechanical Keyboard',
      description: 'RGB mechanical keyboard with Cherry MX switches',
      category: 'Electronics',
      supplier: 'TechSupply Co.',
      price: 89.99,
      cost: 35.0,
      reorderLevel: 10,
    },
    {
      sku: 'PROD-0004',
      name: 'Monitor Stand',
      description: 'Adjustable monitor stand with storage',
      category: 'Office Furniture',
      supplier: 'Premium Parts Inc.',
      price: 49.99,
      cost: 20.0,
      reorderLevel: 15,
    },
    {
      sku: 'PROD-0005',
      name: 'Desk Lamp',
      description: 'LED desk lamp with adjustable brightness',
      category: 'Office Furniture',
      supplier: 'Eco Supplies',
      price: 39.99,
      cost: 15.0,
      reorderLevel: 12,
    },
    // Office Supplies
    {
      sku: 'PROD-0006',
      name: 'Notebook Set',
      description: 'Pack of 3 premium notebooks',
      category: 'Office Supplies',
      supplier: 'Global Imports Ltd.',
      price: 14.99,
      cost: 5.0,
      reorderLevel: 30,
    },
    {
      sku: 'PROD-0007',
      name: 'Pen Pack',
      description: 'Set of 12 ballpoint pens',
      category: 'Office Supplies',
      supplier: 'Global Imports Ltd.',
      price: 8.99,
      cost: 2.5,
      reorderLevel: 40,
    },
    {
      sku: 'PROD-0008',
      name: 'Sticky Notes',
      description: 'Assorted color sticky notes, 100 sheets',
      category: 'Office Supplies',
      supplier: 'Global Imports Ltd.',
      price: 4.99,
      cost: 1.5,
      reorderLevel: 50,
    },
    // Hardware
    {
      sku: 'PROD-0009',
      name: 'Screwdriver Set',
      description: '20-piece precision screwdriver set',
      category: 'Hardware',
      supplier: 'Premium Parts Inc.',
      price: 24.99,
      cost: 10.0,
      reorderLevel: 8,
    },
    {
      sku: 'PROD-0010',
      name: 'Power Strip',
      description: '6-outlet power strip with surge protection',
      category: 'Electronics',
      supplier: 'TechSupply Co.',
      price: 19.99,
      cost: 8.0,
      reorderLevel: 15,
    },
    // Additional products for variety
    {
      sku: 'PROD-0011',
      name: 'Webcam HD',
      description: '1080p HD webcam with microphone',
      category: 'Electronics',
      supplier: 'TechSupply Co.',
      price: 59.99,
      cost: 25.0,
      reorderLevel: 10,
    },
    {
      sku: 'PROD-0012',
      name: 'Headphones',
      description: 'Noise-cancelling wireless headphones',
      category: 'Electronics',
      supplier: 'TechSupply Co.',
      price: 129.99,
      cost: 50.0,
      reorderLevel: 8,
    },
    {
      sku: 'PROD-0013',
      name: 'Desk Organizer',
      description: 'Multi-compartment desk organizer',
      category: 'Office Furniture',
      supplier: 'Premium Parts Inc.',
      price: 34.99,
      cost: 14.0,
      reorderLevel: 12,
    },
    {
      sku: 'PROD-0014',
      name: 'File Cabinet',
      description: '4-drawer lateral file cabinet',
      category: 'Office Furniture',
      supplier: 'Premium Parts Inc.',
      price: 199.99,
      cost: 80.0,
      reorderLevel: 3,
    },
    {
      sku: 'PROD-0015',
      name: 'Printer Paper',
      description: 'Ream of 500 sheets, 20lb white paper',
      category: 'Office Supplies',
      supplier: 'Global Imports Ltd.',
      price: 6.99,
      cost: 2.0,
      reorderLevel: 60,
    },
    {
      sku: 'PROD-0016',
      name: 'Stapler',
      description: 'Heavy-duty stapler with 1000 staples',
      category: 'Office Supplies',
      supplier: 'Global Imports Ltd.',
      price: 9.99,
      cost: 3.5,
      reorderLevel: 20,
    },
    {
      sku: 'PROD-0017',
      name: 'Tape Dispenser',
      description: 'Desktop tape dispenser with tape roll',
      category: 'Office Supplies',
      supplier: 'Global Imports Ltd.',
      price: 7.99,
      cost: 2.5,
      reorderLevel: 25,
    },
    {
      sku: 'PROD-0018',
      name: 'Cable Organizer',
      description: 'Silicone cable organizer clips, pack of 5',
      category: 'Electronics',
      supplier: 'TechSupply Co.',
      price: 11.99,
      cost: 4.0,
      reorderLevel: 30,
    },
    {
      sku: 'PROD-0019',
      name: 'Laptop Stand',
      description: 'Adjustable aluminum laptop stand',
      category: 'Office Furniture',
      supplier: 'Premium Parts Inc.',
      price: 44.99,
      cost: 18.0,
      reorderLevel: 10,
    },
    {
      sku: 'PROD-0020',
      name: 'Mouse Pad',
      description: 'Large extended mouse pad with wrist rest',
      category: 'Electronics',
      supplier: 'TechSupply Co.',
      price: 19.99,
      cost: 7.0,
      reorderLevel: 25,
    },
    {
      sku: 'PROD-0021',
      name: 'Desk Chair',
      description: 'Ergonomic office chair with lumbar support',
      category: 'Office Furniture',
      supplier: 'Premium Parts Inc.',
      price: 249.99,
      cost: 100.0,
      reorderLevel: 2,
    },
    {
      sku: 'PROD-0022',
      name: 'Whiteboard',
      description: '36x24 inch magnetic whiteboard',
      category: 'Office Supplies',
      supplier: 'Global Imports Ltd.',
      price: 29.99,
      cost: 12.0,
      reorderLevel: 8,
    },
    {
      sku: 'PROD-0023',
      name: 'Marker Set',
      description: 'Set of 12 permanent markers',
      category: 'Office Supplies',
      supplier: 'Global Imports Ltd.',
      price: 13.99,
      cost: 5.0,
      reorderLevel: 20,
    },
    {
      sku: 'PROD-0024',
      name: 'Desk Pad',
      description: 'Leather desk pad, 24x14 inches',
      category: 'Office Furniture',
      supplier: 'Premium Parts Inc.',
      price: 39.99,
      cost: 16.0,
      reorderLevel: 10,
    },
    {
      sku: 'PROD-0025',
      name: 'USB Hub',
      description: '7-port USB 3.0 hub with power adapter',
      category: 'Electronics',
      supplier: 'TechSupply Co.',
      price: 34.99,
      cost: 14.0,
      reorderLevel: 12,
    },
  ]

  const products: Product[] = []

  for (const productData of productsData) {
    const product = new Product()
    product.sku = productData.sku
    product.name = productData.name
    product.description = productData.description
    product.category = productData.category
    product.supplier = productData.supplier
    product.price = productData.price
    product.cost = productData.cost
    product.reorderLevel = productData.reorderLevel
    product.isActive = true

    const savedProduct = await productRepository.save(product)
    products.push(savedProduct)
  }

  return products
}

async function seedInventoryLevels(products: Product[]): Promise<InventoryLevel[]> {
  const inventoryRepository = AppDataSource.getRepository(InventoryLevel)

  const inventoryLevels: InventoryLevel[] = []

  for (const product of products) {
    const inventory = new InventoryLevel()
    inventory.productId = product.id

    // Mix of inventory states
    const random = Math.random()
    if (random < 0.3) {
      // Low stock (30%)
      inventory.currentQuantity = Math.floor(Math.random() * 5) + 1
      inventory.reservedQuantity = 0
    } else if (random < 0.6) {
      // In stock (30%)
      inventory.currentQuantity = Math.floor(Math.random() * 50) + 20
      inventory.reservedQuantity = Math.floor(inventory.currentQuantity * 0.2)
    } else {
      // Well stocked (40%)
      inventory.currentQuantity = Math.floor(Math.random() * 100) + 50
      inventory.reservedQuantity = Math.floor(inventory.currentQuantity * 0.15)
    }

    inventory.availableQuantity = inventory.currentQuantity - inventory.reservedQuantity
    inventory.lastRestockDate = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)

    const savedInventory = await inventoryRepository.save(inventory)
    inventoryLevels.push(savedInventory)
  }

  return inventoryLevels
}

async function seedPurchaseOrders(
  suppliers: Supplier[],
  products: Product[],
  createdByUser: User
): Promise<{ purchaseOrders: PurchaseOrder[]; goodsReceipts: GoodsReceipt[] }> {
  const poRepository = AppDataSource.getRepository(PurchaseOrder)
  const poItemRepository = AppDataSource.getRepository(PurchaseOrderItem)
  const grRepository = AppDataSource.getRepository(GoodsReceipt)

  const purchaseOrders: PurchaseOrder[] = []
  const goodsReceipts: GoodsReceipt[] = []

  const statuses = [
    PurchaseOrderStatus.DRAFT,
    PurchaseOrderStatus.SUBMITTED,
    PurchaseOrderStatus.CONFIRMED,
    PurchaseOrderStatus.PARTIALLY_RECEIVED,
    PurchaseOrderStatus.RECEIVED,
    PurchaseOrderStatus.CANCELLED,
  ]

  for (let i = 0; i < 12; i++) {
    const po = new PurchaseOrder()
    po.poNumber = `PO-${String(1000 + i).padStart(4, '0')}`
    po.supplierId = suppliers[i % suppliers.length].id
    po.status = statuses[i % statuses.length]
    po.expectedDate = new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000)
    po.createdBy = createdByUser.id

    if (po.status === PurchaseOrderStatus.RECEIVED || po.status === PurchaseOrderStatus.PARTIALLY_RECEIVED) {
      po.receivedDate = new Date(Date.now() - Math.random() * 15 * 24 * 60 * 60 * 1000)
    }

    po.notes = `Purchase order for restocking. Supplier: ${suppliers[i % suppliers.length].name}`

    // Calculate total amount
    const itemCount = Math.floor(Math.random() * 4) + 1
    let totalAmount = 0

    for (let j = 0; j < itemCount; j++) {
      const product = products[Math.floor(Math.random() * products.length)]
      const quantity = Math.floor(Math.random() * 20) + 5
      const unitPrice = parseFloat(product.price.toString())
      const subtotal = quantity * unitPrice
      totalAmount += subtotal
    }

    po.totalAmount = totalAmount
    const savedPO = await poRepository.save(po)
    
    // Now save items with the PO ID
    for (let j = 0; j < itemCount; j++) {
      const product = products[Math.floor(Math.random() * products.length)]
      const quantity = Math.floor(Math.random() * 20) + 5
      const unitPrice = parseFloat(product.price.toString())
      const subtotal = quantity * unitPrice

      const poItem = new PurchaseOrderItem()
      poItem.purchaseOrderId = savedPO.id
      poItem.productId = product.id
      poItem.quantity = quantity
      poItem.unitPrice = unitPrice
      poItem.subtotal = subtotal
      poItem.receivedQuantity = 0

      if (po.status === PurchaseOrderStatus.RECEIVED) {
        poItem.receivedQuantity = quantity
      } else if (po.status === PurchaseOrderStatus.PARTIALLY_RECEIVED) {
        poItem.receivedQuantity = Math.floor(quantity * 0.6)
      }

      await poItemRepository.save(poItem)
    }
    
    purchaseOrders.push(savedPO)

    // Create goods receipt for received POs
    if (po.status === PurchaseOrderStatus.RECEIVED || po.status === PurchaseOrderStatus.PARTIALLY_RECEIVED) {
      const gr = new GoodsReceipt()
      gr.receiptNumber = `GR-${String(2000 + i).padStart(4, '0')}`
      gr.purchaseOrderId = savedPO.id
      gr.receivedDate = po.receivedDate || new Date()
      gr.notes = `Goods receipt for PO ${po.poNumber}`

      const savedGR = await grRepository.save(gr)
      goodsReceipts.push(savedGR)
    }
  }

  return { purchaseOrders, goodsReceipts }
}

async function seedOrders(
  products: Product[],
  createdByUser: User
): Promise<{ orders: Order[]; transactions: InventoryTransaction[] }> {
  const orderRepository = AppDataSource.getRepository(Order)
  const orderItemRepository = AppDataSource.getRepository(OrderItem)
  const transactionRepository = AppDataSource.getRepository(InventoryTransaction)
  const inventoryRepository = AppDataSource.getRepository(InventoryLevel)

  const orders: Order[] = []
  const transactions: InventoryTransaction[] = []

  const statuses = [
    OrderStatus.PENDING,
    OrderStatus.CONFIRMED,
    OrderStatus.SHIPPED,
    OrderStatus.DELIVERED,
    OrderStatus.CANCELLED,
    OrderStatus.RETURNED,
  ]

  const customerNames = [
    'Acme Corp',
    'TechStart Inc',
    'Global Solutions',
    'Innovation Labs',
    'Digital Ventures',
    'Smart Systems',
    'Future Tech',
    'Cloud Nine',
    'Data Dynamics',
    'Quantum Leap',
  ]

  for (let i = 0; i < 20; i++) {
    const order = new Order()
    order.orderNumber = `ORD-${String(3000 + i).padStart(4, '0')}`
    order.customerName = customerNames[i % customerNames.length]
    // customerId is UUID type, leaving it undefined/null
    order.customerEmail = `customer${i + 1}@example.com`
    order.customerPhone = `+1-555-${String(1000 + i).padStart(4, '0')}`
    order.shippingAddress = `${100 + i} Business Ave, Suite ${i + 1}, New York, NY 10001`
    order.status = statuses[i % statuses.length]
    order.createdBy = createdByUser.id

    // Set timestamps based on status
    const daysAgo = Math.floor(Math.random() * 60)
    order.createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000)

    if (order.status === OrderStatus.SHIPPED || order.status === OrderStatus.DELIVERED) {
      order.shippedAt = new Date(order.createdAt.getTime() + 2 * 24 * 60 * 60 * 1000)
    }

    if (order.status === OrderStatus.DELIVERED) {
      order.deliveredAt = new Date(order.shippedAt!.getTime() + 3 * 24 * 60 * 60 * 1000)
    }

    // Calculate total amount
    const itemCount = Math.floor(Math.random() * 4) + 1
    let totalAmount = 0

    for (let j = 0; j < itemCount; j++) {
      const product = products[Math.floor(Math.random() * products.length)]
      const quantity = Math.floor(Math.random() * 10) + 1
      const unitPrice = parseFloat(product.price.toString())
      const subtotal = quantity * unitPrice
      totalAmount += subtotal
    }

    order.totalAmount = totalAmount
    order.notes = `Order for ${order.customerName}. Status: ${order.status}`

    const savedOrder = await orderRepository.save(order)
    
    // Now save items with the order ID
    for (let j = 0; j < itemCount; j++) {
      const product = products[Math.floor(Math.random() * products.length)]
      const quantity = Math.floor(Math.random() * 10) + 1
      const unitPrice = parseFloat(product.price.toString())
      const subtotal = quantity * unitPrice

      const orderItem = new OrderItem()
      orderItem.orderId = savedOrder.id
      orderItem.productId = product.id
      orderItem.quantity = quantity
      orderItem.unitPrice = unitPrice
      orderItem.subtotal = subtotal

      await orderItemRepository.save(orderItem)

      // Create inventory transaction for shipped orders
      if (order.status === OrderStatus.SHIPPED || order.status === OrderStatus.DELIVERED) {
        const transaction = new InventoryTransaction()
        transaction.productId = product.id
        transaction.type = TransactionType.SALE
        transaction.quantity = quantity
        transaction.reference = order.orderNumber
        transaction.notes = `Sale from order ${order.orderNumber}`
        transaction.createdBy = createdByUser.id
        transaction.createdAt = order.shippedAt || new Date()

        const savedTransaction = await transactionRepository.save(transaction)
        transactions.push(savedTransaction)

        // Update inventory
        const inventory = await inventoryRepository.findOne({
          where: { productId: product.id },
        })
        if (inventory) {
          inventory.currentQuantity = Math.max(0, inventory.currentQuantity - quantity)
          inventory.availableQuantity = Math.max(
            0,
            inventory.availableQuantity - quantity
          )
          await inventoryRepository.save(inventory)
        }
      }

      // Create return transaction for returned orders
      if (order.status === OrderStatus.RETURNED) {
        const returnTransaction = new InventoryTransaction()
        returnTransaction.productId = product.id
        returnTransaction.type = TransactionType.RETURN
        returnTransaction.quantity = quantity
        returnTransaction.reference = order.orderNumber
        returnTransaction.notes = `Return from order ${order.orderNumber}`
        returnTransaction.createdBy = createdByUser.id
        returnTransaction.createdAt = new Date(order.createdAt.getTime() + 10 * 24 * 60 * 60 * 1000)

        const savedReturnTransaction = await transactionRepository.save(returnTransaction)
        transactions.push(savedReturnTransaction)

        // Update inventory for returns
        const inventory = await inventoryRepository.findOne({
          where: { productId: product.id },
        })
        if (inventory) {
          inventory.currentQuantity += quantity
          inventory.availableQuantity += quantity
          await inventoryRepository.save(inventory)
        }
      }
    }
    
    orders.push(savedOrder)
  }

  return { orders, transactions }
}

async function seedStockAlerts(products: Product[]): Promise<StockAlert[]> {
  const alertRepository = AppDataSource.getRepository(StockAlert)
  const inventoryRepository = AppDataSource.getRepository(InventoryLevel)

  const alerts: StockAlert[] = []

  // Create alerts for low stock products
  for (let i = 0; i < 5; i++) {
    const product = products[i]
    const inventory = await inventoryRepository.findOne({
      where: { productId: product.id },
    })

    if (inventory && inventory.currentQuantity <= product.reorderLevel) {
      const alert = new StockAlert()
      alert.productId = product.id
      alert.currentQuantity = inventory.currentQuantity
      alert.reorderLevel = product.reorderLevel
      alert.isResolved = false

      const savedAlert = await alertRepository.save(alert)
      alerts.push(savedAlert)
    }
  }

  return alerts
}

seed().catch((error) => {
  console.error('❌ Fatal error:', error)
  process.exit(1)
})
