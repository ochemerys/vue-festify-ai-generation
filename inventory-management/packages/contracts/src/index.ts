/**
 * Inventory Management System - Shared Contracts
 * 
 * This package contains all shared type definitions and contracts
 * used across the frontend and backend applications.
 * 
 * Usage:
 * - Frontend: import { Product, Order } from '@inventory/contracts'
 * - Backend: import { Product, Order } from '@inventory/contracts'
 */

// Product contracts
export type {
  Product,
  CreateProductRequest,
  UpdateProductRequest,
  ProductResponse,
  ProductListResponse,
  ProductFilters,
} from './product'

// Inventory contracts
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

export { InventoryTransactionType } from './inventory'

// Order contracts
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

export { OrderStatus } from './order'

// API contracts
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

export { ApiErrorCode } from './api'
