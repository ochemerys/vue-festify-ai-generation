/**
 * Inventory Management System - Shared Contracts
 * 
 * This package contains all shared type definitions and Zod schemas
 * used across the frontend and backend applications.
 * 
 * Zod schemas are the canonical source of truth for validation.
 * Types are inferred from schemas using z.infer<typeof Schema>.
 * 
 * Usage:
 * - Frontend: import { Product, ProductSchema } from '@inventory/contracts'
 * - Backend: import { CreateProductRequestSchema } from '@inventory/contracts'
 */

// ============================================================================
// PRODUCT CONTRACTS
// ============================================================================

export type {
  Product,
  CreateProductRequest,
  UpdateProductRequest,
  ProductResponse,
  ProductListResponse,
  ProductFilters,
} from './product'

export {
  ProductSchema,
  CreateProductRequestSchema,
  UpdateProductRequestSchema,
  ProductFiltersSchema,
  ProductResponseSchema,
  ProductListResponseSchema,
} from './product'

// ============================================================================
// INVENTORY CONTRACTS
// ============================================================================

export type {
  InventoryTransaction,
  InventoryLevel,
  CreateTransactionRequest,
  InventoryAdjustmentRequest,
  InventoryTransactionResponse,
  InventoryLevelResponse,
  InventoryHistoryResponse,
  LowStockAlert,
  LowStockAlertsResponse,
} from './inventory'

export {
  InventoryTransactionType,
  InventoryTransactionTypeSchema,
  InventoryTransactionSchema,
  InventoryLevelSchema,
  CreateTransactionRequestSchema,
  InventoryAdjustmentRequestSchema,
  LowStockAlertSchema,
  InventoryTransactionResponseSchema,
  InventoryLevelResponseSchema,
  InventoryHistoryResponseSchema,
  LowStockAlertsResponseSchema,
} from './inventory'

// ============================================================================
// ORDER CONTRACTS
// ============================================================================

export type {
  Order,
  OrderItem,
  CreateOrderRequest,
  UpdateOrderStatusRequest,
  OrderResponse,
  OrderListResponse,
  OrderFilters,
  OrderSummary,
  OrderSummaryResponse,
} from './order'

export {
  OrderStatus,
  OrderStatusSchema,
  OrderItemSchema,
  OrderSchema,
  CreateOrderRequestSchema,
  UpdateOrderStatusRequestSchema,
  OrderFiltersSchema,
  OrderSummarySchema,
  OrderResponseSchema,
  OrderListResponseSchema,
  OrderSummaryResponseSchema,
} from './order'

// ============================================================================
// API CONTRACTS
// ============================================================================

export type {
  ApiError,
  ApiResponse,
  PaginationParams,
  PaginatedResponse,
  ValidationError,
  ValidationErrorResponse,
  HealthCheckResponse,
  AuthToken,
  AuthResponse,
} from './api'

export {
  ApiErrorCode,
  ApiErrorCodeSchema,
  ApiErrorSchema,
  PaginationParamsSchema,
  ValidationErrorSchema,
  HealthCheckResponseSchema,
  AuthTokenSchema,
  AuthResponseSchema,
  ValidationErrorResponseSchema,
  createApiResponseSchema,
  createPaginatedResponseSchema,
} from './api'
