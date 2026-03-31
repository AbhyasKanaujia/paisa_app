import express from 'express'

const router = express.Router()

router.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Paisa API is running',
    timestamp: new Date().toISOString(),
  })
})

export default router
