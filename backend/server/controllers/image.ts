import type { Request, Response, NextFunction } from 'express'
import prisma from '../prisma.js'
import { type SafeUser, type EntriesUpdateRequestBody } from '../types.js'
import { ValidationError, NotFoundError } from '../utils/errors.js'

/**
 * Handles updating user entries and storing image detection results
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 * @returns Promise resolving when update completes
 */
const handleEntriesUpdate = async (
  req: Request<object, object, EntriesUpdateRequestBody>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id, imageUrl, detectionResults } = req.body

    if (!id) {
      throw new ValidationError('User ID is required')
    }

    if (!imageUrl) {
      throw new ValidationError('Image URL is required')
    }

    const userId = Number(id)

    if (isNaN(userId)) {
      throw new ValidationError('Invalid user ID')
    }

    // Check if user exists before updating
    const userExists = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    })

    if (!userExists) {
      throw new NotFoundError('User')
    }

    const result = await prisma.$transaction(async (tx) => {
      // Increment the user's entry count
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          entries: {
            increment: 1,
          },
        },
      })

      // Store image entry details
      await tx.imageEntry.create({
        data: {
          userId,
          imageUrl,
          detectionResults,
        },
      })

      return updatedUser
    })

    // Don't send the password back to the client
    const { passwordHash: _, ...userWithoutPassword } = result
    res.json(userWithoutPassword satisfies SafeUser)
  } catch (error) {
    next(error)
  }
}

export { handleEntriesUpdate }
