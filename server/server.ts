import express, { type Request, type Response } from 'express'
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import argon2 from 'argon2'
import dotenv from 'dotenv'
import prisma from './prisma.js'
import { handleLogin } from './controllers/login.js'
import { handleRegister } from './controllers/register.js'
import { handleProfileGet } from './controllers/profile.js'
import { handleEntriesUpdate } from './controllers/image.js'
import { hanfleClarifaiRequest } from './controllers/clarifai.js'
import { handleRemainingRequests } from './controllers/requests.js'
import { checkAuthorization, checkRequestLimit, recordApiRequest } from './middleware/apiLimiter.js'

// Load environment variables
if (fs.existsSync('.env')) {
  dotenv.config({ path: '.env' })
}

if (fs.existsSync('.env.local')) {
  dotenv.config({ path: '.env.local', override: true })
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const PORT = process.env.PORT || 3000

/**
 * Hashes a password using argon2id algorithm
 * @param password - The plain text password to hash
 * @returns Promise resolving to the hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  return await argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 2 ** 16, // 64 MiB
    timeCost: 3, // 3 iterations
    parallelism: 1, // 1 degree of parallelism
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

// Middleware
app.use(express.json())

// API Routes
app.get('/api', async (_req: Request, res: Response): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
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
    console.error('Error fetching users:', err)
    res.status(500).json({ error: 'Error fetching users' })
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
  hanfleClarifaiRequest,
)

// Endpoint to check remaining API requests
app.get('/api/requests/remaining', handleRemainingRequests)

// For production: serve the static files from the Vite build
if (process.env.NODE_ENV === 'production') {
  // Serve static files from the Vite build directory
  const distPath = path.resolve(__dirname, '../app')

  app.use(express.static(distPath))

  // Catch-all handler: send back index.html for any non-API routes
  app.get('/*name', (_req: Request, res: Response): void => {
    res.sendFile(path.join(distPath, 'index.html'))
  })
}

// Connect to the database and start the server
async function startServer(): Promise<void> {
  try {
    // Test database connection
    await prisma.$connect()
    console.log('Connected to the database successfully')

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT.toString()}`)
    })
  } catch (error) {
    console.error('Failed to connect to the database:', error)
    process.exit(1)
  }
}

void startServer()
