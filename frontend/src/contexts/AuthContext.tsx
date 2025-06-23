import * as React from 'react'
import type {
  LoginRequestBody,
  RegisterRequestBody,
  EntriesUpdateRequestBody,
  SafeUser,
  RemainingRequestsResponse,
} from '@backend/server/types'
import { AuthContext } from '@/contexts/use-auth.ts'
import { API_BASE_URL } from '@/utils/api.ts'

/**
 * Response type for login operations
 * @param success - Whether the login operation was successful
 * @param error - Optional error message if login failed
 * @param user - Optional user data if login succeeded
 */
export type LoginResponse = {
  success: boolean
  error?: string
  user?: SafeUser
}

/**
 * Response type for register operations
 * @param success - Whether the registration operation was successful
 * @param error - Optional error message if registration failed
 * @param user - Optional user data if registration succeeded
 */
export type RegisterResponse = {
  success: boolean
  error?: string
  user?: SafeUser
}

/**
 * Response type for logout operations
 * @param success - Whether the logout operation was successful
 * @param error - Optional error message if logout failed
 */
export type LogoutResponse = {
  success: boolean
  error?: string
}

/**
 * Response type for image entry operations
 * @param success - Whether the image entry operation was successful
 * @param error - Optional error message if operation failed
 * @param user - Optional updated user data if operation succeeded
 */
export type ImageEntryResponse = {
  success: boolean
  error?: string
  user?: SafeUser
}

/**
 * Standard error response type
 * @param error - Error message
 */
export type ErrorResponse = {
  error: string
}

/**
 * Callback function type for login events
 * @param user - The user that has logged in
 */
export type LoginCallback = (user: SafeUser) => void

/**
 * Callback function type for logout events
 * @param user - The user that has logged out (or null)
 */
export type LogoutCallback = (user: SafeUser | null) => void

/**
 * Function type for unsubscribing from event callbacks
 */
export type UnsubscribeFunction = () => void

/**
 * Context type definition for authentication management
 * @param user - Current authenticated user or null if not authenticated
 * @param isLoading - Whether authentication operations are in progress
 * @param isAuthenticated - Whether a user is currently authenticated
 * @param isAuthorized - Whether the authenticated user has authorization
 * @param requestsRemaining - Number of API requests remaining for the user
 * @param login - Function to authenticate a user
 * @param register - Function to register a new user
 * @param logout - Function to log out the current user
 * @param updateUserEntries - Function to update user entries after image processing
 * @param onLogin - Function to register a callback for login events
 * @param onLogout - Function to register a callback for logout events
 */
export type AuthContextType = {
  user: SafeUser | null
  isLoading: boolean
  isAuthenticated: boolean
  isAuthorized: boolean
  requestsRemaining: number | null
  login: (credentials: LoginRequestBody) => Promise<LoginResponse>
  register: (request: RegisterRequestBody) => Promise<RegisterResponse>
  logout: () => LogoutResponse
  updateUserEntries: (request: EntriesUpdateRequestBody) => Promise<ImageEntryResponse>
  onLogin: (callback: LoginCallback) => UnsubscribeFunction | undefined
  onLogout: (callback: LogoutCallback) => UnsubscribeFunction | undefined
}

/**
 * Props for the AuthProvider component
 * @param children - React nodes to be wrapped by the provider
 */
export type AuthProviderProps = {
  children: React.ReactNode
}

const API_URL = API_BASE_URL

/**
 * Provider component that makes authentication context available to all child components
 * Manages user authentication state, session persistence, and API interactions
 * @returns React component that provides authentication context to its children
 */
const AuthProvider = ({ children }: AuthProviderProps): React.JSX.Element => {
  const [user, setUser] = React.useState<SafeUser | null>(null)
  const [isLoading, setIsLoading] = React.useState<boolean>(true)
  const [isAuthenticated, setIsAuthenticated] = React.useState<boolean>(false)
  const [isAuthorized, setIsAuthorized] = React.useState<boolean>(false)
  const [requestsRemaining, setRequestsRemaining] = React.useState<number | null>(null)

  // Store callbacks using useRef to persist across re-renders
  const loginCallbacksRef = React.useRef<Set<LoginCallback>>(new Set())
  const logoutCallbacksRef = React.useRef<Set<LogoutCallback>>(new Set())

  /**
   * Initialize authentication state on component mount
   * Checks for existing session in sessionStorage and restores user state
   */
  React.useEffect(() => {
    try {
      const storedUser = sessionStorage.getItem('smart-brain-user')

      if (storedUser) {
        const parsedUser = JSON.parse(storedUser) as SafeUser

        setUser(parsedUser)
        setIsAuthenticated(true)
        setIsAuthorized(parsedUser.isAuthorized)

        // Fetch remaining requests if user is authorized
        if (parsedUser.isAuthorized) {
          void fetchRemainingRequests(parsedUser.id)
        }
      }
    } catch (error) {
      console.error('Error initializing auth state:', error)

      sessionStorage.removeItem('smart-brain-user')
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * Fetches the number of API requests remaining for a user
   * @param userId - ID of the user to check remaining requests for
   * @returns Promise resolving when the request completes
   */
  const fetchRemainingRequests = async (userId: number): Promise<void> => {
    try {
      const response = await fetch(`${API_URL}/requests/remaining?id=${userId.toString()}`)

      if (response.ok) {
        const data = (await response.json()) as RemainingRequestsResponse
        setRequestsRemaining(data.remaining)
      }
    } catch (error) {
      console.error('Error fetching remaining requests:', error)
    }
  }

  /**
   * Registers a callback function to be executed when a user logs in
   * @param callback - Function to call when a user logs in
   * @returns Function to unsubscribe the callback, or undefined if callback is invalid
   */
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

  /**
   * Registers a callback function to be executed when a user logs out
   * @param callback - Function to call when a user logs out
   * @returns Function to unsubscribe the callback, or undefined if callback is invalid
   */
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

  /**
   * Executes all registered login callbacks with the provided user
   * @param user - User object to pass to callbacks
   */
  const executeLoginCallbacks = React.useCallback((user: SafeUser) => {
    loginCallbacksRef.current.forEach((callback) => {
      try {
        callback(user)
      } catch (error) {
        console.error('Error executing login callback:', error)
      }
    })
  }, [])

  /**
   * Executes all registered logout callbacks with the provided user
   * @param user - User object to pass to callbacks (or null)
   */
  const executeLogoutCallbacks = React.useCallback((user: SafeUser | null) => {
    logoutCallbacksRef.current.forEach((callback) => {
      try {
        callback(user)
      } catch (error) {
        console.error('Error executing logout callback:', error)
      }
    })
  }, [])

  /**
   * Authenticates a user with email and password
   * @param credentials - Object containing email and password
   * @returns Promise resolving to login response
   */
  const login = React.useCallback(
    async ({ email, password }: LoginRequestBody): Promise<LoginResponse> => {
      try {
        setIsLoading(true)

        const response = await fetch(API_URL + '/login', {
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
        setIsAuthorized(userData.isAuthorized)

        // Fetch remaining requests if user is authorized
        if (userData.isAuthorized) {
          void fetchRemainingRequests(userData.id)
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

  /**
   * Registers a new user with name, email, and password
   * @param request - Object containing registration details
   * @returns Promise resolving to registration response
   */
  const register = React.useCallback(
    async ({ name, email, password }: RegisterRequestBody): Promise<RegisterResponse> => {
      try {
        setIsLoading(true)

        const response = await fetch(API_URL + '/register', {
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
        setIsAuthorized(userData.isAuthorized)

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

  /**
   * Logs out the current user and clears authentication state
   * @returns Logout response object
   */
  const logout = React.useCallback((): LogoutResponse => {
    try {
      setIsLoading(true)

      // Remove user data from session storage
      sessionStorage.removeItem('smart-brain-user')

      setUser(null)
      setIsAuthenticated(false)
      setIsAuthorized(false)
      setRequestsRemaining(null)

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

  /**
   * Updates user entries after image processing
   * @param request - Object containing image processing details
   * @returns Promise resolving to image entry response
   */
  const updateUserEntries = React.useCallback(
    async ({ id, imageUrl, detectionResults }: EntriesUpdateRequestBody): Promise<ImageEntryResponse> => {
      try {
        const response = await fetch(API_URL + '/image', {
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

        // Update remaining requests if user is authorized
        if (userData.isAuthorized) {
          void fetchRemainingRequests(userData.id)
        }

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

  /**
   * Memoized context value to prevent unnecessary re-renders of consuming components
   * Only updates when authentication state or methods change
   */
  const contextValue = React.useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated,
      isAuthorized,
      requestsRemaining,
      login,
      register,
      logout,
      updateUserEntries,
      onLogin,
      onLogout,
    }),
    [
      user,
      isLoading,
      isAuthenticated,
      isAuthorized,
      requestsRemaining,
      login,
      register,
      logout,
      updateUserEntries,
      onLogin,
      onLogout,
    ],
  )

  return <AuthContext value={contextValue}>{children}</AuthContext>
}

export { AuthProvider }
