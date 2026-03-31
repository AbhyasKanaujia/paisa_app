import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import healthRouter from './routes/health.js'
import authRouter from './routes/auth.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const isProd = process.env.NODE_ENV === 'production'

const app = express()

app.use(cors({ origin: process.env.CLIENT_URL }))
app.use(express.json())

app.use('/api/health', healthRouter)
app.use('/api/auth', authRouter)

// Serve React build in production
if (isProd) {
  const clientDist = path.join(__dirname, '../client/dist')
  app.use(express.static(clientDist))
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'))
  })
}

// Global error handler
app.use((err, req, res, next) => {
  // Mongoose validation error → 400
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((e) => e.message).join(', ')
    return res.status(400).json({ message })
  }

  // Mongoose duplicate key → 409
  if (err.code === 11000) {
    return res.status(409).json({ message: 'Email already registered' })
  }

  console.error(err)
  res.status(500).json({ message: 'Internal server error' })
})

export default app
