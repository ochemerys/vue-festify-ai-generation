/**
 * Product-related contracts for Inventory Management System
 */

import { z } from 'zod'

// ============================================================================
// ZOD SCHEMAS (Canonical)
// ============================================================================

export const ProductSchema = z.object({
  id: z.string().cuid(),
  sku: z.string().min(1).max(50),
  name: z.string().min(1).max(255),
  description: z.string().max(1000).nullable(),
  category: z.string().min(1).max(100),
  price: z.number().positive(),
  cost: z.number().positive(),
  reorderLevel: z.number().int().nonnegative().default(10),
  supplier: z.string().min(1).max(255),
  isActive: z.boolean().default(true),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const CreateProductRequestSchema = z.object({
  sku: z.string().min(1).max(50),
  name: z.string().min(1).max(255),
  description: z.string().max(1000).optional(),
  category: z.string().min(1).max(100),
  price: z.number().positive(),
  cost: z.number().positive(),
  reorderLevel: z.number().int().nonnegative().default(10),
  supplier: z.string().min(1).max(255),
})

export const UpdateProductRequestSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().max(1000).optional(),
  category: z.string().min(1).max(100).optional(),
  price: z.number().positive().optional(),
  cost: z.number().positive().optional(),
  reorderLevel: z.number().int().nonnegative().optional(),
  supplier: z.string().min(1).max(255).optional(),
})

export const ProductFiltersSchema = z.object({
  category: z.string().optional(),
  supplier: z.string().optional(),
  minPrice: z.string().optional().transform(val => val ? parseFloat(val) : undefined),
  maxPrice: z.string().optional().transform(val => val ? parseFloat(val) : undefined),
  search: z.string().optional(),
  page: z.string().optional().transform(val => val ? parseInt(val) : 1),
  pageSize: z.string().optional().transform(val => val ? parseInt(val) : 10),
}).transform(data => ({
  ...data,
  minPrice: data.minPrice !== undefined ? Math.max(0, data.minPrice) : undefined,
  maxPrice: data.maxPrice !== undefined ? Math.max(0, data.maxPrice) : undefined,
  page: Math.max(1, data.page),
  pageSize: Math.max(1, data.pageSize),
}))

export const ProductResponseSchema = z.object({
  success: z.boolean(),
  data: ProductSchema.optional(),
  error: z.string().optional(),
})

export const ProductListResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(ProductSchema).optional(),
  total: z.number().int().nonnegative().optional(),
  page: z.number().int().positive().optional(),
  pageSize: z.number().int().positive().optional(),
  error: z.string().optional(),
})

// ============================================================================
// TYPE EXPORTS (Inferred from Zod schemas)
// ============================================================================

export type Product = z.infer<typeof ProductSchema>
export type CreateProductRequest = z.infer<typeof CreateProductRequestSchema>
export type UpdateProductRequest = z.infer<typeof UpdateProductRequestSchema>
export type ProductFilters = z.infer<typeof ProductFiltersSchema>
export type ProductResponse = z.infer<typeof ProductResponseSchema>
export type ProductListResponse = z.infer<typeof ProductListResponseSchema>
