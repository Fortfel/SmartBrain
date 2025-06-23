import * as React from 'react'
import type { AuthContextType } from '@/contexts/AuthContext'

/**
 * React Context for authentication state and operations
 * Provides access to user authentication status, profile data, and auth-related functions
 * @remarks This context should be accessed using the useAuth hook rather than directly
 */
export const AuthContext = React.createContext<AuthContextType | null>(null)

/**
 * Custom hook to access authentication context throughout the application
 * Provides a type-safe way to consume the AuthContext
 * @throws Error if used outside of an AuthProvider component
 * @returns Authentication context object containing:
 *  - User state (profile, authentication status)
 *  - Authentication operations (login, register, logout)
 *  - API usage information (requests remaining)
 *  - Event subscription methods
 */
export const useAuth = (): AuthContextType => {
  const context = React.use(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
