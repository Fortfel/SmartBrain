import type { Request, Response, NextFunction } from 'express'
import prisma from '../prisma.js'
import { NotFoundError } from '../utils/errors.js'

/**
 * Handles fetching a user profile by ID
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 * @returns Promise resolving when profile fetch completes
 */
const handleProfileGet = async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params
    const userId = Number(id)

    if (isNaN(userId)) {
      throw new NotFoundError('User')
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        entries: true,
        joined: true,
      },
    })

    if (!user) {
      throw new NotFoundError('User')
    }

    res.json(user)
  } catch (error) {
    next(error)
  }
}

export { handleProfileGet }
