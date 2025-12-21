/**
 * Inventory-related contracts for Inventory Management System
 */

import { z } from 'zod'

// ============================================================================
// ENUMS
// ============================================================================

export enum InventoryTransactionType {
  PURCHASE = 'PURCHASE',
  SALE = 'SALE',
  ADJUSTMENT = 'ADJUSTMENT',
  RETURN = 'RETURN',
  DAMAGE = 'DAMAGE',
  TRANSFER = 'TRANSFER',
}

// ============================================================================
// ZOD SCHEMAS (Canonical)
// ============================================================================

export const InventoryTransactionTypeSchema = z.enum([
  'PURCHASE',
  'SALE',
  'ADJUSTMENT',
  'RETURN',
  'DAMAGE',
  'TRANSFER',
])

export const InventoryTransactionSchema = z.object({
  id: z.string().cuid(),
  productId: z.string().cuid(),
  type: InventoryTransactionTypeSchema,
  quantity: z.number().int().positive(),
  reference: z.string().min(1).max(255),
  notes: z.string().max(1000).nullable(),
  createdAt: z.date(),
  createdBy: z.string().cuid(),
})

export const InventoryLevelSchema = z.object({
  id: z.string().cuid(),
  productId: z.string().cuid(),
  currentQuantity: z.number().int().nonnegative(),
  reservedQuantity: z.number().int().nonnegative(),
  availableQuantity: z.number().int().nonnegative(),
  reorderLevel: z.number().int().nonnegative(),
  lastRestockDate: z.date().nullable(),
  nextRestockDate: z.date().nullable().optional(),
  updatedAt: z.date(),
})

export const CreateTransactionRequestSchema = z.object({
  productId: z.string().cuid(),
  type: InventoryTransactionTypeSchema,
  quantity: z.number().int().positive(),
  reference: z.string().min(1).max(255),
  notes: z.string().max(1000).optional(),
})

export const InventoryAdjustmentRequestSchema = z.object({
  productId: z.string().cuid(),
  newQuantity: z.number().int().nonnegative(),
  reason: z.string().min(1).max(255),
  notes: z.string().max(1000).optional(),
})

export const LowStockAlertSchema = z.object({
  productId: z.string().cuid(),
  productName: z.string().min(1).max(255),
  currentQuantity: z.number().int().nonnegative(),
  reorderLevel: z.number().int().nonnegative(),
  sku: z.string().min(1).max(50),
})

export const InventoryTransactionResponseSchema = z.object({
  success: z.boolean(),
  data: InventoryTransactionSchema.optional(),
  error: z.string().optional(),
})

export const InventoryLevelResponseSchema = z.object({
  success: z.boolean(),
  data: InventoryLevelSchema.optional(),
  error: z.string().optional(),
})

export const InventoryHistoryResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(InventoryTransactionSchema).optional(),
  total: z.number().int().nonnegative().optional(),
  page: z.number().int().positive().optional(),
  pageSize: z.number().int().positive().optional(),
  error: z.string().optional(),
})

export const LowStockAlertsResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(LowStockAlertSchema).optional(),
  total: z.number().int().nonnegative().optional(),
  error: z.string().optional(),
})

// ============================================================================
// TYPE EXPORTS (Inferred from Zod schemas)
// ============================================================================

export type InventoryTransaction = z.infer<typeof InventoryTransactionSchema>
export type InventoryLevel = z.infer<typeof InventoryLevelSchema>
export type CreateTransactionRequest = z.infer<typeof CreateTransactionRequestSchema>
export type InventoryAdjustmentRequest = z.infer<typeof InventoryAdjustmentRequestSchema>
export type LowStockAlert = z.infer<typeof LowStockAlertSchema>
export type InventoryTransactionResponse = z.infer<typeof InventoryTransactionResponseSchema>
export type InventoryLevelResponse = z.infer<typeof InventoryLevelResponseSchema>
export type InventoryHistoryResponse = z.infer<typeof InventoryHistoryResponseSchema>
export type LowStockAlertsResponse = z.infer<typeof LowStockAlertsResponseSchema>
