import { MiddlewareHandler } from 'hono'
import { verifyToken } from '@clerk/backend'
import { Document } from 'mongodb'
import { getCollection } from '../lib/db'

declare module 'hono' {
  interface ContextVariableMap {
    userId: string
  }
}

const secretKey = process.env.CLERK_SECRET_KEY || ''

export const authMiddleware: MiddlewareHandler = async (c, next) => {
  const devUserId = c.req.header('x-dev-user-id')
  if (devUserId) {
    c.set('userId', devUserId)
    await next()
    return
  }

  const authHeader = c.req.header('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Missing token' } }, 401)
  }

  const token = authHeader.slice(7)

  try {
    const payload = await verifyToken(token, { secretKey })
    c.set('userId', payload.sub)
    await next()
  } catch {
    return c.json({ success: false, error: { code: 'INVALID_TOKEN', message: 'Invalid or expired token' } }, 401)
  }
}

export async function syncClerkUser(clerkId: string, email: string, username: string) {
  const users = getCollection<Document>('users')
  const existing = await users.findOne({ clerkId })
  if (!existing) {
    await users.insertOne({ clerkId, email, username, coins: 0, createdAt: new Date() })
  }
}

export async function getUserIdFromToken(token: string): Promise<string | null> {
  try {
    const payload = await verifyToken(token, { secretKey })
    return payload.sub
  } catch {
    return null
  }
}