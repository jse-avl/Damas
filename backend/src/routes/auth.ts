import { Hono } from 'hono'
import { Webhook } from 'svix'
import { Document } from 'mongodb'
import { getCollection } from '../lib/db'
import { success, error } from '../lib/response'
import { syncClerkUser, getUserIdFromToken } from '../middleware/auth'

const router = new Hono()

router.post('/webhook', async (c) => {
  try {
    const svixId = c.req.header('svix-id')
    const svixTimestamp = c.req.header('svix-timestamp')
    const svixSignature = c.req.header('svix-signature')

    if (!svixId || !svixTimestamp || !svixSignature) {
      return c.json(error('WEBHOOK_FAILED', 'Missing Svix headers'), 401)
    }

    const secret = process.env.CLERK_WEBHOOK_SECRET
    if (!secret) {
      return c.json(error('WEBHOOK_FAILED', 'Webhook secret not configured'), 500)
    }

    const wh = new Webhook(secret)
    const body = await c.req.text()
    const payload: any = wh.verify(body, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    })

    const { type, data } = payload
    const email = data?.email?.[0]?.email_address || ''
    const username = data?.username || email.split('@')[0] || 'Player'

    if (type === 'user.created') {
      await syncClerkUser(data.id, email, username)
    }

    return c.json(success({ message: `Webhook ${type} processed` }))
  } catch {
    return c.json(error('WEBHOOK_FAILED', 'Webhook verification failed'), 401)
  }
})

router.get('/profile', async (c) => {
  const authHeader = c.req.header('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json(error('UNAUTHORIZED', 'Missing token'), 401)
  }

  try {
    const token = authHeader.slice(7)
    const userId = await getUserIdFromToken(token)
    if (!userId) {
      return c.json(error('AUTH_FAILED', 'Invalid token'), 401)
    }

    const users = getCollection<Document>('users')
    let user = await users.findOne({ clerkId: userId })
    if (!user) {
      return c.json(error('NOT_FOUND', 'User not found'), 404)
    }

    return c.json(success({
      clerkId: user.clerkId,
      username: user.username,
      email: user.email,
      coins: user.coins || 0,
      equippedBoard: user.equippedBoard,
      equippedPiece: user.equippedPiece,
    }))
  } catch {
    return c.json(error('AUTH_FAILED', 'Authentication failed'), 401)
  }
})

export default router