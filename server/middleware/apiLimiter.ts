import type { Request, Response, NextFunction } from 'express'
import prisma from '../prisma.js'
import type { SafeUser } from '../types.js'
import dotenv from 'dotenv'
import fs from 'node:fs'

// Load environment variables
if (fs.existsSync('.env')) {
  dotenv.config({ path: '.env' })
}

if (fs.existsSync('.env.local')) {
  dotenv.config({ path: '.env.local', override: true })
}

/**
 * Configuration for API request limits
 */
const API_LIMIT_CONFIG = {
  maxRequestsPerMonth: parseInt(process.env.VITE_MAX_API_REQUESTS_PER_MONTH as string) || 20,
  resetDay: 1, // Reset on the first day of each month
}

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
      res.status(401).json({ error: 'Unauthorized - User ID not provided' })
      return
    }

    // Find user and check authorization status
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        isAuthorized: true,
      },
    })

    if (!user) {
      res.status(404).json({ error: 'User not found' })
      return
    }

    if (!user.isAuthorized) {
      res.status(403).json({ error: 'Unauthorized - User does not have API access' })
      return
    }

    // Store user in request for use in subsequent middleware
    req.user = user as SafeUser
    next()
  } catch (error) {
    console.error('Authorization check error:', error)
    res.status(500).json({ error: 'Internal server error' })
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
      res.status(401).json({ error: 'Unauthorized - User ID not provided' })
      return
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

    if (requestCount >= API_LIMIT_CONFIG.maxRequestsPerMonth) {
      res.status(429).json({
        error: 'Rate limit exceeded',
        message: 'You have reached your monthly API request limit',
        limit: API_LIMIT_CONFIG.maxRequestsPerMonth,
        reset: new Date(currentYear, currentMonth + 1, API_LIMIT_CONFIG.resetDay),
      })
      return
    }

    // If we get here, the user has not exceeded their limit
    next()
  } catch (error) {
    console.error('Rate limit check error:', error)
    res.status(500).json({ error: 'Internal server error' })
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
