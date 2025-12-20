/**
 * Inventory-related contracts for Inventory Management System
 */

export enum InventoryTransactionType {
  PURCHASE = 'PURCHASE',
  SALE = 'SALE',
  ADJUSTMENT = 'ADJUSTMENT',
  RETURN = 'RETURN',
  DAMAGE = 'DAMAGE',
  TRANSFER = 'TRANSFER',
}

export interface InventoryTransaction {
  id: string
  productId: string
  type: InventoryTransactionType
  quantity: number
  reference: string
  notes: string
  createdAt: Date
  createdBy: string
}

export interface InventoryLevel {
  productId: string
  currentQuantity: number
  reservedQuantity: number
  availableQuantity: number
  reorderLevel: number
  lastRestockDate: Date
  nextRestockDate?: Date
}

export interface CreateTransactionRequest {
  productId: string
  type: InventoryTransactionType
  quantity: number
  reference: string
  notes?: string
}

export interface InventoryAdjustmentRequest {
  productId: string
  newQuantity: number
  reason: string
  notes?: string
}

export interface InventoryTransactionResponse {
  success: boolean
  data?: InventoryTransaction
  error?: string
}

export interface InventoryLevelResponse {
  success: boolean
  data?: InventoryLevel
  error?: string
}

export interface InventoryHistoryResponse {
  success: boolean
  data?: InventoryTransaction[]
  total?: number
  page?: number
  pageSize?: number
  error?: string
}

export interface LowStockAlert {
  productId: string
  productName: string
  currentQuantity: number
  reorderLevel: number
  sku: string
}

export interface LowStockAlertsResponse {
  success: boolean
  data?: LowStockAlert[]
  total?: number
  error?: string
}
