import type { Request, Response, NextFunction } from 'express'
import prisma from '../prisma.js'
import { type SafeUser, type RegisterRequestBody } from '../types.js'
import { hashPassword } from '../server.js'
import { ValidationError } from '../utils/errors.js'

/**
 * Handles user registration
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 * @returns Promise resolving when registration process completes
 */
const handleRegister = async (
  req: Request<object, object, RegisterRequestBody>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { name, email, password } = req.body

    // Validate the request body
    if (!name || !email || !password) {
      throw new ValidationError('Missing required fields')
    }

    if (!email.includes('@')) {
      throw new ValidationError('Invalid email format', 'email')
    }

    if (password.length < 5) {
      throw new ValidationError('Password must be at least 5 characters', 'password')
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      throw new ValidationError('User with this email already exists')
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
  } catch (error) {
    next(error)
  }
}

export { handleRegister }
