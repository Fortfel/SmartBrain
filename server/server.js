import express from 'express'
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import argon2 from 'argon2'
import dotenv from 'dotenv'
import { PrismaClient } from '@prisma/client'

// Load environment variables
if (fs.existsSync('.env')) {
  dotenv.config({ path: '.env' })
}

if (fs.existsSync('.env.local')) {
  dotenv.config({ path: '.env.local', override: true })
}

// Initialize Prisma client
const prisma = new PrismaClient()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const PORT = process.env.PORT || 3000

/**
 * Hashes a password using argon2id algorithm
 * @param {string} password - The plain text password to hash
 * @returns {Promise<string>} - The hashed password
 */
export async function hashPassword(password) {
  return await argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 2 ** 16, // 64 MiB
    timeCost: 3, // 3 iterations
    parallelism: 1, // 1 degree of parallelism
  })
}

/**
 * Verifies a password against a hash
 * @param {string} hash - The stored hash
 * @param {string} password - The plain text password to verify
 * @returns {Promise<boolean>} - True if the password matches the hash
 */
async function verifyPassword(hash, password) {
  return await argon2.verify(hash, password)
}

const app = express()

// Middleware
app.use(express.json())

// API Routes
app.get('/api', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
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

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body

  try {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        passwordHash: true,
        entries: true,
        joined: true,
      },
    })

    if (user) {
      // Verify password against stored hash
      const passwordValid = await verifyPassword(user.passwordHash, password)

      if (passwordValid) {
        // Record successful login
        await prisma.loginHistory.create({
          data: {
            userId: user.id,
            ipAddress: req.ip,
            success: true,
          },
        })

        // Don't send the password back to the client
        const { passwordHash, ...userWithoutPassword } = user
        res.json(userWithoutPassword)
      } else {
        // Record failed login
        await prisma.loginHistory.create({
          data: {
            userId: user.id,
            ipAddress: req.ip,
            success: false,
          },
        })

        res.status(401).json({ error: 'Invalid email or password' })
      }
    } else {
      res.status(401).json({ error: 'Invalid email or password' })
    }
  } catch (err) {
    console.error('Login error:', err)
    res.status(500).json({ error: 'Authentication error' })
  }
})

app.post('/api/register', async (req, res) => {
  const { name, email, password } = req.body

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' })
    }

    // Hash the password before storing
    const passwordHash = await hashPassword(password)

    // Create new user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
      },
    })

    // Don't send the password back to the client
    const { passwordHash: _, ...userWithoutPassword } = user
    res.json(userWithoutPassword)
  } catch (err) {
    console.error('Registration error:', err)
    res.status(500).json({ error: 'Registration error' })
  }
})

app.get('/api/profile/:id', async (req, res) => {
  const { id } = req.params

  try {
    const user = await prisma.user.findUnique({
      where: { id: Number(id) },
      select: {
        id: true,
        name: true,
        email: true,
        entries: true,
        joined: true,
      },
    })

    if (user) {
      res.json(user)
    } else {
      res.status(404).json({ error: 'User not found' })
    }
  } catch (err) {
    console.error('Error fetching user:', err)
    res.status(500).json({ error: 'Error fetching user' })
  }
})

app.put('/api/image', async (req, res) => {
  const { id, imageUrl, detectionResults } = req.body

  try {
    // Increment the user's entry count
    const updatedUser = await prisma.user.update({
      where: { id: Number(id) },
      data: {
        entries: {
          increment: 1,
        },
      },
    })

    // Store image entry details
    if (imageUrl) {
      await prisma.imageEntry.create({
        data: {
          userId: Number(id),
          imageUrl,
          detectionResults,
        },
      })
    }

    // Don't send the password back to the client
    const { passwordHash: _, ...userWithoutPassword } = updatedUser
    res.json(userWithoutPassword)
  } catch (err) {
    console.error('Error updating user:', err)
    res.status(500).json({ error: 'Error updating user' })
  }
})

// For production: serve the static files from the Vite build
if (process.env.NODE_ENV === 'production') {
  // Serve static files from the Vite build directory
  const distPath = path.resolve(__dirname, '../dist')

  app.use(express.static(distPath))

  // Catch-all handler: send back index.html for any non-API routes
  app.get('/*name', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'))
  })
}

// Connect to the database and start the server
async function startServer() {
  try {
    // Test database connection
    await prisma.$connect()
    console.log('Connected to the database successfully')

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
    })
  } catch (error) {
    console.error('Failed to connect to the database:', error)
    process.exit(1)
  }
}

void startServer()
