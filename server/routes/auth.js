import express from 'express'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import protect from '../middleware/auth.js'

const router = express.Router()

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  })

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' })
  }

  const exists = await User.findOne({ email })
  if (exists) {
    return res.status(409).json({ message: 'Email already registered' })
  }

  const user = await User.create({ name, email, password })
  const token = signToken(user._id)

  res.status(201).json({
    token,
    user: { id: user._id, name: user.name, email: user.email },
  })
})

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' })
  }

  const user = await User.findOne({ email }).select('+password')
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ message: 'Invalid credentials' })
  }

  const token = signToken(user._id)

  res.json({
    token,
    user: { id: user._id, name: user.name, email: user.email },
  })
})

// GET /api/auth/me  (protected)
router.get('/me', protect, (req, res) => {
  const { _id: id, name, email, createdAt } = req.user
  res.json({ id, name, email, createdAt })
})

// DELETE /api/auth/me  (protected) — delete own account
router.delete('/me', protect, async (req, res) => {
  await User.findByIdAndDelete(req.user._id)
  res.json({ message: 'Account deleted' })
})

export default router
