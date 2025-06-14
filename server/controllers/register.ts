import type { Request, Response } from 'express'
import prisma from '../prisma.js'
import { type SafeUser, type RegisterRequestBody } from '../types.js'
import { hashPassword } from '../server.js'

const handleRegister = async (req: Request<object, object, RegisterRequestBody>, res: Response): Promise<void> => {
  const { name, email, password } = req.body

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      res.status(400).json({ error: 'User with this email already exists' })
      return
    }

    // Hash the password before storing
    const passwordHash = await hashPassword(password)

    // Create new user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
      },
    })

    // Don't send the password back to the client
    const { passwordHash: _, ...userWithoutPassword } = user
    res.json(userWithoutPassword satisfies SafeUser)
  } catch (err) {
    console.error('Registration error:', err)
    res.status(500).json({ error: 'Registration error' })
  }
}

export { handleRegister }
