/**
 * Purchase Order Service - Pure Functions
 * 
 * This service contains pure functions for purchase order business logic.
 * No external dependencies, no I/O, no Prisma calls.
 */

/**
 * Calculate purchase order total
 * 
 * Gherkin: "Calculate purchase order total"
 * Contract: CreatePurchaseOrderRequestSchema
 * 
 * @param items Array of PO items with quantity and unitPrice
 * @returns Total amount for the purchase order
 */
export function calculatePurchaseOrderTotal(
  items: Array<{ quantity: number; unitPrice: number }>
): number {
  if (!items || items.length === 0) {
    return 0
  }

  return items.reduce((total, item) => {
    const subtotal = item.quantity * item.unitPrice
    return total + subtotal
  }, 0)
}

/**
 * Calculate subtotal for a single PO item
 * 
 * Gherkin: "Calculate purchase order total" (item-level)
 * Contract: PurchaseOrderItemSchema
 * 
 * @param quantity Number of units
 * @param unitPrice Price per unit
 * @returns Subtotal for the item
 */
export function calculatePOItemSubtotal(quantity: number, unitPrice: number): number {
  if (quantity <= 0 || unitPrice <= 0) {
    return 0
  }

  return quantity * unitPrice
}

/**
 * Validate PO status transition
 * 
 * Gherkin: "Submit purchase order", "Confirm purchase order", "Cancel purchase order"
 * Contract: POStatusSchema
 * 
 * Valid transitions:
 * - DRAFT → SUBMITTED, CANCELLED
 * - SUBMITTED → CONFIRMED, CANCELLED
 * - CONFIRMED → PARTIALLY_RECEIVED, CANCELLED
 * - PARTIALLY_RECEIVED → RECEIVED, CANCELLED
 * - RECEIVED → (none)
 * - CANCELLED → (none)
 * 
 * @param currentStatus Current PO status
 * @param newStatus Desired new status
 * @returns True if transition is valid
 */
export function isValidPOStatusTransition(
  currentStatus: string,
  newStatus: string
): boolean {
  const validTransitions: Record<string, string[]> = {
    DRAFT: ['SUBMITTED', 'CANCELLED'],
    SUBMITTED: ['CONFIRMED', 'CANCELLED'],
    CONFIRMED: ['PARTIALLY_RECEIVED', 'CANCELLED'],
    PARTIALLY_RECEIVED: ['RECEIVED', 'CANCELLED'],
    RECEIVED: [],
    CANCELLED: [],
  }

  const allowedTransitions = validTransitions[currentStatus] || []
  return allowedTransitions.includes(newStatus)
}

/**
 * Check if PO can receive goods
 * 
 * Gherkin: "Receive partial goods", "Receive remaining goods"
 * 
 * @param status Current PO status
 * @returns True if goods can be received
 */
export function canReceiveGoods(status: string): boolean {
  return status === 'CONFIRMED' || status === 'PARTIALLY_RECEIVED'
}

/**
 * Validate received quantity doesn't exceed ordered
 * 
 * Gherkin: "Cannot receive more than ordered"
 * 
 * @param orderedQuantity Quantity ordered
 * @param alreadyReceived Quantity already received
 * @param receivingQuantity Quantity being received now
 * @returns True if valid
 */
export function isValidReceiptQuantity(
  orderedQuantity: number,
  alreadyReceived: number,
  receivingQuantity: number
): boolean {
  return (alreadyReceived + receivingQuantity) <= orderedQuantity
}

/**
 * Calculate remaining quantity to receive
 * 
 * Gherkin: "Receive remaining goods"
 * 
 * @param orderedQuantity Quantity ordered
 * @param receivedQuantity Quantity already received
 * @returns Remaining quantity
 */
export function calculateRemainingQuantity(
  orderedQuantity: number,
  receivedQuantity: number
): number {
  return Math.max(0, orderedQuantity - receivedQuantity)
}

/**
 * Determine if PO is fully received
 * 
 * Gherkin: "Receive remaining goods"
 * 
 * @param items Array of PO items with ordered and received quantities
 * @returns True if all items fully received
 */
export function isFullyReceived(
  items: Array<{ quantity: number; receivedQuantity: number }>
): boolean {
  if (!items || items.length === 0) {
    return false
  }

  return items.every(item => item.receivedQuantity >= item.quantity)
}

/**
 * Determine if PO is partially received
 * 
 * Gherkin: "Receive partial goods"
 * 
 * @param items Array of PO items with ordered and received quantities
 * @returns True if some items received but not all
 */
export function isPartiallyReceived(
  items: Array<{ quantity: number; receivedQuantity: number }>
): boolean {
  if (!items || items.length === 0) {
    return false
  }

  const totalOrdered = items.reduce((sum, item) => sum + item.quantity, 0)
  const totalReceived = items.reduce((sum, item) => sum + item.receivedQuantity, 0)

  return totalReceived > 0 && totalReceived < totalOrdered
}

/**
 * Calculate PO completion percentage
 * 
 * @param items Array of PO items with ordered and received quantities
 * @returns Completion percentage (0-100)
 */
export function calculatePOCompletionPercentage(
  items: Array<{ quantity: number; receivedQuantity: number }>
): number {
  if (!items || items.length === 0) {
    return 0
  }

  const totalOrdered = items.reduce((sum, item) => sum + item.quantity, 0)
  const totalReceived = items.reduce((sum, item) => sum + item.receivedQuantity, 0)

  if (totalOrdered === 0) {
    return 0
  }

  return (totalReceived / totalOrdered) * 100
}

/**
 * Generate PO number
 * 
 * Gherkin: "Create a purchase order"
 * Format: PO-{timestamp}
 * 
 * @returns Generated PO number
 */
export function generatePONumber(): string {
  return `PO-${Date.now()}`
}

/**
 * Validate expected delivery date
 * 
 * Gherkin: "Create a purchase order"
 * 
 * @param expectedDate Expected delivery date
 * @returns True if date is valid (in the future)
 */
export function isValidExpectedDate(expectedDate: Date): boolean {
  const now = new Date()
  return expectedDate > now
}

/**
 * Calculate days until expected delivery
 * 
 * @param expectedDate Expected delivery date
 * @returns Number of days until delivery
 */
export function calculateDaysUntilDelivery(expectedDate: Date): number {
  const now = new Date()
  const diffTime = expectedDate.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return Math.max(0, diffDays)
}

/**
 * Check if PO is overdue
 * 
 * @param expectedDate Expected delivery date
 * @param status Current PO status
 * @returns True if overdue
 */
export function isPOOverdue(expectedDate: Date, status: string): boolean {
  if (status === 'RECEIVED' || status === 'CANCELLED') {
    return false
  }

  const now = new Date()
  return expectedDate < now
}

/**
 * Calculate average PO value
 * 
 * Gherkin: "Generate purchase order report"
 * 
 * @param purchaseOrders Array of PO totals
 * @returns Average PO value
 */
export function calculateAveragePOValue(purchaseOrders: Array<{ totalAmount: number }>): number {
  if (!purchaseOrders || purchaseOrders.length === 0) {
    return 0
  }

  const total = purchaseOrders.reduce((sum, po) => sum + po.totalAmount, 0)
  return total / purchaseOrders.length
}

/**
 * Validate PO has at least one item
 * 
 * Gherkin: "Create a purchase order"
 * Contract: CreatePurchaseOrderRequestSchema requires items.min(1)
 * 
 * @param items Array of PO items
 * @returns True if PO has valid items
 */
export function hasValidPOItems(items: any[]): boolean {
  return Array.isArray(items) && items.length > 0
}

/**
 * Calculate total spend with supplier
 * 
 * Gherkin: "Generate supplier performance report"
 * 
 * @param purchaseOrders Array of POs for a supplier
 * @returns Total spend
 */
export function calculateSupplierSpend(
  purchaseOrders: Array<{ totalAmount: number; status: string }>
): number {
  return purchaseOrders
    .filter(po => po.status === 'RECEIVED')
    .reduce((sum, po) => sum + po.totalAmount, 0)
}

/**
 * Calculate average delivery time
 * 
 * Gherkin: "Generate supplier performance report"
 * 
 * @param purchaseOrders Array of POs with dates
 * @returns Average delivery days
 */
export function calculateAverageDeliveryTime(
  purchaseOrders: Array<{ 
    expectedDate: Date
    receivedDate: Date | null
    status: string
  }>
): number {
  const receivedPOs = purchaseOrders.filter(
    po => po.status === 'RECEIVED' && po.receivedDate
  )

  if (receivedPOs.length === 0) {
    return 0
  }

  const totalDays = receivedPOs.reduce((sum, po) => {
    const diffTime = po.receivedDate!.getTime() - po.expectedDate.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return sum + diffDays
  }, 0)

  return totalDays / receivedPOs.length
}
