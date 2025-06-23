/**
 * Determines the appropriate API base URL based on environment
 * Uses the VITE_API_URL environment variable in production
 * Falls back to a local proxy in development
 * @throws Error if VITE_API_URL environment variable is not set
 * @returns The API base URL as a string
 */
const getApiBaseUrl = (): string => {
  if (!import.meta.env.VITE_API_URL) {
    console.error('VITE_API_URL environment variable is not set.')
    throw new Error('VITE_API_URL environment variable is not set.')
  }

  if (import.meta.env.PROD) {
    return import.meta.env.VITE_API_URL as string
  } else {
    return 'smartbrain-api' // Vite proxy
  }
}

/**
 * Base URL for all API requests
 * Configured based on the current environment
 * @readonly
 */
const API_BASE_URL = getApiBaseUrl()

export { API_BASE_URL }
