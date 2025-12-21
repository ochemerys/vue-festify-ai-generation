/**
 * Database Layer for Inventory Management System
 *
 * This package provides Prisma ORM setup and database utilities
 * for the Inventory Management System.
 */

export { prisma, default } from './client'
export type {
  User,
  Product,
  Category,
  Supplier,
  InventoryLevel,
  InventoryTransaction,
  StockAlert,
  Order,
  OrderItem,
  PurchaseOrder,
  PurchaseOrderItem,
  GoodsReceipt,
  AuditLog,
  DailyInventorySummary,
  SalesReport,
} from '@prisma/client'

export {
  UserRole,
  InventoryTransactionType,
  AlertType,
  OrderStatus,
  POStatus,
} from '@prisma/client'
