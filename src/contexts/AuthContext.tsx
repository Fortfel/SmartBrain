import * as React from 'react'

import { User, LoginRequest, RegisterRequest, ErrorResponse } from '@/types/api-types'

type LoginResponse = {
  success: boolean
  error?: string
  user?: User
}

type RegisterResponse = {
  success: boolean
  error?: string
  user?: User
}

type AuthContextType = {
  user: User | null
  setUser: React.Dispatch<React.SetStateAction<User | null>>
  isLoading: boolean
  login: (request: LoginRequest) => Promise<LoginResponse>
  register: (request: RegisterRequest) => Promise<RegisterResponse>
  logout: () => void
}

type AuthProviderProps = {
  children: React.ReactNode
}

const AuthContext = React.createContext<AuthContextType | null>(null)

const useAuth = (): AuthContextType => {
  const context = React.useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

const AuthProvider = ({ children }: AuthProviderProps): React.JSX.Element => {
  const [user, setUser] = React.useState<User | null>(null)
  const [isLoading, setIsLoading] = React.useState<boolean>(true)

  // Initialize auth state (check for existing session)
  React.useEffect(() => {
    try {
      const storedUser = sessionStorage.getItem('smart-brain-user')

      if (storedUser) {
        setUser(JSON.parse(storedUser))
      }
    } catch (error) {
      console.error('Error initializing auth state:', error)

      sessionStorage.removeItem('smart-brain-user')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const login = React.useCallback(async ({ email, password }: LoginRequest): Promise<LoginResponse> => {
    try {
      setIsLoading(true)

      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        const errrorData: ErrorResponse = await response.json()

        return {
          success: false,
          error: errrorData.error || 'Login failed',
        } satisfies LoginResponse
      }

      const userData: User = await response.json()

      // save user data to session storage
      sessionStorage.setItem('smart-brain-user', JSON.stringify(userData))

      setUser(userData)

      return {
        success: true,
        user: userData,
      } satisfies LoginResponse
    } catch (error) {
      console.error('Login failed:', error)

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Login failed',
      } satisfies LoginResponse
    } finally {
      setIsLoading(false)
    }
  }, [])

  const register = React.useCallback(async ({ name, email, password }: RegisterRequest): Promise<RegisterResponse> => {
    try {
      setIsLoading(true)

      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      })

      if (!response.ok) {
        const errrorData: ErrorResponse = await response.json()

        return {
          success: false,
          error: errrorData.error || 'Registration failed',
        } satisfies RegisterResponse
      }

      const userData: User = await response.json()

      // save user data to session storage
      sessionStorage.setItem('smart-brain-user', JSON.stringify(userData))

      setUser(userData)

      return {
        success: true,
        user: userData,
      } satisfies RegisterResponse
    } catch (error) {
      console.error('Registration failed:', error)

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Registration failed',
      } satisfies RegisterResponse
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logout = React.useCallback((): void => {
    // Remove user data from session storage
    sessionStorage.removeItem('smart-brain-user')

    setUser(null)
  }, [])

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = React.useMemo(
    () => ({
      user,
      setUser,
      isLoading,
      login,
      register,
      logout,
    }),
    [user, isLoading, login, register, logout],
  )

  return <AuthContext value={contextValue}>{children}</AuthContext>
}

export {
  type LoginResponse,
  type RegisterResponse,
  type AuthContextType,
  type AuthProviderProps,
  AuthContext,
  useAuth,
  AuthProvider,
}
