/**
 * Type definitions for SmartBrain API responses
 */

/**
 * User data returned from the API (without password)
 */
export type User = {
  readonly id: number
  readonly name: string
  readonly email: string
  readonly entries: number
  readonly joined: string
}

/**
 * Error response structure
 */
export type ErrorResponse = {
  readonly error: string
}

/**
 * Login request payload
 */
export type LoginRequest = {
  readonly email: string
  readonly password: string
}

/**
 * Registration request payload
 */
export type RegisterRequest = {
  readonly name: string
  readonly email: string
  readonly password: string
}

/**
 * Image entry update request
 */
export type ImageEntryRequest = {
  readonly id: number
}

/**
 * Response type for /api endpoint
 * Returns an array of users (for development purposes)
 */
export type UsersResponse = Array<User>

/**
 * Response type for /api/login endpoint
 * Returns user data on successful login or error on failure
 */
export type LoginResponse = User | ErrorResponse

/**
 * Response type for /api/register endpoint
 * Returns new user data on successful registration or error on failure
 */
export type RegisterResponse = User | ErrorResponse

/**
 * Response type for /api/profile/:id endpoint
 * Returns user data or error if user not found
 */
export type ProfileResponse = User | ErrorResponse

/**
 * Response type for /api/image endpoint
 * Returns updated user data with incremented entries or error
 */
export type ImageEntryResponse = User | ErrorResponse
