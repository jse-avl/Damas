import { Hono } from 'hono'
import { ObjectId, Document } from 'mongodb'
import { getCollection } from '../lib/db'
import { success, error } from '../lib/response'
import { authMiddleware } from '../middleware/auth'

const router = new Hono()

router.use('*', authMiddleware)

router.get('/items', async (c) => {
  const items = getCollection<Document>('marketplace_items')
  const list = await items.find({}).sort({ createdAt: -1 }).toArray()
  return c.json(success(list.map(i => ({ ...i, _id: i._id?.toString() }))))
})

router.post('/buy', async (c) => {
  try {
    const userId = c.get('userId')
    const body = await c.req.json()
    const { itemId } = body
    if (!itemId) return c.json(error('INVALID_REQUEST', 'itemId required'), 400)

    const items = getCollection<Document>('marketplace_items')
    const item = await items.findOne({ _id: new ObjectId(itemId) })
    if (!item) return c.json(error('NOT_FOUND', 'Item not found'), 404)

    const users = getCollection<Document>('users')
    const user = await users.findOne({ clerkId: userId })
    if (!user) return c.json(error('NOT_FOUND', 'User not found'), 404)
    if ((user as any).coins < (item as any).price) return c.json(error('INSUFFICIENT_FUNDS', 'Not enough coins'), 400)

    const purchases = getCollection<Document>('purchases')
    const existing = await purchases.findOne({ userId, itemId: item._id!.toString() })
    if (existing) return c.json(error('ALREADY_OWNED', 'Already owned'), 400)

    await purchases.insertOne({ userId, itemId: item._id!.toString(), purchasedAt: new Date() })
    await users.updateOne({ clerkId: userId }, { $inc: { coins: -(item as any).price } })

    return c.json(success({ message: 'Purchase successful' }))
  } catch {
    return c.json(error('PURCHASE_FAILED', 'Purchase failed'), 500)
  }
})

router.get('/inventory', async (c) => {
  const userId = c.get('userId')
  const purchases = getCollection<Document>('purchases')
  const items = getCollection<Document>('marketplace_items')

  const owned = await purchases.find({ userId }).toArray()
  const itemIds = owned.map(p => (p as any).itemId).filter(Boolean)
  const ownedItems = itemIds.length > 0
    ? await items.find({ _id: { $in: itemIds.map((id: string) => new ObjectId(id)) } }).toArray()
    : []

  return c.json(success(ownedItems.map(i => ({ ...i, _id: i._id?.toString() }))))
})

router.post('/equip', async (c) => {
  try {
    const userId = c.get('userId')
    const body = await c.req.json()
    const { boardId, pieceId } = body

    const users = getCollection<Document>('users')
    const update: any = {}
    if (boardId) update.equippedBoard = boardId
    if (pieceId) update.equippedPiece = pieceId

    await users.updateOne({ clerkId: userId }, { $set: update })
    return c.json(success({ message: 'Equipment updated' }))
  } catch {
    return c.json(error('EQUIP_FAILED', 'Failed to equip item'), 500)
  }
})

export default router
