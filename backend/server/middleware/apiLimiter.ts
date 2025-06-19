import type { Request, Response, NextFunction } from 'express'
import prisma from '../prisma.js'
import type { SafeUser } from '../types.js'
import { config } from '../config.js'
import { AuthorizationError, NotFoundError, RateLimitError } from '../utils/errors.js'

/**
 * Helper function to extract user ID from request
 */
const getUserIdFromRequest = (req: Request): number | null => {
  // Check body first, then params, then query
  const bodyId = req.body?.id // eslint-disable-line
  const paramId = req.params?.id // eslint-disable-line
  const queryId = req.query?.id // eslint-disable-line

  if (bodyId && typeof bodyId === 'number') return bodyId
  if (bodyId && typeof bodyId === 'string') {
    const parsed = parseInt(bodyId, 10)
    if (!isNaN(parsed)) return parsed
  }

  if (paramId && typeof paramId === 'string') {
    const parsed = parseInt(paramId, 10)
    if (!isNaN(parsed)) return parsed
  }

  if (queryId && typeof queryId === 'string') {
    const parsed = parseInt(queryId, 10)
    if (!isNaN(parsed)) return parsed
  }

  return null
}

/**
 * Middleware to check if a user is authorized to make API requests
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
export const checkAuthorization = async (
  req: Request & { user?: SafeUser },
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = getUserIdFromRequest(req)

    if (!userId) {
      throw new AuthorizationError('Unauthorized - User ID not provided')
    }

    // Find user and check authorization status
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        entries: true,
        joined: true,
        isAuthorized: true,
      },
    })

    if (!user) {
      throw new NotFoundError('User')
    }

    if (!user.isAuthorized) {
      throw new AuthorizationError('Unauthorized - User does not have API access')
    }

    // Store user in request for use in subsequent middleware
    req.user = user as SafeUser
    next()
  } catch (error) {
    if (error instanceof Error) {
      if (error instanceof AuthorizationError || error instanceof NotFoundError) {
        res.status(error.statusCode).json({ error: error.message })
      } else {
        console.error('Authorization check error:', error)
        res.status(500).json({ error: 'Internal server error' })
      }
    } else {
      res.status(500).json({ error: 'Unknown error occurred' })
    }
  }
}

/**
 * Middleware to check and enforce API request limits
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
export const checkRequestLimit = async (
  req: Request & { user?: SafeUser },
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = getUserIdFromRequest(req)

    if (!userId) {
      throw new AuthorizationError('Unauthorized - User ID not provided')
    }

    // Get the current month and year
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    // Calculate the start of the current month
    const startOfMonth = new Date(currentYear, currentMonth, 1)

    // Count API requests for the current month
    const requestCount = await prisma.apiRequest.count({
      where: {
        userId,
        requestedAt: {
          gte: startOfMonth,
        },
      },
    })

    const { maxRequestsPerMonth, resetDay } = config.api

    if (requestCount >= maxRequestsPerMonth) {
      const resetDate = new Date(currentYear, currentMonth + 1, resetDay)
      throw new RateLimitError('You have reached your monthly API request limit', maxRequestsPerMonth, resetDate)
    }

    // If we get here, the user has not exceeded their limit
    next()
  } catch (error) {
    if (error instanceof RateLimitError) {
      res.status(error.statusCode).json({
        error: 'Rate limit exceeded',
        message: error.message,
        limit: error.limit,
        reset: error.reset,
      })
    } else if (error instanceof AuthorizationError) {
      res.status(error.statusCode).json({ error: error.message })
    } else {
      console.error('Rate limit check error:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  }
}

/**
 * Middleware to record an API request
 * @param endpoint - API endpoint being accessed
 */
export const recordApiRequest = (endpoint: string) => {
  return async (req: Request & { user?: SafeUser }, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = getUserIdFromRequest(req)

      if (!userId) {
        next()
        return
      }

      // Record the API request
      await prisma.apiRequest.create({
        data: {
          userId,
          endpoint,
        },
      })

      next()
    } catch (error) {
      console.error('Error recording API request:', error)
      // Don't block the request if recording fails
      next()
    }
  }
}
