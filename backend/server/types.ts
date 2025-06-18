import type { Prisma } from '@prisma/client'

/**
 * User data structure
 */
export type User = {
  id: number
  name: string
  email: string
  passwordHash: string
  entries: number
  joined: Date
  isAuthorized: boolean
}

/**
 * User data without sensitive information
 */
export type SafeUser = Omit<User, 'passwordHash'>

/**
 * Login request body structure
 */
export type LoginRequestBody = {
  email: string
  password: string
}

/**
 * Registration request body structure
 */
export type RegisterRequestBody = {
  name: string
  email: string
  password: string
}

/**
 * Image processing request body structure
 */
export type EntriesUpdateRequestBody = {
  id: number
  imageUrl: string
  detectionResults?: Prisma.InputJsonValue
}

/**
 * Remaining API requests response structure
 */
export type RemainingRequestsResponse = {
  remaining: number
  used: number
  limit: number
  resetDay: number
}
