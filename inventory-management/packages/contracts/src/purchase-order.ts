/**
 * Purchase Order-related contracts for Inventory Management System
 */

import { z } from 'zod'

// ============================================================================
// ENUMS
// ============================================================================

export enum POStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  CONFIRMED = 'CONFIRMED',
  PARTIALLY_RECEIVED = 'PARTIALLY_RECEIVED',
  RECEIVED = 'RECEIVED',
  CANCELLED = 'CANCELLED',
}

// ============================================================================
// ZOD SCHEMAS (Canonical)
// ============================================================================

export const POStatusSchema = z.enum([
  'DRAFT',
  'SUBMITTED',
  'CONFIRMED',
  'PARTIALLY_RECEIVED',
  'RECEIVED',
  'CANCELLED',
])

export const PurchaseOrderItemSchema = z.object({
  id: z.string().cuid().optional(),
  purchaseOrderId: z.string().cuid().optional(),
  productId: z.string().cuid(),
  quantity: z.number().int().positive(),
  unitPrice: z.number().positive(),
  subtotal: z.number().positive(),
  receivedQuantity: z.number().int().nonnegative().default(0),
})

export const PurchaseOrderSchema = z.object({
  id: z.string().cuid(),
  poNumber: z.string().min(1).max(50),
  supplierId: z.string().cuid(),
  status: POStatusSchema,
  totalAmount: z.number().positive(),
  expectedDate: z.date(),
  receivedDate: z.date().nullable().optional(),
  notes: z.string().max(1000).nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const CreatePurchaseOrderRequestSchema = z.object({
  supplierId: z.string().cuid(),
  expectedDate: z.string().transform(str => new Date(str)),
  notes: z.string().max(1000).optional(),
  items: z.array(z.object({
    productId: z.string().cuid(),
    quantity: z.number().int().positive(),
    unitPrice: z.number().positive(),
  })).min(1),
})

export const UpdatePurchaseOrderStatusRequestSchema = z.object({
  status: POStatusSchema,
  notes: z.string().max(1000).optional(),
})

export const PurchaseOrderFiltersSchema = z.object({
  status: POStatusSchema.optional(),
  supplierId: z.string().optional(),
  startDate: z.string().transform(str => new Date(str)).optional(),
  endDate: z.string().transform(str => new Date(str)).optional(),
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().default(10),
})

export const GoodsReceiptRequestSchema = z.object({
  items: z.array(z.object({
    productId: z.string().cuid(),
    quantity: z.number().int().positive(),
  })).min(1),
  notes: z.string().max(1000).optional(),
})

export const GoodsReceiptSchema = z.object({
  id: z.string().cuid(),
  receiptNumber: z.string().min(1).max(50),
  purchaseOrderId: z.string().cuid(),
  receivedDate: z.date(),
  notes: z.string().max(1000).nullable(),
  createdAt: z.date(),
})

export const PurchaseOrderSummarySchema = z.object({
  totalPOs: z.number().int().nonnegative(),
  totalSpend: z.number().nonnegative(),
  averagePOValue: z.number().nonnegative(),
  receivedPOs: z.number().int().nonnegative(),
  pendingPOs: z.number().int().nonnegative(),
})

export const PurchaseOrderResponseSchema = z.object({
  success: z.boolean(),
  data: PurchaseOrderSchema.optional(),
  error: z.string().optional(),
})

export const PurchaseOrderListResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(PurchaseOrderSchema).optional(),
  total: z.number().int().nonnegative().optional(),
  page: z.number().int().positive().optional(),
  pageSize: z.number().int().positive().optional(),
  error: z.string().optional(),
})

export const PurchaseOrderSummaryResponseSchema = z.object({
  success: z.boolean(),
  data: PurchaseOrderSummarySchema.optional(),
  error: z.string().optional(),
})

// ============================================================================
// TYPE EXPORTS (Inferred from Zod schemas)
// ============================================================================

export type PurchaseOrderItem = z.infer<typeof PurchaseOrderItemSchema>
export type PurchaseOrder = z.infer<typeof PurchaseOrderSchema>
export type CreatePurchaseOrderRequest = z.infer<typeof CreatePurchaseOrderRequestSchema>
export type UpdatePurchaseOrderStatusRequest = z.infer<typeof UpdatePurchaseOrderStatusRequestSchema>
export type PurchaseOrderFilters = z.infer<typeof PurchaseOrderFiltersSchema>
export type GoodsReceiptRequest = z.infer<typeof GoodsReceiptRequestSchema>
export type GoodsReceipt = z.infer<typeof GoodsReceiptSchema>
export type PurchaseOrderSummary = z.infer<typeof PurchaseOrderSummarySchema>
export type PurchaseOrderResponse = z.infer<typeof PurchaseOrderResponseSchema>
export type PurchaseOrderListResponse = z.infer<typeof PurchaseOrderListResponseSchema>
export type PurchaseOrderSummaryResponse = z.infer<typeof PurchaseOrderSummaryResponseSchema>
