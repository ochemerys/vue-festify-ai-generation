/**
 * Inventory Service - Pure Functions
 * 
 * This service contains pure functions for inventory business logic.
 * No external dependencies, no I/O, no Prisma calls.
 */

/**
 * Calculate available inventory
 * 
 * Gherkin: "Calculate available quantity"
 * Contract: InventoryLevelSchema
 * 
 * @param currentQuantity Total quantity in stock
 * @param reservedQuantity Quantity reserved for orders
 * @returns Available quantity
 */
export function calculateAvailableInventory(
  currentQuantity: number,
  reservedQuantity: number
): number {
  return Math.max(0, currentQuantity - reservedQuantity)
}

/**
 * Check if sufficient inventory exists
 * 
 * Gherkin: "Cannot sell more than available"
 * Contract: InventoryLevelSchema
 * 
 * @param availableQuantity Available quantity
 * @param requestedQuantity Requested quantity
 * @returns True if sufficient inventory
 */
export function hasSufficientInventory(
  availableQuantity: number,
  requestedQuantity: number
): boolean {
  return availableQuantity >= requestedQuantity
}

/**
 * Calculate quantity change for transaction type
 * 
 * Gherkin: "Record purchase transaction", "Record sale transaction", etc.
 * Contract: InventoryTransactionTypeSchema
 * 
 * @param type Transaction type
 * @param quantity Transaction quantity
 * @returns Quantity change (positive or negative)
 */
export function calculateQuantityChange(
  type: 'PURCHASE' | 'SALE' | 'ADJUSTMENT' | 'RETURN' | 'DAMAGE' | 'TRANSFER',
  quantity: number
): number {
  switch (type) {
    case 'PURCHASE':
    case 'RETURN':
      return quantity
    case 'SALE':
    case 'DAMAGE':
      return -quantity
    case 'ADJUSTMENT':
      return quantity // Can be positive or negative
    case 'TRANSFER':
      return 0 // Handled separately
    default:
      return 0
  }
}

/**
 * Validate transaction quantity
 * 
 * Gherkin: "Record inventory transaction"
 * Contract: CreateTransactionRequestSchema
 * 
 * @param quantity Transaction quantity
 * @param type Transaction type
 * @returns True if quantity is valid
 */
export function isValidTransactionQuantity(
  quantity: number,
  type: string
): boolean {
  // Adjustment can be negative, others must be positive
  if (type === 'ADJUSTMENT') {
    return quantity !== 0
  }
  return quantity > 0
}

/**
 * Calculate new inventory level after transaction
 * 
 * Gherkin: "Record purchase transaction", "Record sale transaction"
 * 
 * @param currentQuantity Current inventory
 * @param quantityChange Change amount
 * @returns New inventory level
 */
export function calculateNewInventoryLevel(
  currentQuantity: number,
  quantityChange: number
): number {
  return Math.max(0, currentQuantity + quantityChange)
}

/**
 * Check if transaction would result in negative inventory
 * 
 * Gherkin: "Cannot sell more than available"
 * 
 * @param currentQuantity Current inventory
 * @param quantityChange Change amount (negative for sales)
 * @returns True if would be negative
 */
export function wouldResultInNegativeInventory(
  currentQuantity: number,
  quantityChange: number
): boolean {
  return (currentQuantity + quantityChange) < 0
}

/**
 * Calculate inventory turnover rate
 * 
 * @param soldQuantity Quantity sold in period
 * @param averageInventory Average inventory in period
 * @returns Turnover rate
 */
export function calculateInventoryTurnover(
  soldQuantity: number,
  averageInventory: number
): number {
  if (averageInventory <= 0) {
    return 0
  }
  return soldQuantity / averageInventory
}

/**
 * Calculate days of inventory on hand
 * 
 * @param currentQuantity Current inventory
 * @param averageDailySales Average daily sales
 * @returns Days of inventory
 */
export function calculateDaysOfInventory(
  currentQuantity: number,
  averageDailySales: number
): number {
  if (averageDailySales <= 0) {
    return Infinity
  }
  return currentQuantity / averageDailySales
}

/**
 * Validate reservation quantity
 * 
 * Gherkin: "Reserve inventory for order"
 * 
 * @param availableQuantity Available inventory
 * @param reservationQuantity Quantity to reserve
 * @returns True if reservation is valid
 */
export function canReserveInventory(
  availableQuantity: number,
  reservationQuantity: number
): boolean {
  return reservationQuantity > 0 && availableQuantity >= reservationQuantity
}

/**
 * Calculate inventory value
 * 
 * Gherkin: "Generate inventory summary report"
 * 
 * @param quantity Inventory quantity
 * @param unitCost Unit cost
 * @returns Total inventory value
 */
export function calculateInventoryValue(
  quantity: number,
  unitCost: number
): number {
  if (quantity < 0 || unitCost < 0) {
    return 0
  }
  return quantity * unitCost
}

/**
 * Calculate shrinkage
 * 
 * @param expectedQuantity Expected inventory
 * @param actualQuantity Actual inventory
 * @returns Shrinkage amount
 */
export function calculateShrinkage(
  expectedQuantity: number,
  actualQuantity: number
): number {
  return Math.max(0, expectedQuantity - actualQuantity)
}

/**
 * Calculate shrinkage percentage
 * 
 * @param expectedQuantity Expected inventory
 * @param actualQuantity Actual inventory
 * @returns Shrinkage percentage
 */
export function calculateShrinkagePercentage(
  expectedQuantity: number,
  actualQuantity: number
): number {
  if (expectedQuantity <= 0) {
    return 0
  }
  const shrinkage = calculateShrinkage(expectedQuantity, actualQuantity)
  return (shrinkage / expectedQuantity) * 100
}

/**
 * Validate inventory adjustment reason
 * 
 * Gherkin: "Record inventory adjustment"
 * 
 * @param reason Adjustment reason
 * @returns True if reason is valid
 */
export function isValidAdjustmentReason(reason: string): boolean {
  return typeof reason === 'string' && reason.length > 0 && reason.length <= 255
}

/**
 * Check if inventory level requires alert
 * 
 * Gherkin: "Generate low stock alert", "Generate out of stock alert"
 * 
 * @param currentQuantity Current inventory
 * @param reorderLevel Reorder threshold
 * @returns Alert severity or null
 */
export function getInventoryAlertSeverity(
  currentQuantity: number,
  reorderLevel: number
): 'CRITICAL' | 'WARNING' | null {
  if (currentQuantity === 0) {
    return 'CRITICAL'
  }
  if (currentQuantity <= reorderLevel) {
    return 'WARNING'
  }
  return null
}
