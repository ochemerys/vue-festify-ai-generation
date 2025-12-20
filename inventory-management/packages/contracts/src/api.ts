/**
 * API-related contracts and utilities for Inventory Management System
 */

export interface ApiError {
  code: string
  message: string
  details?: Record<string, unknown>
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: ApiError
  timestamp: string
}

export interface PaginationParams {
  page: number
  pageSize: number
}

export interface PaginatedResponse<T> {
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

export enum ApiErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  CONFLICT = 'CONFLICT',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  BAD_REQUEST = 'BAD_REQUEST',
}

export interface ValidationError {
  field: string
  message: string
}

export interface ValidationErrorResponse {
  success: false
  error: ApiError
  validationErrors: ValidationError[]
  timestamp: string
}

export interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy'
  timestamp: string
  version: string
  uptime: number
}

export interface AuthToken {
  accessToken: string
  refreshToken?: string
  expiresIn: number
  tokenType: string
}

export interface AuthResponse {
  success: boolean
  data?: AuthToken
  error?: ApiError
  timestamp: string
}
