const dns = require('dns')
dns.setDefaultResultOrder('ipv4first')

require('dotenv').config()

const fs = require('fs')
const path = require('path')
const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const authRoutes = require('./routes/authRoutes')
const uploadRoutes = require('./routes/uploadRoutes')

const app = express()
const port = process.env.PORT || 5000
const uploadsDir = path.join(__dirname, 'uploads')

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

app.use(
  cors({
    origin(origin, callback) {
      const allowedFrontendOrigin = process.env.FRONTEND_ORIGIN

      // Allow non-browser clients, local Vite dev servers, and deployed Vercel frontends.
      if (
        !origin ||
        /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin) ||
        /^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(origin) ||
        (allowedFrontendOrigin && origin === allowedFrontendOrigin)
      ) {
        callback(null, true)
        return
      }

      callback(new Error('CORS not allowed'))
    },
    credentials: true,
  })
)
app.use(express.json())
app.use('/uploads', express.static(uploadsDir))

app.get('/', (_req, res) => {
  res.send('Backend running 🚀')
})

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.use('/api/auth', authRoutes)
app.use('/api/resume', uploadRoutes)

async function startServer() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not defined')
    }

    await mongoose.connect(process.env.MONGO_URI)
    console.log('✅ MongoDB Connected')

    app.listen(port, () => {
      console.log(`Server running on port ${port} 🚀`)
    })
  } catch (error) {
    console.error('❌ Server failed to start:', error)
    process.exit(1)
  }
}

startServer()