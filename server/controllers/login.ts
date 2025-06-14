import type { Request, Response } from 'express'
import prisma from '../prisma.js'
import { type SafeUser, type LoginRequestBody } from '../types.js'
import { verifyPassword } from '../server.js'

/**
 * Handles user login authentication
 * @param req - Express request object
 * @param res - Express response object
 * @returns Promise resolving when login process completes
 */
const handleLogin = async (req: Request<object, object, LoginRequestBody>, res: Response): Promise<void> => {
  const { email, password } = req.body

  try {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        passwordHash: true,
        entries: true,
        joined: true,
      },
    })

    if (user) {
      // Verify password against stored hash
      const isPasswordValid = await verifyPassword(user.passwordHash, password)

      // Get IP address
      const ipAddress = req.ip?.toString() || 'unknown'

      if (isPasswordValid) {
        // Record successful login
        await prisma.loginHistory.create({
          data: {
            userId: user.id,
            ipAddress,
            success: true,
          },
        })

        // Don't send the password back to the client
        const { passwordHash: _, ...userWithoutPassword } = user
        res.json(userWithoutPassword satisfies SafeUser)
      } else {
        // Record failed login
        await prisma.loginHistory.create({
          data: {
            userId: user.id,
            ipAddress,
            success: false,
          },
        })

        res.status(401).json({ error: 'Invalid email or password' })
      }
    } else {
      res.status(401).json({ error: 'Invalid email or password' })
    }
  } catch (err) {
    console.error('Login error:', err)
    res.status(500).json({ error: 'Authentication error' })
  }
}

export { handleLogin }
