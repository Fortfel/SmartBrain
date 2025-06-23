import dotenv from 'dotenv'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// Load environment variables
if (fs.existsSync('./../.env')) {
  dotenv.config({ path: './../.env' })
}

if (fs.existsSync('./../.env.local')) {
  dotenv.config({ path: './../.env.local', override: true })
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * Application configuration
 */
export const config = {
  server: {
    port: parseInt(process.env.PORT || '3000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    distPath: path.resolve(__dirname, '../../frontend'),
  },
  security: {
    allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || [],
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      limit: 100, // Limit each IP to 100 requests per windowMs
    },
  },
  api: {
    maxRequestsPerMonth: parseInt(process.env.VITE_MAX_API_REQUESTS_PER_MONTH as string, 10) || 20,
    resetDay: 1, // Reset on the first day of each month
  },
  password: {
    saltRounds: 10,
    // memoryCost: 2 ** 16, // 64 MiB
    // timeCost: 3, // 3 iterations
    // parallelism: 1, // 1 degree of parallelism
  },
} as const

export type Config = typeof config

// Validate required configuration
if (config.security.allowedOrigins.length === 0) {
  throw new Error('ALLOWED_ORIGINS environment variable is required')
}
