/**
 * API-related contracts and utilities for Inventory Management System
 */

import { z } from 'zod'

// ============================================================================
// ENUMS
// ============================================================================

export enum ApiErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  CONFLICT = 'CONFLICT',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  BAD_REQUEST = 'BAD_REQUEST',
}

// ============================================================================
// ZOD SCHEMAS (Canonical)
// ============================================================================

export const ApiErrorCodeSchema = z.enum([
  'VALIDATION_ERROR',
  'NOT_FOUND',
  'UNAUTHORIZED',
  'FORBIDDEN',
  'CONFLICT',
  'INTERNAL_ERROR',
  'BAD_REQUEST',
])

export const ApiErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
  details: z.record(z.unknown()).optional(),
})

export const PaginationParamsSchema = z.object({
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().default(10),
})

export const ValidationErrorSchema = z.object({
  field: z.string(),
  message: z.string(),
})

export const HealthCheckResponseSchema = z.object({
  status: z.enum(['healthy', 'unhealthy']),
  timestamp: z.string().datetime(),
  version: z.string(),
  uptime: z.number().nonnegative(),
})

export const AuthTokenSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string().optional(),
  expiresIn: z.number().int().positive(),
  tokenType: z.string(),
})

export const AuthResponseSchema = z.object({
  success: z.boolean(),
  data: AuthTokenSchema.optional(),
  error: ApiErrorSchema.optional(),
  timestamp: z.string().datetime(),
})

export const ValidationErrorResponseSchema = z.object({
  success: z.literal(false),
  error: ApiErrorSchema,
  validationErrors: z.array(ValidationErrorSchema),
  timestamp: z.string().datetime(),
})

// Generic ApiResponse - for use with type parameter
export const createApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema.optional(),
    error: ApiErrorSchema.optional(),
    timestamp: z.string().datetime(),
  })

// Generic PaginatedResponse - for use with type parameter
export const createPaginatedResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: z.array(dataSchema),
    pagination: z.object({
      page: z.number().int().positive(),
      pageSize: z.number().int().positive(),
      total: z.number().int().nonnegative(),
      totalPages: z.number().int().nonnegative(),
    }),
    error: ApiErrorSchema.optional(),
    timestamp: z.string().datetime(),
  })

// ============================================================================
// TYPE EXPORTS (Inferred from Zod schemas)
// ============================================================================

export type ApiError = z.infer<typeof ApiErrorSchema>
export type PaginationParams = z.infer<typeof PaginationParamsSchema>
export type ValidationError = z.infer<typeof ValidationErrorSchema>
export type HealthCheckResponse = z.infer<typeof HealthCheckResponseSchema>
export type AuthToken = z.infer<typeof AuthTokenSchema>
export type AuthResponse = z.infer<typeof AuthResponseSchema>
export type ValidationErrorResponse = z.infer<typeof ValidationErrorResponseSchema>

// Generic types for ApiResponse and PaginatedResponse
export type ApiResponse<T> = {
  success: boolean
  data?: T
  error?: ApiError
  timestamp: string
}

export type PaginatedResponse<T> = {
  success: boolean
  data: T[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
  error?: ApiError
  timestamp: string
}
