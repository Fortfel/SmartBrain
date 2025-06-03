import express from 'express'
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'

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

const app = express()

// Middleware
app.use(express.json())

// API Routes
app.get('/api/hello', (req, res, next) => {
  res.json({ message: 'Hello from the backend!' })
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
