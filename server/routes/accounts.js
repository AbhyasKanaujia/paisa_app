import express from 'express'
import Account from '../models/Account.js'
import protect from '../middleware/auth.js'

const router = express.Router()

// GET /api/accounts
router.get('/', protect, async (req, res) => {
  const accounts = await Account.find({ userId: req.user._id }).sort({ createdAt: -1 })
  res.json({ accounts })
})

// POST /api/accounts
router.post('/', protect, async (req, res) => {
  const { name, type, balance, currency } = req.body

  if (!name || !type) {
    return res.status(400).json({ message: 'Name and type are required' })
  }

  const account = await Account.create({
    userId: req.user._id,
    name: name.trim(),
    type,
    balance: Number.isFinite(Number(balance)) ? Number(balance) : 0,
    currency: (currency || 'INR').toUpperCase(),
  })

  res.status(201).json({ account })
})

export default router
