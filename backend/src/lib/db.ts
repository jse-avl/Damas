import { MongoClient, Db, Collection, Document } from 'mongodb'

const client = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017')

let db: Db

export async function connectDB(): Promise<Db> {
  if (!db) {
    await client.connect()
    db = client.db('damas')
    await ensureIndexes(db)
  }
  return db
}

export function getDB(): Db {
  if (!db) throw new Error('Database not connected')
  return db
}

export function getCollection<T extends Document>(name: string): Collection<T> {
  return getDB().collection<T>(name)
}

async function ensureIndexes(db: Db) {
  await db.collection('games').createIndex({ userId: 1, createdAt: -1 })
  await db.collection('games').createIndex({ status: 1 })
  await db.collection('rankings').createIndex({ time: 1 })
  await db.collection('rankings').createIndex({ gameMode: 1, time: 1 })
  await db.collection('users').createIndex({ clerkId: 1 }, { unique: true })
  await db.collection('marketplace_items').createIndex({ type: 1 })
}
