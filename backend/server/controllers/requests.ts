import type { Request, Response } from 'express'
import prisma from '../prisma.js'
import dotenv from 'dotenv'
import fs from 'node:fs'

// Load environment variables
if (fs.existsSync('./../.env')) {
  dotenv.config({ path: './../.env' })
}

if (fs.existsSync('./../.env.local')) {
  dotenv.config({ path: './../.env.local', override: true })
}

/**
 * Configuration for API request limits
 */
const API_LIMIT_CONFIG = {
  maxRequestsPerMonth: parseInt(process.env.VITE_MAX_API_REQUESTS_PER_MONTH as string) || 20,
}

/**
 * Handles retrieving the remaining API requests for a user
 * @param req - Express request object
 * @param res - Express response object
 * @returns Promise resolving when the request count is retrieved
 */
const handleRemainingRequests = async (req: Request, res: Response): Promise<void> => {
  const userId = req.query.id

  if (!userId || typeof userId !== 'string') {
    res.status(400).json({ error: 'Missing or invalid user ID' })
    return
  }

  try {
    // Check if user exists and is authorized
    const user = await prisma.user.findUnique({
      where: { id: Number(userId) },
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
      res.status(403).json({
        error: 'Unauthorized',
        remaining: 0,
        limit: API_LIMIT_CONFIG.maxRequestsPerMonth,
      })
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
        userId: Number(userId),
        requestedAt: {
          gte: startOfMonth,
        },
      },
    })

    const remaining = Math.max(0, API_LIMIT_CONFIG.maxRequestsPerMonth - requestCount)

    res.json({
      remaining,
      used: requestCount,
      limit: API_LIMIT_CONFIG.maxRequestsPerMonth,
      resetDate: new Date(currentYear, currentMonth + 1, 1),
    })
  } catch (error) {
    console.error('Error retrieving remaining requests:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export { handleRemainingRequests }
