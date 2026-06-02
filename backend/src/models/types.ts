import { ObjectId } from 'mongodb'

export interface GameDoc {
  _id?: ObjectId
  player1Id: string
  player2Id: string | null
  board: (number | null)[][]
  currentPlayer: number
  moveHistory: string[]
  status: 'waiting' | 'playing' | 'won' | 'draw'
  winner?: number
  capturedP1: number
  capturedP2: number
  moveCount: number
  createdAt: Date
  updatedAt: Date
  startedAt?: Date
  completedAt?: Date
  gameMode?: 'pve' | 'pvp' | 'online'
  player1Skin?: { board?: string; piece?: string }
  player2Skin?: { board?: string; piece?: string }
}

export interface RankingDoc {
  _id?: ObjectId
  userId: string
  username: string
  moves: number
  time: number
  won: boolean
  gameMode: 'pve' | 'pvp' | 'online'
  createdAt: Date
}

export interface MarketplaceItemDoc {
  _id?: ObjectId
  name: string
  type: 'board' | 'piece'
  imageUrl: string
  price: number
  colors?: string[]
  createdAt: Date
}

export interface PurchaseDoc {
  _id?: ObjectId
  userId: string
  itemId: string
  purchasedAt: Date
}

export interface UserDoc {
  _id?: ObjectId
  clerkId: string
  username: string
  email: string
  coins: number
  equippedBoard?: string
  equippedPiece?: string
  createdAt: Date
}
