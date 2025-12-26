/**
 * Order Service - Pure Functions
 * 
 * This service contains pure functions for order business logic.
 * No external dependencies, no I/O, no Prisma calls.
 * 
 * These functions are designed to be:
 * - Testable (unit tests only)
 * - Reusable (across routes, services, etc.)
 * - Deterministic (same input = same output)
 * - Fast (no async operations)
 */

/**
 * Calculate the total amount for an order based on items
 * 
 * Gherkin: "Calculate order total"
 * Contract: OrderSchema, OrderItemSchema
 * 
 * @param items Array of order items with quantity and unitPrice
 * @returns Total amount for the order
 */
export function calculateOrderTotal(items: Array<{ quantity: number; unitPrice: number }>): number {
  if (!items || items.length === 0) {
    return 0
  }

  return items.reduce((total, item) => {
    const subtotal = item.quantity * item.unitPrice
    return total + subtotal
  }, 0)
}

/**
 * Calculate subtotal for a single order item
 * 
 * Gherkin: "Calculate order total" (item-level)
 * Contract: OrderItemSchema
 * 
 * @param quantity Number of units
 * @param unitPrice Price per unit
 * @returns Subtotal for the item
 */
export function calculateItemSubtotal(quantity: number, unitPrice: number): number {
  if (quantity <= 0 || unitPrice <= 0) {
    return 0
  }

  return quantity * unitPrice
}

/**
 * Validate order status transition
 * 
 * Gherkin: "Confirm order", "Ship order", "Deliver order", "Cancel order", "Return order"
 * Contract: OrderStatusSchema
 * 
 * Valid transitions:
 * - PENDING → CONFIRMED, CANCELLED
 * - CONFIRMED → SHIPPED, CANCELLED
 * - SHIPPED → DELIVERED
 * - DELIVERED → RETURNED
 * - CANCELLED → (none)
 * - RETURNED → (none)
 * 
 * @param currentStatus Current order status
 * @param newStatus Desired new status
 * @returns True if transition is valid
 */
export function isValidOrderStatusTransition(
  currentStatus: string,
  newStatus: string
): boolean {
  const validTransitions: Record<string, string[]> = {
    PENDING: ['CONFIRMED', 'CANCELLED'],
    CONFIRMED: ['SHIPPED', 'CANCELLED'],
    SHIPPED: ['DELIVERED'],
    DELIVERED: ['RETURNED'],
    CANCELLED: [],
    RETURNED: [],
  }

  const allowedTransitions = validTransitions[currentStatus] || []
  return allowedTransitions.includes(newStatus)
}

/**
 * Check if order can accept new items
 * 
 * Gherkin: "Add items to existing order"
 * Constraint: Only PENDING orders can have items added
 * 
 * @param orderStatus Current order status
 * @returns True if items can be added
 */
export function canAddItemsToOrder(orderStatus: string): boolean {
  return orderStatus === 'PENDING'
}

/**
 * Check if order can have items removed
 * 
 * Gherkin: "Remove items from order"
 * Constraint: Only PENDING orders can have items removed
 * 
 * @param orderStatus Current order status
 * @returns True if items can be removed
 */
export function canRemoveItemsFromOrder(orderStatus: string): boolean {
  return orderStatus === 'PENDING'
}

/**
 * Validate order has at least one item
 * 
 * Gherkin: "Create a new order"
 * Contract: CreateOrderRequestSchema requires items.min(1)
 * 
 * @param items Array of order items
 * @returns True if order has valid items
 */
export function hasValidOrderItems(items: any[]): boolean {
  return Array.isArray(items) && items.length > 0
}

/**
 * Calculate available inventory after reservation
 * 
 * Gherkin: "Cannot create order with insufficient inventory"
 * Used to validate if order can be created
 * 
 * @param currentQuantity Total quantity in stock
 * @param reservedQuantity Quantity already reserved
 * @returns Available quantity for new orders
 */
export function calculateAvailableInventory(
  currentQuantity: number,
  reservedQuantity: number
): number {
  return Math.max(0, currentQuantity - reservedQuantity)
}

/**
 * Check if sufficient inventory exists for order item
 * 
 * Gherkin: "Cannot create order with insufficient inventory"
 * Contract: InventoryLevelSchema
 * 
 * @param availableQuantity Available quantity
 * @param requestedQuantity Requested quantity
 * @returns True if sufficient inventory exists
 */
export function hasSufficientInventory(
  availableQuantity: number,
  requestedQuantity: number
): boolean {
  return availableQuantity >= requestedQuantity
}

/**
 * Generate order number
 * 
 * Gherkin: "Create a new order"
 * Format: ORD-{timestamp}
 * 
 * @returns Generated order number
 */
export function generateOrderNumber(): string {
  return `ORD-${Date.now()}`
}

/**
 * Validate order customer data
 * 
 * Gherkin: "Create a new order"
 * Contract: CreateOrderRequestSchema
 * 
 * @param customerData Customer information
 * @returns True if customer data is valid
 */
export function isValidCustomerData(customerData: {
  customerId: string
  customerName: string
  customerEmail?: string
  customerPhone?: string
}): boolean {
  return (
    typeof customerData.customerId === 'string' &&
    customerData.customerId.length > 0 &&
    customerData.customerId.length <= 255 &&
    typeof customerData.customerName === 'string' &&
    customerData.customerName.length > 0 &&
    customerData.customerName.length <= 255 &&
    (!customerData.customerEmail || typeof customerData.customerEmail === 'string') &&
    (!customerData.customerPhone || typeof customerData.customerPhone === 'string')
  )
}

/**
 * Validate shipping address
 * 
 * Gherkin: "Create a new order"
 * Contract: CreateOrderRequestSchema
 * 
 * @param address Shipping address
 * @returns True if address is valid
 */
export function isValidShippingAddress(address: string): boolean {
  return typeof address === 'string' && address.length > 0 && address.length <= 500
}

/**
 * Calculate order item count
 * 
 * Gherkin: "Remove items from order"
 * Used to track item count changes
 * 
 * @param items Array of order items
 * @returns Number of items in order
 */
export function calculateOrderItemCount(items: any[]): number {
  return Array.isArray(items) ? items.length : 0
}
