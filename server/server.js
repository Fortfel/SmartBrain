import express from 'express'
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import argon2 from 'argon2'

// Load environment variables
if (fs.existsSync('.env.local')) {
  process.loadEnvFile('.env.local')
}
if (fs.existsSync('.env')) {
  process.loadEnvFile('.env')
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const PORT = process.env.PORT || 3000

/**
 * Hashes a password using argon2id algorithm
 * @param {string} password - The plain text password to hash
 * @returns {Promise<string>} - The hashed password
 */
async function hashPassword(password) {
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

// mock database
const users = [
  { id: 1, name: 'John Doe', email: 'test@email.com', password: 'secret', entries: 0, joined: new Date() },
  { id: 2, name: 'Bob Cat', email: 'bob@email.com', password: 'secret2', entries: 0, joined: new Date() },
]

// Hash existing passwords in the mock database
async function initializeUsers() {
  for (const user of users) {
    // Only hash if it's not already a hash (argon2 hashes start with $argon2)
    if (!user.password.startsWith('$argon2')) {
      user.password = await hashPassword(user.password)
    }
  }
  console.log('User passwords hashed successfully')
}

initializeUsers().catch((err) => console.error('Error hashing passwords:', err))

const app = express()

// Middleware
app.use(express.json())

// API Routes
app.get('/api', (req, res) => {
  res.json(users)
})

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body

  // Find user by email
  const user = users.find((u) => u.email === email)

  if (user) {
    try {
      // Verify password against stored hash
      const passwordValid = await verifyPassword(user.password, password)

      if (passwordValid) {
        // Don't send the password back to the client
        const { password, ...userWithoutPassword } = user
        res.json(userWithoutPassword)
      } else {
        res.status(401).json({ error: 'Invalid email or password' })
      }
    } catch (err) {
      console.error('Password verification error:', err)
      res.status(500).json({ error: 'Authentication error' })
    }
  } else {
    res.status(401).json({ error: 'Invalid email or password' })
  }
})

app.post('/api/register', async (req, res) => {
  const { name, email, password } = req.body

  // Check if user already exists
  if (users.some((u) => u.email === email)) {
    return res.status(400).json({ error: 'User with this email already exists' })
  }

  try {
    // Hash the password before storing
    const hashedPassword = await hashPassword(password)

    const user = {
      id: users.length + 1,
      name,
      email,
      password: hashedPassword,
      entries: 0,
      joined: new Date(),
    }

    users.push(user)

    // Don't send the password back to the client
    const { password, ...userWithoutPassword } = user
    res.json(userWithoutPassword)
  } catch (err) {
    console.error('Password hashing error:', err)
    res.status(500).json({ error: 'Registration error' })
  }
})

app.get('/api/profile/:id', (req, res) => {
  const { id } = req.params
  const user = users.find((u) => u.id === Number(id))
  if (user) {
    res.json(user)
  } else {
    res.status(404).json({ error: 'User not found' })
  }
})

app.put('/api/image', (req, res) => {
  const { id } = req.body
  const user = users.find((u) => u.id === Number(id))
  if (user) {
    user.entries++
    res.json(user)
  } else {
    res.status(404).json({ error: 'User not found' })
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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
