/**
 * Product Service - Pure Functions
 * 
 * This service contains pure functions for product business logic.
 * No external dependencies, no I/O, no Prisma calls.
 * 
 * These functions are designed to be:
 * - Testable (unit tests only)
 * - Reusable (across routes, services, etc.)
 * - Deterministic (same input = same output)
 * - Fast (no async operations)
 */

/**
 * Validate SKU format
 * 
 * Gherkin: "Create a new product"
 * Contract: CreateProductRequestSchema
 * 
 * @param sku Product SKU
 * @returns True if SKU is valid
 */
export function isValidSKU(sku: string): boolean {
  // SKU must be alphanumeric with hyphens, 1-50 characters
  return /^[A-Z0-9-]{1,50}$/.test(sku)
}

/**
 * Calculate product inventory value
 * 
 * Gherkin: "Generate inventory summary report"
 * 
 * @param quantity Current quantity
 * @param price Unit price
 * @returns Total value
 */
export function calculateProductValue(
  quantity: number,
  price: number
): number {
  if (quantity < 0 || price < 0) {
    return 0
  }
  return quantity * price
}

/**
 * Check if product is low stock
 * 
 * Gherkin: "Generate low stock alert"
 * Contract: ProductSchema, InventoryLevelSchema
 * 
 * @param currentQuantity Current inventory quantity
 * @param reorderLevel Reorder threshold
 * @returns True if low stock
 */
export function isLowStock(
  currentQuantity: number,
  reorderLevel: number
): boolean {
  return currentQuantity > 0 && currentQuantity <= reorderLevel
}

/**
 * Check if product is out of stock
 * 
 * Gherkin: "Generate out of stock alert"
 * Contract: InventoryLevelSchema
 * 
 * @param currentQuantity Current inventory quantity
 * @returns True if out of stock
 */
export function isOutOfStock(currentQuantity: number): boolean {
  return currentQuantity === 0
}

/**
 * Determine alert type for product
 * 
 * Gherkin: "Generate low stock alert", "Generate out of stock alert"
 * 
 * @param currentQuantity Current inventory quantity
 * @param reorderLevel Reorder threshold
 * @returns Alert type or null
 */
export function getStockAlertType(
  currentQuantity: number,
  reorderLevel: number
): 'OUT_OF_STOCK' | 'LOW_STOCK' | null {
  if (isOutOfStock(currentQuantity)) {
    return 'OUT_OF_STOCK'
  }
  if (isLowStock(currentQuantity, reorderLevel)) {
    return 'LOW_STOCK'
  }
  return null
}

/**
 * Calculate profit margin
 * 
 * @param price Selling price
 * @param cost Product cost
 * @returns Profit margin as percentage
 */
export function calculateProfitMargin(price: number, cost: number): number {
  if (price <= 0 || cost <= 0) {
    return 0
  }
  return ((price - cost) / price) * 100
}

/**
 * Calculate markup percentage
 * 
 * @param price Selling price
 * @param cost Product cost
 * @returns Markup percentage
 */
export function calculateMarkup(price: number, cost: number): number {
  if (cost <= 0) {
    return 0
  }
  return ((price - cost) / cost) * 100
}

/**
 * Validate price is greater than cost
 * 
 * Gherkin: "Create a new product"
 * Business rule: Price should be greater than cost
 * 
 * @param price Selling price
 * @param cost Product cost
 * @returns True if price is valid
 */
export function isPriceValid(price: number, cost: number): boolean {
  return price > 0 && cost > 0 && price > cost
}

/**
 * Check if product should be reordered
 * 
 * Gherkin: "Generate low stock alert"
 * 
 * @param currentQuantity Current inventory
 * @param reorderLevel Reorder threshold
 * @param reservedQuantity Reserved inventory
 * @returns True if should reorder
 */
export function shouldReorder(
  currentQuantity: number,
  reorderLevel: number,
  reservedQuantity: number = 0
): boolean {
  const availableQuantity = currentQuantity - reservedQuantity
  return availableQuantity <= reorderLevel
}

/**
 * Calculate suggested reorder quantity
 * 
 * @param currentQuantity Current inventory
 * @param reorderLevel Reorder threshold
 * @param optimalStock Optimal stock level
 * @returns Suggested reorder quantity
 */
export function calculateReorderQuantity(
  currentQuantity: number,
  reorderLevel: number,
  optimalStock: number
): number {
  if (currentQuantity >= optimalStock) {
    return 0
  }
  return Math.max(0, optimalStock - currentQuantity)
}

/**
 * Validate product name
 * 
 * Gherkin: "Create a new product"
 * Contract: CreateProductRequestSchema
 * 
 * @param name Product name
 * @returns True if name is valid
 */
export function isValidProductName(name: string): boolean {
  return typeof name === 'string' && name.length > 0 && name.length <= 255
}

/**
 * Validate product category
 * 
 * Gherkin: "Filter products by category"
 * Contract: CreateProductRequestSchema
 * 
 * @param category Product category
 * @returns True if category is valid
 */
export function isValidCategory(category: string): boolean {
  return typeof category === 'string' && category.length > 0 && category.length <= 100
}

/**
 * Check if product matches search query
 * 
 * Gherkin: "Search products by name"
 * 
 * @param product Product data
 * @param searchQuery Search query
 * @returns True if product matches
 */
export function matchesSearchQuery(
  product: { name: string; description?: string | null; sku: string },
  searchQuery: string
): boolean {
  const query = searchQuery.toLowerCase()
  return (
    product.name.toLowerCase().includes(query) ||
    product.sku.toLowerCase().includes(query) ||
    (product.description?.toLowerCase().includes(query) ?? false)
  )
}

/**
 * Check if product is in price range
 * 
 * Gherkin: "Filter products by price range"
 * 
 * @param price Product price
 * @param minPrice Minimum price
 * @param maxPrice Maximum price
 * @returns True if in range
 */
export function isInPriceRange(
  price: number,
  minPrice?: number,
  maxPrice?: number
): boolean {
  if (minPrice !== undefined && price < minPrice) {
    return false
  }
  if (maxPrice !== undefined && price > maxPrice) {
    return false
  }
  return true
}
