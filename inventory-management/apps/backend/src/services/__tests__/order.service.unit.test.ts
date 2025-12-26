import { describe, it, expect, vi } from 'vitest'

/**
 * Pure Order Service Unit Tests
 * 
 * These tests validate pure functions with zero external dependencies:
 * - No Prisma calls
 * - No HTTP requests
 * - No I/O operations
 * - Deterministic, fast, isolated
 */

// ============================================================================
// PURE FUNCTIONS (No dependencies)
// ============================================================================

/**
 * Calculate the total amount for an order based on items
 * 
 * Gherkin: "Calculate order total"
 * Contract: OrderSchema, OrderItemSchema
 */
function calculateOrderTotal(items: Array<{ quantity: number; unitPrice: number }>): number {
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
 */
function calculateItemSubtotal(quantity: number, unitPrice: number): number {
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
 */
function isValidOrderStatusTransition(
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
 */
function canAddItemsToOrder(orderStatus: string): boolean {
  return orderStatus === 'PENDING'
}

/**
 * Check if order can have items removed
 * 
 * Gherkin: "Remove items from order"
 * Constraint: Only PENDING orders can have items removed
 */
function canRemoveItemsFromOrder(orderStatus: string): boolean {
  return orderStatus === 'PENDING'
}

/**
 * Validate order has at least one item
 * 
 * Gherkin: "Create a new order"
 * Contract: CreateOrderRequestSchema requires items.min(1)
 */
function hasValidOrderItems(items: any[]): boolean {
  return Array.isArray(items) && items.length > 0
}

/**
 * Calculate available inventory after reservation
 * 
 * Gherkin: "Cannot create order with insufficient inventory"
 * Used to validate if order can be created
 */
function calculateAvailableInventory(
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
 */
function hasSufficientInventory(
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
 */
function generateOrderNumber(): string {
  return `ORD-${Date.now()}`
}

/**
 * Validate order customer data
 * 
 * Gherkin: "Create a new order"
 * Contract: CreateOrderRequestSchema
 */
function isValidCustomerData(customerData: {
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
 */
function isValidShippingAddress(address: string): boolean {
  return typeof address === 'string' && address.length > 0 && address.length <= 500
}

/**
 * Calculate order item count
 * 
 * Gherkin: "Remove items from order"
 * Used to track item count changes
 */
function calculateOrderItemCount(items: any[]): number {
  return Array.isArray(items) ? items.length : 0
}

// ============================================================================
// UNIT TESTS
// ============================================================================

describe('Order Service - Unit Tests', () => {
  describe('calculateOrderTotal', () => {
    it('should calculate total for single item', () => {
      // Arrange
      const items = [{ quantity: 2, unitPrice: 29.99 }]

      // Act
      const total = calculateOrderTotal(items)

      // Assert
      expect(total).toBeCloseTo(59.98, 2)
    })

    it('should calculate total for multiple items', () => {
      // Arrange
      const items = [
        { quantity: 2, unitPrice: 29.99 },
        { quantity: 1, unitPrice: 12.99 },
      ]

      // Act
      const total = calculateOrderTotal(items)

      // Assert
      expect(total).toBeCloseTo(72.97, 2)
    })

    it('should calculate total for three items (Gherkin: Calculate order total)', () => {
      // Arrange
      const items = [
        { quantity: 2, unitPrice: 29.99 },
        { quantity: 3, unitPrice: 12.99 },
      ]

      // Act
      const total = calculateOrderTotal(items)

      // Assert
      expect(total).toBeCloseTo(98.95, 2)
    })

    it('should return 0 for empty items array', () => {
      // Arrange
      const items: Array<{ quantity: number; unitPrice: number }> = []

      // Act
      const total = calculateOrderTotal(items)

      // Assert
      expect(total).toBe(0)
    })

    it('should return 0 for null items', () => {
      // Arrange
      const items = null as any

      // Act
      const total = calculateOrderTotal(items)

      // Assert
      expect(total).toBe(0)
    })

    it('should return 0 for undefined items', () => {
      // Arrange
      const items = undefined as any

      // Act
      const total = calculateOrderTotal(items)

      // Assert
      expect(total).toBe(0)
    })

    it('should handle decimal precision correctly', () => {
      // Arrange
      const items = [
        { quantity: 1, unitPrice: 10.01 },
        { quantity: 1, unitPrice: 10.02 },
      ]

      // Act
      const total = calculateOrderTotal(items)

      // Assert
      expect(total).toBeCloseTo(20.03, 2)
    })

    it('should handle large quantities', () => {
      // Arrange
      const items = [{ quantity: 1000, unitPrice: 99.99 }]

      // Act
      const total = calculateOrderTotal(items)

      // Assert
      expect(total).toBeCloseTo(99990, 2)
    })

    it('should handle fractional prices', () => {
      // Arrange
      const items = [
        { quantity: 3, unitPrice: 0.99 },
        { quantity: 2, unitPrice: 1.49 },
      ]

      // Act
      const total = calculateOrderTotal(items)

      // Assert
      expect(total).toBeCloseTo(5.95, 2)
    })
  })

  describe('calculateItemSubtotal', () => {
    it('should calculate subtotal for single item', () => {
      // Arrange
      const quantity = 2
      const unitPrice = 29.99

      // Act
      const subtotal = calculateItemSubtotal(quantity, unitPrice)

      // Assert
      expect(subtotal).toBeCloseTo(59.98, 2)
    })

    it('should return 0 for zero quantity', () => {
      // Arrange
      const quantity = 0
      const unitPrice = 29.99

      // Act
      const subtotal = calculateItemSubtotal(quantity, unitPrice)

      // Assert
      expect(subtotal).toBe(0)
    })

    it('should return 0 for negative quantity', () => {
      // Arrange
      const quantity = -5
      const unitPrice = 29.99

      // Act
      const subtotal = calculateItemSubtotal(quantity, unitPrice)

      // Assert
      expect(subtotal).toBe(0)
    })

    it('should return 0 for zero price', () => {
      // Arrange
      const quantity = 5
      const unitPrice = 0

      // Act
      const subtotal = calculateItemSubtotal(quantity, unitPrice)

      // Assert
      expect(subtotal).toBe(0)
    })

    it('should return 0 for negative price', () => {
      // Arrange
      const quantity = 5
      const unitPrice = -10.00

      // Act
      const subtotal = calculateItemSubtotal(quantity, unitPrice)

      // Assert
      expect(subtotal).toBe(0)
    })

    it('should handle large quantities', () => {
      // Arrange
      const quantity = 500
      const unitPrice = 99.99

      // Act
      const subtotal = calculateItemSubtotal(quantity, unitPrice)

      // Assert
      expect(subtotal).toBeCloseTo(49995, 2)
    })
  })

  describe('isValidOrderStatusTransition', () => {
    it('should allow PENDING to CONFIRMED transition', () => {
      // Arrange
      const currentStatus = 'PENDING'
      const newStatus = 'CONFIRMED'

      // Act
      const isValid = isValidOrderStatusTransition(currentStatus, newStatus)

      // Assert
      expect(isValid).toBe(true)
    })

    it('should allow PENDING to CANCELLED transition', () => {
      // Arrange
      const currentStatus = 'PENDING'
      const newStatus = 'CANCELLED'

      // Act
      const isValid = isValidOrderStatusTransition(currentStatus, newStatus)

      // Assert
      expect(isValid).toBe(true)
    })

    it('should allow CONFIRMED to SHIPPED transition', () => {
      // Arrange
      const currentStatus = 'CONFIRMED'
      const newStatus = 'SHIPPED'

      // Act
      const isValid = isValidOrderStatusTransition(currentStatus, newStatus)

      // Assert
      expect(isValid).toBe(true)
    })

    it('should allow SHIPPED to DELIVERED transition', () => {
      // Arrange
      const currentStatus = 'SHIPPED'
      const newStatus = 'DELIVERED'

      // Act
      const isValid = isValidOrderStatusTransition(currentStatus, newStatus)

      // Assert
      expect(isValid).toBe(true)
    })

    it('should allow DELIVERED to RETURNED transition', () => {
      // Arrange
      const currentStatus = 'DELIVERED'
      const newStatus = 'RETURNED'

      // Act
      const isValid = isValidOrderStatusTransition(currentStatus, newStatus)

      // Assert
      expect(isValid).toBe(true)
    })

    it('should reject PENDING to SHIPPED transition (skip CONFIRMED)', () => {
      // Arrange
      const currentStatus = 'PENDING'
      const newStatus = 'SHIPPED'

      // Act
      const isValid = isValidOrderStatusTransition(currentStatus, newStatus)

      // Assert
      expect(isValid).toBe(false)
    })

    it('should reject CONFIRMED to DELIVERED transition (skip SHIPPED)', () => {
      // Arrange
      const currentStatus = 'CONFIRMED'
      const newStatus = 'DELIVERED'

      // Act
      const isValid = isValidOrderStatusTransition(currentStatus, newStatus)

      // Assert
      expect(isValid).toBe(false)
    })

    it('should reject CANCELLED to any transition', () => {
      // Arrange
      const currentStatus = 'CANCELLED'
      const newStatus = 'PENDING'

      // Act
      const isValid = isValidOrderStatusTransition(currentStatus, newStatus)

      // Assert
      expect(isValid).toBe(false)
    })

    it('should reject RETURNED to any transition', () => {
      // Arrange
      const currentStatus = 'RETURNED'
      const newStatus = 'PENDING'

      // Act
      const isValid = isValidOrderStatusTransition(currentStatus, newStatus)

      // Assert
      expect(isValid).toBe(false)
    })

    it('should reject invalid status', () => {
      // Arrange
      const currentStatus = 'INVALID_STATUS'
      const newStatus = 'PENDING'

      // Act
      const isValid = isValidOrderStatusTransition(currentStatus, newStatus)

      // Assert
      expect(isValid).toBe(false)
    })

    it('should allow CONFIRMED to CANCELLED transition', () => {
      // Arrange
      const currentStatus = 'CONFIRMED'
      const newStatus = 'CANCELLED'

      // Act
      const isValid = isValidOrderStatusTransition(currentStatus, newStatus)

      // Assert
      expect(isValid).toBe(true)
    })
  })

  describe('canAddItemsToOrder', () => {
    it('should allow adding items to PENDING order', () => {
      // Arrange
      const orderStatus = 'PENDING'

      // Act
      const canAdd = canAddItemsToOrder(orderStatus)

      // Assert
      expect(canAdd).toBe(true)
    })

    it('should not allow adding items to CONFIRMED order', () => {
      // Arrange
      const orderStatus = 'CONFIRMED'

      // Act
      const canAdd = canAddItemsToOrder(orderStatus)

      // Assert
      expect(canAdd).toBe(false)
    })

    it('should not allow adding items to SHIPPED order', () => {
      // Arrange
      const orderStatus = 'SHIPPED'

      // Act
      const canAdd = canAddItemsToOrder(orderStatus)

      // Assert
      expect(canAdd).toBe(false)
    })

    it('should not allow adding items to DELIVERED order', () => {
      // Arrange
      const orderStatus = 'DELIVERED'

      // Act
      const canAdd = canAddItemsToOrder(orderStatus)

      // Assert
      expect(canAdd).toBe(false)
    })

    it('should not allow adding items to CANCELLED order', () => {
      // Arrange
      const orderStatus = 'CANCELLED'

      // Act
      const canAdd = canAddItemsToOrder(orderStatus)

      // Assert
      expect(canAdd).toBe(false)
    })

    it('should not allow adding items to RETURNED order', () => {
      // Arrange
      const orderStatus = 'RETURNED'

      // Act
      const canAdd = canAddItemsToOrder(orderStatus)

      // Assert
      expect(canAdd).toBe(false)
    })
  })

  describe('canRemoveItemsFromOrder', () => {
    it('should allow removing items from PENDING order', () => {
      // Arrange
      const orderStatus = 'PENDING'

      // Act
      const canRemove = canRemoveItemsFromOrder(orderStatus)

      // Assert
      expect(canRemove).toBe(true)
    })

    it('should not allow removing items from CONFIRMED order', () => {
      // Arrange
      const orderStatus = 'CONFIRMED'

      // Act
      const canRemove = canRemoveItemsFromOrder(orderStatus)

      // Assert
      expect(canRemove).toBe(false)
    })

    it('should not allow removing items from SHIPPED order', () => {
      // Arrange
      const orderStatus = 'SHIPPED'

      // Act
      const canRemove = canRemoveItemsFromOrder(orderStatus)

      // Assert
      expect(canRemove).toBe(false)
    })

    it('should not allow removing items from DELIVERED order', () => {
      // Arrange
      const orderStatus = 'DELIVERED'

      // Act
      const canRemove = canRemoveItemsFromOrder(orderStatus)

      // Assert
      expect(canRemove).toBe(false)
    })

    it('should not allow removing items from CANCELLED order', () => {
      // Arrange
      const orderStatus = 'CANCELLED'

      // Act
      const canRemove = canRemoveItemsFromOrder(orderStatus)

      // Assert
      expect(canRemove).toBe(false)
    })

    it('should not allow removing items from RETURNED order', () => {
      // Arrange
      const orderStatus = 'RETURNED'

      // Act
      const canRemove = canRemoveItemsFromOrder(orderStatus)

      // Assert
      expect(canRemove).toBe(false)
    })
  })

  describe('hasValidOrderItems', () => {
    it('should return true for single item', () => {
      // Arrange
      const items = [{ productId: 'prod-1', quantity: 2, unitPrice: 29.99 }]

      // Act
      const isValid = hasValidOrderItems(items)

      // Assert
      expect(isValid).toBe(true)
    })

    it('should return true for multiple items', () => {
      // Arrange
      const items = [
        { productId: 'prod-1', quantity: 2, unitPrice: 29.99 },
        { productId: 'prod-2', quantity: 1, unitPrice: 12.99 },
      ]

      // Act
      const isValid = hasValidOrderItems(items)

      // Assert
      expect(isValid).toBe(true)
    })

    it('should return false for empty array', () => {
      // Arrange
      const items: any[] = []

      // Act
      const isValid = hasValidOrderItems(items)

      // Assert
      expect(isValid).toBe(false)
    })

    it('should return false for null', () => {
      // Arrange
      const items = null as any

      // Act
      const isValid = hasValidOrderItems(items)

      // Assert
      expect(isValid).toBe(false)
    })

    it('should return false for undefined', () => {
      // Arrange
      const items = undefined as any

      // Act
      const isValid = hasValidOrderItems(items)

      // Assert
      expect(isValid).toBe(false)
    })

    it('should return false for non-array', () => {
      // Arrange
      const items = 'not an array' as any

      // Act
      const isValid = hasValidOrderItems(items)

      // Assert
      expect(isValid).toBe(false)
    })
  })

  describe('calculateAvailableInventory', () => {
    it('should calculate available inventory correctly', () => {
      // Arrange
      const currentQuantity = 100
      const reservedQuantity = 20

      // Act
      const available = calculateAvailableInventory(currentQuantity, reservedQuantity)

      // Assert
      expect(available).toBe(80)
    })

    it('should return 0 when reserved equals current', () => {
      // Arrange
      const currentQuantity = 50
      const reservedQuantity = 50

      // Act
      const available = calculateAvailableInventory(currentQuantity, reservedQuantity)

      // Assert
      expect(available).toBe(0)
    })

    it('should return 0 when reserved exceeds current', () => {
      // Arrange
      const currentQuantity = 30
      const reservedQuantity = 50

      // Act
      const available = calculateAvailableInventory(currentQuantity, reservedQuantity)

      // Assert
      expect(available).toBe(0)
    })

    it('should return full quantity when nothing reserved', () => {
      // Arrange
      const currentQuantity = 100
      const reservedQuantity = 0

      // Act
      const available = calculateAvailableInventory(currentQuantity, reservedQuantity)

      // Assert
      expect(available).toBe(100)
    })

    it('should handle zero current quantity', () => {
      // Arrange
      const currentQuantity = 0
      const reservedQuantity = 0

      // Act
      const available = calculateAvailableInventory(currentQuantity, reservedQuantity)

      // Assert
      expect(available).toBe(0)
    })
  })

  describe('hasSufficientInventory', () => {
    it('should return true when available equals requested', () => {
      // Arrange
      const availableQuantity = 50
      const requestedQuantity = 50

      // Act
      const hasSufficient = hasSufficientInventory(availableQuantity, requestedQuantity)

      // Assert
      expect(hasSufficient).toBe(true)
    })

    it('should return true when available exceeds requested', () => {
      // Arrange
      const availableQuantity = 100
      const requestedQuantity = 50

      // Act
      const hasSufficient = hasSufficientInventory(availableQuantity, requestedQuantity)

      // Assert
      expect(hasSufficient).toBe(true)
    })

    it('should return false when available is less than requested', () => {
      // Arrange
      const availableQuantity = 30
      const requestedQuantity = 50

      // Act
      const hasSufficient = hasSufficientInventory(availableQuantity, requestedQuantity)

      // Assert
      expect(hasSufficient).toBe(false)
    })

    it('should return false when available is zero', () => {
      // Arrange
      const availableQuantity = 0
      const requestedQuantity = 1

      // Act
      const hasSufficient = hasSufficientInventory(availableQuantity, requestedQuantity)

      // Assert
      expect(hasSufficient).toBe(false)
    })

    it('should return true when both are zero', () => {
      // Arrange
      const availableQuantity = 0
      const requestedQuantity = 0

      // Act
      const hasSufficient = hasSufficientInventory(availableQuantity, requestedQuantity)

      // Assert
      expect(hasSufficient).toBe(true)
    })
  })

  describe('generateOrderNumber', () => {
    it('should generate order number with ORD prefix', () => {
      // Act
      const orderNumber = generateOrderNumber()

      // Assert
      expect(orderNumber).toMatch(/^ORD-\d+$/)
    })

    it('should generate unique order numbers', () => {
      // Mock Date.now to return different values
      const mockDateNow = vi.fn()
      mockDateNow.mockReturnValueOnce(1000)
      mockDateNow.mockReturnValueOnce(2000)

      // Temporarily replace Date.now
      const originalDateNow = Date.now
      Date.now = mockDateNow

      try {
        // Act
        const orderNumber1 = generateOrderNumber()
        const orderNumber2 = generateOrderNumber()

        // Assert
        expect(orderNumber1).toBe('ORD-1000')
        expect(orderNumber2).toBe('ORD-2000')
        expect(orderNumber1).not.toBe(orderNumber2)
      } finally {
        // Restore original Date.now
        Date.now = originalDateNow
      }
    })

    it('should generate order number with timestamp', () => {
      // Mock Date.now
      const mockTimestamp = 1234567890123
      const originalDateNow = Date.now
      Date.now = vi.fn().mockReturnValue(mockTimestamp)

      try {
        // Act
        const orderNumber = generateOrderNumber()

        // Assert
        expect(orderNumber).toBe('ORD-1234567890123')
      } finally {
        // Restore original Date.now
        Date.now = originalDateNow
      }
    })
  })

  describe('isValidCustomerData', () => {
    it('should validate correct customer data', () => {
      // Arrange
      const customerData = {
        customerId: 'cust-123',
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        customerPhone: '555-1234',
      }

      // Act
      const isValid = isValidCustomerData(customerData)

      // Assert
      expect(isValid).toBe(true)
    })

    it('should validate customer data without email and phone', () => {
      // Arrange
      const customerData = {
        customerId: 'cust-123',
        customerName: 'John Doe',
      }

      // Act
      const isValid = isValidCustomerData(customerData)

      // Assert
      expect(isValid).toBe(true)
    })

    it('should reject empty customerId', () => {
      // Arrange
      const customerData = {
        customerId: '',
        customerName: 'John Doe',
      }

      // Act
      const isValid = isValidCustomerData(customerData)

      // Assert
      expect(isValid).toBe(false)
    })

    it('should reject customerId exceeding max length', () => {
      // Arrange
      const customerData = {
        customerId: 'a'.repeat(256),
        customerName: 'John Doe',
      }

      // Act
      const isValid = isValidCustomerData(customerData)

      // Assert
      expect(isValid).toBe(false)
    })

    it('should reject empty customerName', () => {
      // Arrange
      const customerData = {
        customerId: 'cust-123',
        customerName: '',
      }

      // Act
      const isValid = isValidCustomerData(customerData)

      // Assert
      expect(isValid).toBe(false)
    })

    it('should reject customerName exceeding max length', () => {
      // Arrange
      const customerData = {
        customerId: 'cust-123',
        customerName: 'a'.repeat(256),
      }

      // Act
      const isValid = isValidCustomerData(customerData)

      // Assert
      expect(isValid).toBe(false)
    })

    it('should reject non-string customerId', () => {
      // Arrange
      const customerData = {
        customerId: 123 as any,
        customerName: 'John Doe',
      }

      // Act
      const isValid = isValidCustomerData(customerData)

      // Assert
      expect(isValid).toBe(false)
    })

    it('should reject non-string customerName', () => {
      // Arrange
      const customerData = {
        customerId: 'cust-123',
        customerName: 123 as any,
      }

      // Act
      const isValid = isValidCustomerData(customerData)

      // Assert
      expect(isValid).toBe(false)
    })
  })

  describe('isValidShippingAddress', () => {
    it('should validate correct shipping address', () => {
      // Arrange
      const address = '123 Main St, Springfield'

      // Act
      const isValid = isValidShippingAddress(address)

      // Assert
      expect(isValid).toBe(true)
    })

    it('should reject empty address', () => {
      // Arrange
      const address = ''

      // Act
      const isValid = isValidShippingAddress(address)

      // Assert
      expect(isValid).toBe(false)
    })

    it('should reject address exceeding max length', () => {
      // Arrange
      const address = 'a'.repeat(501)

      // Act
      const isValid = isValidShippingAddress(address)

      // Assert
      expect(isValid).toBe(false)
    })

    it('should accept address at max length', () => {
      // Arrange
      const address = 'a'.repeat(500)

      // Act
      const isValid = isValidShippingAddress(address)

      // Assert
      expect(isValid).toBe(true)
    })

    it('should reject non-string address', () => {
      // Arrange
      const address = 123 as any

      // Act
      const isValid = isValidShippingAddress(address)

      // Assert
      expect(isValid).toBe(false)
    })

    it('should reject null address', () => {
      // Arrange
      const address = null as any

      // Act
      const isValid = isValidShippingAddress(address)

      // Assert
      expect(isValid).toBe(false)
    })
  })

  describe('calculateOrderItemCount', () => {
    it('should return correct count for single item', () => {
      // Arrange
      const items = [{ productId: 'prod-1', quantity: 2, unitPrice: 29.99 }]

      // Act
      const count = calculateOrderItemCount(items)

      // Assert
      expect(count).toBe(1)
    })

    it('should return correct count for multiple items', () => {
      // Arrange
      const items = [
        { productId: 'prod-1', quantity: 2, unitPrice: 29.99 },
        { productId: 'prod-2', quantity: 1, unitPrice: 12.99 },
      ]

      // Act
      const count = calculateOrderItemCount(items)

      // Assert
      expect(count).toBe(2)
    })

    it('should return 0 for empty array', () => {
      // Arrange
      const items: any[] = []

      // Act
      const count = calculateOrderItemCount(items)

      // Assert
      expect(count).toBe(0)
    })

    it('should return 0 for null', () => {
      // Arrange
      const items = null as any

      // Act
      const count = calculateOrderItemCount(items)

      // Assert
      expect(count).toBe(0)
    })

    it('should return 0 for undefined', () => {
      // Arrange
      const items = undefined as any

      // Act
      const count = calculateOrderItemCount(items)

      // Assert
      expect(count).toBe(0)
    })

    it('should return 0 for non-array', () => {
      // Arrange
      const items = 'not an array' as any

      // Act
      const count = calculateOrderItemCount(items)

      // Assert
      expect(count).toBe(0)
    })
  })
})
