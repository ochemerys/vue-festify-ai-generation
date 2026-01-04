/**
 * Inventory Component Types
 * 
 * Type definitions for all inventory-related components and data structures.
 * Ensures type safety across the application.
 */

/**
 * Inventory item data
 */
export interface InventoryItem {
  id: string
  productId: string
  productName: string
  sku: string
  category: string
  currentQuantity: number
  reorderLevel: number
  status: 'in-stock' | 'low-stock' | 'out-of-stock'
  lastRestockDate?: Date
  supplier: string
  price: number
}

/**
 * Inventory filters
 */
export interface InventoryFilters {
  search?: string
  category?: string
  status?: 'in-stock' | 'low-stock' | 'out-of-stock'
  supplier?: string
  lowStockOnly?: boolean
}

/**
 * Inventory summary statistics
 */
export interface InventorySummary {
  totalItems: number
  inStockCount: number
  lowStockCount: number
  outOfStockCount: number
}

/**
 * Inventory list response from API
 */
export interface InventoryListResponse {
  data: InventoryItem[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
  summary: InventorySummary
}

/**
 * Stock adjustment data
 */
export interface StockAdjustment {
  inventoryId: string
  productId: string
  oldQuantity: number
  newQuantity: number
  adjustmentQuantity: number
  reason: 'restock' | 'sale' | 'damage' | 'loss' | 'correction' | 'return'
  notes?: string
  adjustedBy: string
  adjustedAt: Date
}

/**
 * Inventory transaction history item
 */
export interface InventoryTransaction {
  id: string
  inventoryId: string
  productId: string
  productName: string
  type: 'in' | 'out' | 'adjustment'
  quantity: number
  previousQuantity: number
  newQuantity: number
  reason: string
  reference?: string
  notes?: string
  createdBy: string
  createdAt: Date
}

/**
 * Reorder suggestion
 */
export interface ReorderSuggestion {
  inventoryId: string
  productId: string
  productName: string
  currentQuantity: number
  reorderLevel: number
  suggestedQuantity: number
  supplier: string
  estimatedCost: number
  priority: 'high' | 'medium' | 'low'
}

/**
 * Inventory page state
 */
export interface InventoryPageState {
  items: InventoryItem[]
  filters: InventoryFilters
  page: number
  pageSize: number
  total: number
  loading: boolean
  error: string | null
  summary: InventorySummary
}

/**
 * Stock status badge configuration
 */
export interface StockStatusBadge {
  status: 'in-stock' | 'low-stock' | 'out-of-stock'
  label: string
  icon: string
  classes: string
}

/**
 * Type guards
 */
export const isInventoryItem = (value: any): value is InventoryItem => {
  return (
    typeof value === 'object' &&
    'id' in value &&
    'productId' in value &&
    'productName' in value &&
    'currentQuantity' in value &&
    'reorderLevel' in value &&
    'status' in value
  )
}

export const isStockAdjustment = (value: any): value is StockAdjustment => {
  return (
    typeof value === 'object' &&
    'inventoryId' in value &&
    'oldQuantity' in value &&
    'newQuantity' in value &&
    'reason' in value
  )
}

export const isInventoryTransaction = (value: any): value is InventoryTransaction => {
  return (
    typeof value === 'object' &&
    'id' in value &&
    'inventoryId' in value &&
    'type' in value &&
    'quantity' in value
  )
}

/**
 * Utility types
 */
export type StockStatus = 'in-stock' | 'low-stock' | 'out-of-stock'
export type AdjustmentReason = 'restock' | 'sale' | 'damage' | 'loss' | 'correction' | 'return'
export type TransactionType = 'in' | 'out' | 'adjustment'
export type ReorderPriority = 'high' | 'medium' | 'low'
