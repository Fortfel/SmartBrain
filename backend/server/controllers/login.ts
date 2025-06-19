import type { Request, Response, NextFunction } from 'express'
import prisma from '../prisma.js'
import { type SafeUser, type LoginRequestBody } from '../types.js'
import { verifyPassword } from '../server.js'
import { ValidationError, AuthenticationError } from '../utils/errors.js'

/**
 * Handles user login authentication
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 * @returns Promise resolving when login process completes
 */
const handleLogin = async (
  req: Request<object, object, LoginRequestBody>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { email, password } = req.body

    // Validate the request body
    if (!email || !password) {
      throw new ValidationError('Missing required fields')
    }

    if (!email.includes('@')) {
      throw new ValidationError('Invalid email format', 'email')
    }

    if (password.length < 5) {
      throw new ValidationError('Password must be at least 5 characters', 'password')
    }

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
        isAuthorized: true,
      },
    })

    if (!user) {
      throw new AuthenticationError()
    }

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

      throw new AuthenticationError()
    }
  } catch (error) {
    next(error)
  }
}

export { handleLogin }
