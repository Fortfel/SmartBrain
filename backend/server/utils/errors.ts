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
  constructor(message: string) {
    super(message, 400)
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
 * Global error handler middleware
 */
export const errorHandler = (err: unknown, _req: Request, res: Response, _next: NextFunction): void => {
  // Default error values
  let statusCode = 500
  let message = 'Internal server error'
  let isOperational = false

  // Handle known errors
  if (err instanceof AppError) {
    statusCode = err.statusCode
    message = err.message
    isOperational = err.isOperational
  } else if (err instanceof Error) {
    message = err.message
  }

  // Log error
  console.error(`[ERROR] ${statusCode.toString()}: ${message}`, err)

  // Send response
  res.status(statusCode).json({
    error: message,
    ...(isOperational ? {} : { details: 'An unexpected error occurred' }),
  })
}
