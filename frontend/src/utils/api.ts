const getApiBaseUrl = (): string => {
  if (!import.meta.env.VITE_API_URL) {
    console.error('VITE_API_URL environment variable is not set.')
    throw new Error('VITE_API_URL environment variable is not set.')
  }

  if (import.meta.env.PROD) {
    return import.meta.env.VITE_API_URL as string
  } else {
    return '' // Empty string to use proxy
  }
}

const API_BASE_URL = getApiBaseUrl()

export { API_BASE_URL }
