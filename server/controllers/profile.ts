import type { Request, Response } from 'express'
import prisma from '../prisma.js'

const handleProfileGet = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  const { id } = req.params

  try {
    const user = await prisma.user.findUnique({
      where: { id: Number(id) },
      select: {
        id: true,
        name: true,
        email: true,
        entries: true,
        joined: true,
      },
    })

    if (user) {
      res.json(user)
    } else {
      res.status(404).json({ error: 'User not found' })
    }
  } catch (err) {
    console.error('Error fetching user:', err)
    res.status(500).json({ error: 'Error fetching user' })
  }
}

export { handleProfileGet }
