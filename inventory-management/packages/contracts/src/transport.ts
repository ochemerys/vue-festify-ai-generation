/**
 * Transport-layer DTO schemas aligned with frontend expectations
 * - Dates serialized as ISO strings (string().datetime())
 * - Auth login response includes user payload alongside tokens
 */

import { z } from 'zod'
import {
  ProductSchema,
  ProductFiltersSchema,
} from './product.js'
import {
  OrderSchema,
} from './order.js'
import {
  PurchaseOrderSchema,
} from './purchase-order.js'
import {
  InventoryLevelSchema,
  InventoryTransactionSchema,
} from './inventory.js'
import { createApiResponseSchema, createPaginatedResponseSchema } from './api.js'

// Utility transforms for Date -> ISO string and vice versa
const dateAsString = z.string().datetime()

export const ProductDtoSchema = ProductSchema.extend({
  createdAt: dateAsString,
  updatedAt: dateAsString,
  // In transport, nullable fields often arrive as undefined; allow both
  description: ProductSchema.shape.description.nullable().optional(),
}).strict()

export const ProductListDtoSchema = z.array(ProductDtoSchema)
export const ProductFiltersDtoSchema = ProductFiltersSchema

export const OrderDtoSchema = OrderSchema.extend({
  createdAt: dateAsString,
  updatedAt: dateAsString,
  shippedAt: dateAsString.nullable().optional(),
  deliveredAt: dateAsString.nullable().optional(),
}).strict()

export const PurchaseOrderDtoSchema = PurchaseOrderSchema.extend({
  expectedDate: dateAsString,
  receivedDate: dateAsString.nullable().optional(),
  createdAt: dateAsString,
  updatedAt: dateAsString,
}).strict()

export const InventoryLevelDtoSchema = InventoryLevelSchema.extend({
  lastRestockDate: dateAsString.nullable(),
  nextRestockDate: dateAsString.nullable().optional(),
  updatedAt: dateAsString,
}).strict()

export const InventoryTransactionDtoSchema = InventoryTransactionSchema.extend({
  createdAt: dateAsString,
}).strict()

// Frontend-auth aligned shapes
export const UserSchema = z.object({
  id: z.string().cuid(),
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  role: z.enum(['ADMIN', 'MANAGER', 'STAFF', 'VIEWER']),
})

export const LoginResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string().optional(),
  expiresIn: z.number().int().positive(),
  tokenType: z.string(),
  user: UserSchema,
})

export const LoginApiResponseSchema = createApiResponseSchema(LoginResponseSchema)

// Generic Response DTOs aligned with frontend
export const ProductApiResponseSchema = createApiResponseSchema(ProductDtoSchema)
export const ProductPaginatedResponseSchema = createPaginatedResponseSchema(ProductDtoSchema)

export const OrderApiResponseSchema = createApiResponseSchema(OrderDtoSchema)
export const OrderPaginatedResponseSchema = createPaginatedResponseSchema(OrderDtoSchema)

export const PurchaseOrderApiResponseSchema = createApiResponseSchema(PurchaseOrderDtoSchema)
export const PurchaseOrderPaginatedResponseSchema = createPaginatedResponseSchema(PurchaseOrderDtoSchema)

export const InventoryLevelApiResponseSchema = createApiResponseSchema(InventoryLevelDtoSchema)
export const InventoryLevelPaginatedResponseSchema = createPaginatedResponseSchema(InventoryLevelDtoSchema)

export type ProductDto = z.infer<typeof ProductDtoSchema>
export type OrderDto = z.infer<typeof OrderDtoSchema>
export type PurchaseOrderDto = z.infer<typeof PurchaseOrderDtoSchema>
export type InventoryLevelDto = z.infer<typeof InventoryLevelDtoSchema>
export type InventoryTransactionDto = z.infer<typeof InventoryTransactionDtoSchema>
export type User = z.infer<typeof UserSchema>
export type LoginResponse = z.infer<typeof LoginResponseSchema>
