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

type LogoutResponse = {
  success: boolean
  error?: string
}

type ImageEntryResponse = {
  success: boolean
  error?: string
  user?: User
}

type LoginCallback = (user: User) => void
type LogoutCallback = (user: User | null) => void
type UnsubscribeFunction = () => void

type AuthContextType = {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  isAuthorized: boolean
  login: (credentials: LoginRequest) => Promise<LoginResponse>
  register: (request: RegisterRequest) => Promise<RegisterResponse>
  logout: () => Promise<LogoutResponse>
  updateUserEntries: (userId: number, imageUrl: string, detectionResults: Array<unknown>) => Promise<ImageEntryResponse>
  onLogin: (callback: LoginCallback) => UnsubscribeFunction | undefined
  onLogout: (callback: LogoutCallback) => UnsubscribeFunction | undefined
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
  const [isAuthenticated, setIsAuthenticated] = React.useState<boolean>(false)
  const [isAuthorized, setIsAuthorized] = React.useState<boolean>(false)

  // Store callbacks using useRef to persist across re-renders
  const loginCallbacksRef = React.useRef<Set<LoginCallback>>(new Set())
  const logoutCallbacksRef = React.useRef<Set<LogoutCallback>>(new Set())

  // Initialize auth state (check for existing session)
  React.useEffect(() => {
    try {
      const storedUser = sessionStorage.getItem('smart-brain-user')

      if (storedUser) {
        const parsedUser: User = JSON.parse(storedUser)

        setUser(parsedUser)
        setIsAuthenticated(true)

        if (parsedUser.email === 'admin@email.com') {
          setIsAuthorized(true)
        }
      }
    } catch (error) {
      console.error('Error initializing auth state:', error)

      sessionStorage.removeItem('smart-brain-user')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const onLogin = React.useCallback((callback: LoginCallback): UnsubscribeFunction | undefined => {
    if (typeof callback === 'function') {
      loginCallbacksRef.current.add(callback)

      // Return unsubscribe function
      return () => {
        loginCallbacksRef.current.delete(callback)
      }
    }
    return
  }, [])

  const onLogout = React.useCallback((callback: LogoutCallback): UnsubscribeFunction | undefined => {
    if (typeof callback === 'function') {
      logoutCallbacksRef.current.add(callback)

      // Return unsubscribe function
      return () => {
        logoutCallbacksRef.current.delete(callback)
      }
    }
    return
  }, [])

  const executeLoginCallbacks = React.useCallback((user: User) => {
    loginCallbacksRef.current.forEach((callback) => {
      try {
        callback(user)
      } catch (error) {
        console.error('Error executing login callback:', error)
      }
    })
  }, [])

  const executeLogoutCallbacks = React.useCallback((user: User | null) => {
    logoutCallbacksRef.current.forEach((callback) => {
      try {
        callback(user)
      } catch (error) {
        console.error('Error executing logout callback:', error)
      }
    })
  }, [])

  const login = React.useCallback(
    async ({ email, password }: LoginRequest): Promise<LoginResponse> => {
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
          }
        }

        const userData: User = await response.json()

        // save user data to session storage
        sessionStorage.setItem('smart-brain-user', JSON.stringify(userData))

        setUser(userData)
        setIsAuthenticated(true)

        if (userData.email === 'admin@email.com') {
          setIsAuthorized(true)
        }

        // Execute all registered login callbacks
        executeLoginCallbacks(userData)

        return {
          success: true,
          user: userData,
        }
      } catch (error) {
        console.error('Login failed:', error)

        return {
          success: false,
          error: 'Login failed',
        }
      } finally {
        setIsLoading(false)
      }
    },
    [executeLoginCallbacks],
  )

  const register = React.useCallback(
    async ({ name, email, password }: RegisterRequest): Promise<RegisterResponse> => {
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
          }
        }

        const userData: User = await response.json()

        // save user data to session storage
        sessionStorage.setItem('smart-brain-user', JSON.stringify(userData))

        setUser(userData)
        setIsAuthenticated(true)

        if (userData.email === 'admin@email.com') {
          setIsAuthorized(true)
        }

        // Execute all login callbacks (since registration also logs the user in)
        executeLoginCallbacks(userData)

        return {
          success: true,
          user: userData,
        }
      } catch (error) {
        console.error('Registration failed:', error)

        return {
          success: false,
          error: 'Registration failed',
        }
      } finally {
        setIsLoading(false)
      }
    },
    [executeLoginCallbacks],
  )

  const logout = React.useCallback(async (): Promise<LogoutResponse> => {
    try {
      setIsLoading(true)

      // Remove user data from session storage
      sessionStorage.removeItem('smart-brain-user')

      setUser(null)
      setIsAuthenticated(false)
      setIsAuthorized(false)

      // Execute all logout callbacks
      executeLogoutCallbacks(user)

      return {
        success: true,
      }
    } catch (error) {
      console.error('Error logout:', error)

      return {
        success: false,
        error: 'Logout failed',
      }
    } finally {
      setIsLoading(false)
    }
  }, [executeLogoutCallbacks, user])

  const updateUserEntries = React.useCallback(
    async (userId: number, imageUrl: string, detectionResults: Array<unknown>): Promise<ImageEntryResponse> => {
      try {
        const response = await fetch('/api/image', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: userId,
            imageUrl,
            detectionResults,
          }),
        })

        if (!response.ok) {
          const errrorData: ErrorResponse = await response.json()

          return {
            success: false,
            error: errrorData.error || 'Failed to update user entries',
          }
        }

        const userData: User = await response.json()

        // save user data to session storage
        sessionStorage.setItem('smart-brain-user', JSON.stringify(userData))

        setUser(userData)

        return {
          success: true,
          user: userData,
        }
      } catch (error) {
        console.error('Failed to update user entries:', error)

        return {
          success: false,
          error: 'Failed to update user entries',
        }
      }
    },
    [],
  )

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = React.useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated,
      isAuthorized,
      login,
      register,
      logout,
      updateUserEntries,
      onLogin,
      onLogout,
    }),
    [user, isLoading, isAuthenticated, isAuthorized, login, register, logout, updateUserEntries, onLogin, onLogout],
  )

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
}

export {
  type LoginResponse,
  type RegisterResponse,
  type LogoutResponse,
  type ImageEntryResponse,
  type AuthContextType,
  type AuthProviderProps,
  type LoginCallback,
  type LogoutCallback,
  type UnsubscribeFunction,
  AuthContext,
  useAuth,
  AuthProvider,
}
