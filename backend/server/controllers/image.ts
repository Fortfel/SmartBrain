import type { Request, Response } from 'express'
import prisma from '../prisma.js'
import { type SafeUser, type EntriesUpdateRequestBody } from '../types.js'

const handleEntriesUpdate = async (
  req: Request<object, object, EntriesUpdateRequestBody>,
  res: Response,
): Promise<void> => {
  const { id, imageUrl, detectionResults } = req.body

  try {
    const result = await prisma.$transaction(async (tx) => {
      // Increment the user's entry count
      const updatedUser = await tx.user.update({
        where: { id: Number(id) },
        data: {
          entries: {
            increment: 1,
          },
        },
      })

      // Store image entry details
      if (imageUrl) {
        await tx.imageEntry.create({
          data: {
            userId: Number(id),
            imageUrl,
            detectionResults,
          },
        })
      }

      return updatedUser
    })

    // Don't send the password back to the client
    const { passwordHash: _, ...userWithoutPassword } = result
    res.json(userWithoutPassword satisfies SafeUser)
  } catch (err) {
    console.error('Error updating user:', err)
    res.status(500).json({ error: 'Error updating user' })
  }
}

export { handleEntriesUpdate }
