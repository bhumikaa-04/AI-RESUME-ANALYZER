const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const { requireAuth } = require('../middleware/authMiddleware')

const router = express.Router()

function createToken(user) {
  return jwt.sign(
    {
      sub: user._id.toString(),
      email: user.email,
      name: user.name,
    },
    process.env.JWT_SECRET || 'resume-ai-dev-secret',
    { expiresIn: '7d' }
  )
}

function sanitizeUser(user) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
  }
}

router.post('/register', async (req, res) => {
  try {
    const name = (req.body.name || '').trim()
    const email = (req.body.email || '').trim().toLowerCase()
    const password = req.body.password || ''

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' })
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' })
    }

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(409).json({ message: 'An account with this email already exists' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const user = await User.create({ name, email, password: hashedPassword })
    const token = createToken(user)

    return res.status(201).json({
      access_token: token,
      token_type: 'bearer',
      user: sanitizeUser(user),
    })
  } catch (error) {
    console.error('Register error:', error)
    return res.status(500).json({ message: 'Registration failed' })
  }
})

router.post('/login', async (req, res) => {
  try {
    const email = (req.body.email || '').trim().toLowerCase()
    const password = req.body.password || ''

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' })
    }

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(401).json({ message: 'Incorrect email or password' })
    }

    const passwordMatches = await bcrypt.compare(password, user.password)
    if (!passwordMatches) {
      return res.status(401).json({ message: 'Incorrect email or password' })
    }

    const token = createToken(user)
    return res.json({
      access_token: token,
      token_type: 'bearer',
      user: sanitizeUser(user),
    })
  } catch (error) {
    console.error('Login error:', error)
    return res.status(500).json({ message: 'Login failed' })
  }
})

router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.sub).select('name email createdAt')
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    return res.json({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    })
  } catch (error) {
    console.error('Profile error:', error)
    return res.status(500).json({ message: 'Could not load user profile' })
  }
})

module.exports = router
