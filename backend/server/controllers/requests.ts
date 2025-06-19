import type { Request, Response, NextFunction } from 'express'
import prisma from '../prisma.js'
import { config } from '../config.js'
import { ValidationError, NotFoundError, AuthorizationError } from '../utils/errors.js'
import { type RemainingRequestsResponse } from '../types.js'

/**
 * Handles retrieving the remaining API requests for a user
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 * @returns Promise resolving when the request count is retrieved
 */
const handleRemainingRequests = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.query.id

    if (!userId || typeof userId !== 'string') {
      throw new ValidationError('Missing or invalid user ID')
    }

    const userIdNum = Number(userId)

    if (isNaN(userIdNum)) {
      throw new ValidationError('Invalid user ID format')
    }

    // Check if user exists and is authorized
    const user = await prisma.user.findUnique({
      where: { id: userIdNum },
      select: {
        id: true,
        isAuthorized: true,
      },
    })

    if (!user) {
      throw new NotFoundError('User')
    }

    if (!user.isAuthorized) {
      throw new AuthorizationError('User is not authorized for API access')
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
        userId: userIdNum,
        requestedAt: {
          gte: startOfMonth,
        },
      },
    })

    const { maxRequestsPerMonth, resetDay } = config.api
    const remaining = Math.max(0, maxRequestsPerMonth - requestCount)

    const response = {
      remaining,
      used: requestCount,
      limit: maxRequestsPerMonth,
      resetDay,
    } satisfies RemainingRequestsResponse

    res.json(response)
  } catch (error) {
    next(error)
  }
}

export { handleRemainingRequests }
