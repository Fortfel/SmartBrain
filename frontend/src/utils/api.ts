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

const API_BASE_URL = getApiBaseUrl()

export { API_BASE_URL }
