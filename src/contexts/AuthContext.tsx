import * as React from 'react'
import type { LoginRequestBody, RegisterRequestBody, EntriesUpdateRequestBody, SafeUser } from '@/../server/types'
import { AuthContext } from '@/contexts/use-auth.ts'

export type LoginResponse = {
  success: boolean
  error?: string
  user?: SafeUser
}

export type RegisterResponse = {
  success: boolean
  error?: string
  user?: SafeUser
}

export type LogoutResponse = {
  success: boolean
  error?: string
}

export type ImageEntryResponse = {
  success: boolean
  error?: string
  user?: SafeUser
}

export type ErrorResponse = {
  error: string
}

export type LoginCallback = (user: SafeUser) => void
export type LogoutCallback = (user: SafeUser | null) => void
export type UnsubscribeFunction = () => void

export type AuthContextType = {
  user: SafeUser | null
  isLoading: boolean
  isAuthenticated: boolean
  isAuthorized: boolean
  login: (credentials: LoginRequestBody) => Promise<LoginResponse>
  register: (request: RegisterRequestBody) => Promise<RegisterResponse>
  logout: () => LogoutResponse
  updateUserEntries: (request: EntriesUpdateRequestBody) => Promise<ImageEntryResponse>
  onLogin: (callback: LoginCallback) => UnsubscribeFunction | undefined
  onLogout: (callback: LogoutCallback) => UnsubscribeFunction | undefined
}

export type AuthProviderProps = {
  children: React.ReactNode
}

const AuthProvider = ({ children }: AuthProviderProps): React.JSX.Element => {
  const [user, setUser] = React.useState<SafeUser | null>(null)
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
        const parsedUser = JSON.parse(storedUser) as SafeUser

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

  const executeLoginCallbacks = React.useCallback((user: SafeUser) => {
    loginCallbacksRef.current.forEach((callback) => {
      try {
        callback(user)
      } catch (error) {
        console.error('Error executing login callback:', error)
      }
    })
  }, [])

  const executeLogoutCallbacks = React.useCallback((user: SafeUser | null) => {
    logoutCallbacksRef.current.forEach((callback) => {
      try {
        callback(user)
      } catch (error) {
        console.error('Error executing logout callback:', error)
      }
    })
  }, [])

  const login = React.useCallback(
    async ({ email, password }: LoginRequestBody): Promise<LoginResponse> => {
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
          const errrorData = (await response.json()) as ErrorResponse

          return {
            success: false,
            error: errrorData.error || 'Login failed',
          }
        }

        const userData = (await response.json()) as SafeUser

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
    async ({ name, email, password }: RegisterRequestBody): Promise<RegisterResponse> => {
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
          const errrorData = (await response.json()) as ErrorResponse

          return {
            success: false,
            error: errrorData.error || 'Registration failed',
          }
        }

        const userData = (await response.json()) as SafeUser

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

  const logout = React.useCallback((): LogoutResponse => {
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
    async ({ id, imageUrl, detectionResults }: EntriesUpdateRequestBody): Promise<ImageEntryResponse> => {
      try {
        const response = await fetch('/api/image', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id,
            imageUrl,
            detectionResults,
          }),
        })

        if (!response.ok) {
          const errrorData = (await response.json()) as ErrorResponse

          return {
            success: false,
            error: errrorData.error || 'Failed to update user entries',
          }
        }

        const userData = (await response.json()) as SafeUser

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

  return <AuthContext value={contextValue}>{children}</AuthContext>
}

export { AuthProvider }
