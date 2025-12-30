import { ApiErrorCode } from '@inventory/contracts'

/**
 * Standard error response format
 */
export interface ErrorResponse {
  success: false
  error: {
    code: string
    message: string
    details?: Record<string, unknown> | undefined
  }
  timestamp: string
}

/**
 * Create standardized error response
 */
export function createErrorResponse(
  code: ApiErrorCode | string,
  message: string,
  details?: Record<string, unknown>
): ErrorResponse {
  return {
    success: false,
    error: {
      code,
      message,
      details,
    },
    timestamp: new Date().toISOString(),
  }
}

/**
 * Create validation error response
 */
export function createValidationError(
  message: string,
  validationErrors: Array<{ field: string; message: string }>
): ErrorResponse {
  return createErrorResponse(
    'VALIDATION_ERROR',
    message,
    { validationErrors }
  )
}

/**
 * Create not found error response
 */
export function createNotFoundError(resource: string): ErrorResponse {
  return createErrorResponse(
    'NOT_FOUND',
    `${resource} not found`
  )
}

/**
 * Create unauthorized error response
 */
export function createUnauthorizedError(message: string = 'Unauthorized'): ErrorResponse {
  return createErrorResponse(
    'UNAUTHORIZED',
    message
  )
}

/**
 * Create forbidden error response
 */
export function createForbiddenError(message: string = 'Forbidden'): ErrorResponse {
  return createErrorResponse(
    'FORBIDDEN',
    message
  )
}

/**
 * Create conflict error response
 */
export function createConflictError(message: string): ErrorResponse {
  return createErrorResponse(
    'CONFLICT',
    message
  )
}

/**
 * Create internal server error response
 */
export function createInternalError(message: string = 'Internal server error'): ErrorResponse {
  return createErrorResponse(
    'INTERNAL_ERROR',
    message
  )
}

/**
 * Create bad request error response
 */
export function createBadRequestError(message: string, details?: Record<string, unknown>): ErrorResponse {
  return createErrorResponse(
    'BAD_REQUEST',
    message,
    details
  )
}
