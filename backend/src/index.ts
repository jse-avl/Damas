import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { connectDB } from './lib/db'
import gamesRouter from './routes/games'
import rankingsRouter from './routes/rankings'
import marketplaceRouter from './routes/marketplace'
import authRouter from './routes/auth'
import paymentsRouter from './routes/payments'

const app = new Hono()

app.use('*', logger())
app.use('*', cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
}))

app.get('/api/health', (c) => c.json({ status: 'ok', service: 'damas-backend' }))

app.route('/api/games', gamesRouter)
app.route('/api/rankings', rankingsRouter)
app.route('/api/marketplace', marketplaceRouter)
app.route('/api/auth', authRouter)
app.route('/api/payments', paymentsRouter)

app.onError((err, c) => {
  console.error(err)
  return c.json({ success: false, error: { code: 'INTERNAL_ERROR', message: err.message } }, 500)
})

const port = parseInt(process.env.PORT || '4000')

async function start() {
  try {
    await connectDB()
    console.log('Connected to MongoDB')
    console.log(`Backend server running on http://localhost:${port}`)
    Bun.serve({
      fetch: app.fetch,
      port,
    })
  } catch (err) {
    console.error('Failed to start server:', err)
    process.exit(1)
  }
}

start()
