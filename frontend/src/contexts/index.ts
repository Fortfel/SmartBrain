/**
 * Central export file for all context providers, hooks, and types
 * Provides a single import point for context-related functionality
 */

/**
 * Provider components for application contexts
 */
export { AppProvider } from '@/contexts/AppProvider'

export { AuthProvider } from '@/contexts/AuthContext'
export { ThemeProvider } from '@/contexts/ThemeContext'

/**
 * Custom hooks and context objects for accessing context values
 */
export { useAuth, AuthContext } from '@/contexts/use-auth'
export { useTheme, ThemeContext } from '@/contexts/use-theme'

/**
 * Authentication-related types
 */
export type {
  LoginResponse,
  RegisterResponse,
  LogoutResponse,
  ImageEntryResponse,
  ErrorResponse,
  LoginCallback,
  LogoutCallback,
  UnsubscribeFunction,
  AuthContextType,
  AuthProviderProps,
} from '@/contexts/AuthContext'

/**
 * Theme-related types
 */
export type { ThemeContextType, ThemeProviderProps, ThemeType } from '@/contexts/ThemeContext'
