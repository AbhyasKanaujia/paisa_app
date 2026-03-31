import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import connectDB from './config/db.js'
import healthRouter from './routes/health.js'

const app = express()
const PORT = process.env.PORT || 5000

// Connect to MongoDB
connectDB()

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL }))
app.use(express.json())

// Routes
app.use('/api/health', healthRouter)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
