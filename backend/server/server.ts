import express, { type Request, type Response, type NextFunction } from 'express'
import argon2 from 'argon2'
import cors from 'cors'
import rateLimit from 'express-rate-limit'
import helmet from 'helmet'

import { config } from './config.js'
import { prismaService } from './prisma.js'
import { errorHandler, notFoundHandler } from './utils/errors.js'
import { handleLogin } from './controllers/login.js'
import { handleRegister } from './controllers/register.js'
import { handleProfileGet } from './controllers/profile.js'
import { handleEntriesUpdate } from './controllers/image.js'
import { handleClarifaiRequest } from './controllers/clarifai.js'
import { handleRemainingRequests } from './controllers/requests.js'
import { checkAuthorization, checkRequestLimit, recordApiRequest } from './middleware/apiLimiter.js'

/**
 * Hashes a password using argon2id algorithm
 * @param password - The plain text password to hash
 * @returns Promise resolving to the hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  return await argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: config.password.memoryCost,
    timeCost: config.password.timeCost,
    parallelism: config.password.parallelism,
  })
}

/**
 * Verifies a password against a hash
 * @param hash - The stored hash
 * @param password - The plain text password to verify
 * @returns Promise resolving to boolean indicating if password matches
 */
export async function verifyPassword(hash: string, password: string): Promise<boolean> {
  return await argon2.verify(hash, password)
}

const app = express()

// Security middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }),
)

// CORS middleware
const corsOptions = {
  origin: config.security.allowedOrigins,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 200,
}
app.use(cors(corsOptions))

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: config.security.rateLimit.windowMs,
  limit: config.security.rateLimit.limit,
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: 'Too many requests, please try again later.',
})
app.use(limiter)

// Referer middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const referer = req.get('Referer')
  const origin = req.get('Origin')

  const isValidReferer = referer && config.security.allowedOrigins.some((allowed) => referer.startsWith(allowed))
  const isValidOrigin = origin && config.security.allowedOrigins.includes(origin)

  if (!isValidReferer && !isValidOrigin) {
    res.status(403).json({ error: 'Forbidden: Invalid origin' })
    return
  }

  next()
})

// Body parsing middleware
app.use(express.json())

// API Routes
app.get('/api', async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const users = await prismaService.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        // email: true,
        entries: true,
        joined: true,
      },
    })
    res.json(users)
  } catch (err) {
    next(err)
  }
})

app.post('/api/login', handleLogin)

app.post('/api/register', handleRegister)

app.get('/api/profile/:id', handleProfileGet)

app.put('/api/image', handleEntriesUpdate)

// Apply API limiting middleware to the Clarifai endpoint
app.post(
  '/api/clarifai',
  checkAuthorization,
  checkRequestLimit,
  recordApiRequest('/api/clarifai'),
  handleClarifaiRequest,
)

// Endpoint to check remaining API requests
app.get('/api/requests/remaining', handleRemainingRequests)

// For production: serve the static files from the Vite build
if (config.server.nodeEnv === 'production') {
  // Serve static files from the Vite build directory
  app.use(express.static(config.server.distPath))

  // Catch-all handler: send back index.html for any non-API routes
  app.get('/*name', (_req: Request, res: Response): void => {
    res.sendFile(`${config.server.distPath}/index.html`)
  })
}

// 404 handler middleware
app.use(notFoundHandler)

// Global error handler
app.use(errorHandler)

// Connect to the database and start the server
async function startServer(): Promise<void> {
  try {
    // Test database connection
    await prismaService.connect()

    app.listen(config.server.port, () => {
      console.log(`Server running on port ${config.server.port.toString()}`)
    })
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('Received SIGINT. Shutting down gracefully...')

  prismaService
    .disconnect()
    .then(() => {
      console.log('Database connections closed')
      console.log('Graceful shutdown completed')
      process.exit(0)
    })
    .catch((error: unknown) => {
      console.error('Error during graceful shutdown:', error)
      process.exit(1)
    })
})

process.on('SIGTERM', () => {
  console.log('Received SIGTERM. Shutting down gracefully...')

  prismaService
    .disconnect()
    .then(() => {
      console.log('Database connections closed')
      console.log('Graceful shutdown completed')
      process.exit(0)
    })
    .catch((error: unknown) => {
      console.error('Error during graceful shutdown:', error)
      process.exit(1)
    })
})

void startServer()
