/**
 * Order-related contracts for Inventory Management System
 */

import { z } from 'zod'

// ============================================================================
// ENUMS
// ============================================================================

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  RETURNED = 'RETURNED',
}

// ============================================================================
// ZOD SCHEMAS (Canonical)
// ============================================================================

export const OrderStatusSchema = z.enum([
  'PENDING',
  'CONFIRMED',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
  'RETURNED',
])

export const OrderItemSchema = z.object({
  id: z.string().cuid().optional(),
  orderId: z.string().cuid().optional(),
  productId: z.string().cuid(),
  quantity: z.number().int().positive(),
  unitPrice: z.number().positive(),
  subtotal: z.number().positive(),
})

export const OrderSchema = z.object({
  id: z.string().cuid(),
  orderNumber: z.string().min(1).max(50),
  customerId: z.string().min(1).max(255),
  customerName: z.string().min(1).max(255),
  customerEmail: z.string().email().optional(),
  customerPhone: z.string().optional(),
  items: z.array(OrderItemSchema).min(1),
  status: OrderStatusSchema,
  totalAmount: z.number().positive(),
  shippingAddress: z.string().min(1).max(500),
  notes: z.string().max(1000).nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  shippedAt: z.date().nullable().optional(),
  deliveredAt: z.date().nullable().optional(),
})

export const CreateOrderRequestSchema = z.object({
  customerId: z.string().min(1).max(255),
  customerName: z.string().min(1).max(255),
  customerEmail: z.string().email().optional(),
  customerPhone: z.string().optional(),
  items: z.array(OrderItemSchema.omit({ id: true, orderId: true })).min(1),
  shippingAddress: z.string().min(1).max(500),
  notes: z.string().max(1000).optional(),
})

export const UpdateOrderStatusRequestSchema = z.object({
  status: OrderStatusSchema,
  notes: z.string().max(1000).optional(),
})

export const OrderFiltersSchema = z.object({
  status: OrderStatusSchema.optional(),
  customerId: z.string().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().default(10),
})

export const OrderSummarySchema = z.object({
  totalOrders: z.number().int().nonnegative(),
  totalRevenue: z.number().nonnegative(),
  averageOrderValue: z.number().nonnegative(),
  pendingOrders: z.number().int().nonnegative(),
  shippedOrders: z.number().int().nonnegative(),
  deliveredOrders: z.number().int().nonnegative(),
})

export const OrderResponseSchema = z.object({
  success: z.boolean(),
  data: OrderSchema.optional(),
  error: z.string().optional(),
})

export const OrderListResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(OrderSchema).optional(),
  total: z.number().int().nonnegative().optional(),
  page: z.number().int().positive().optional(),
  pageSize: z.number().int().positive().optional(),
  error: z.string().optional(),
})

export const OrderSummaryResponseSchema = z.object({
  success: z.boolean(),
  data: OrderSummarySchema.optional(),
  error: z.string().optional(),
})

// ============================================================================
// TYPE EXPORTS (Inferred from Zod schemas)
// ============================================================================

export type OrderItem = z.infer<typeof OrderItemSchema>
export type Order = z.infer<typeof OrderSchema>
export type CreateOrderRequest = z.infer<typeof CreateOrderRequestSchema>
export type UpdateOrderStatusRequest = z.infer<typeof UpdateOrderStatusRequestSchema>
export type OrderFilters = z.infer<typeof OrderFiltersSchema>
export type OrderSummary = z.infer<typeof OrderSummarySchema>
export type OrderResponse = z.infer<typeof OrderResponseSchema>
export type OrderListResponse = z.infer<typeof OrderListResponseSchema>
export type OrderSummaryResponse = z.infer<typeof OrderSummaryResponseSchema>
