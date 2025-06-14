import * as React from 'react'
import type { AuthContextType } from '@/contexts/AuthContext'

/**
 * Context for authentication state and operations
 */
export const AuthContext = React.createContext<AuthContextType | null>(null)

/**
 * Hook to access authentication context
 * @returns Authentication context with user state and auth operations
 */
export const useAuth = (): AuthContextType => {
  const context = React.use(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
