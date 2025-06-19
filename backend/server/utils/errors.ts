import type { Request, Response, NextFunction } from 'express'

/**
 * Base application error class
 */
export class AppError extends Error {
  readonly statusCode: number
  readonly isOperational: boolean

  constructor(message: string, statusCode: number, isOperational = true) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = isOperational

    // Capture stack trace
    Error.captureStackTrace(this, this.constructor)
  }
}

/**
 * Error for invalid user input
 */
export class ValidationError extends AppError {
  readonly field?: string
  readonly code?: string

  constructor(message: string, field?: string, code?: string) {
    super(message, 400)
    this.field = field
    this.code = code
  }
}

/**
 * Error for authentication failures
 */
export class AuthenticationError extends AppError {
  constructor(message = 'Invalid email or password') {
    super(message, 401)
  }
}

/**
 * Error for authorization failures
 */
export class AuthorizationError extends AppError {
  constructor(message = 'You are not authorized to perform this action') {
    super(message, 403)
  }
}

/**
 * Error for resource not found
 */
export class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404)
  }
}

/**
 * Error for conflicts (e.g., duplicate resources)
 */
export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409)
  }
}

/**
 * Error for rate limiting
 */
export class RateLimitError extends AppError {
  readonly limit: number
  readonly reset: Date

  constructor(message: string, limit: number, reset: Date) {
    super(message, 429)
    this.limit = limit
    this.reset = reset
  }
}

/**
 * Interface for error response
 */
type ErrorResponse = {
  error: string
  statusCode: number
  timestamp: string
  path?: string
  field?: string
  code?: string
  limit?: number
  reset?: string
}

/**
 * Global error handler middleware
 */
export const errorHandler = (err: unknown, req: Request, res: Response, _next: NextFunction): void => {
  // Default error values
  let statusCode = 500
  let message = 'Internal server error'
  let isOperational = false
  let field: string | undefined
  let code: string | undefined
  let limit: number | undefined
  let reset: string | undefined

  // Handle known errors
  if (err instanceof AppError) {
    statusCode = err.statusCode
    message = err.message
    isOperational = err.isOperational

    // Handle specific error types
    if (err instanceof ValidationError) {
      field = err.field
      code = err.code
    } else if (err instanceof RateLimitError) {
      limit = err.limit
      reset = err.reset.toISOString()
    }
  } else if (err instanceof Error) {
    message = err.message
  }

  // Log error with more context
  const logMessage = `[ERROR] ${statusCode.toString()} - ${message}`
  const logContext = {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    stack: err instanceof Error ? err.stack : undefined,
  }

  if (statusCode >= 500) {
    console.error(logMessage, logContext)
  } else {
    console.warn(logMessage, { method: req.method, url: req.url })
  }

  // Build error response
  const errorResponse: ErrorResponse = {
    error: message,
    statusCode,
    timestamp: new Date().toISOString(),
    path: req.path,
  }

  // Add optional fields
  if (field) errorResponse.field = field
  if (code) errorResponse.code = code
  if (limit) errorResponse.limit = limit
  if (reset) errorResponse.reset = reset

  // Don't expose internal server errors in production
  if (!isOperational && process.env.NODE_ENV === 'production') {
    errorResponse.error = 'Internal server error'
  }

  // Send response
  res.status(statusCode).json(errorResponse)
}

/**
 * Async error wrapper - catches async errors and forwards to error handler
 */
export const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

/**
 * 404 handler middleware - should be used after all routes
 */
export const notFoundHandler = (req: Request, _res: Response, next: NextFunction): void => {
  next(new NotFoundError(`Route ${req.originalUrl}`))
}
