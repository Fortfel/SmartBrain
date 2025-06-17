export { AppProvider } from '@/contexts/AppProvider'

export { AuthProvider } from '@/contexts/AuthContext'
export { ThemeProvider } from '@/contexts/ThemeContext'

export { useAuth, AuthContext } from '@/contexts/use-auth'
export { useTheme, ThemeContext } from '@/contexts/use-theme'

// Re-export all types
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

export type { ThemeContextType, ThemeProviderProps, ThemeType } from '@/contexts/ThemeContext'
