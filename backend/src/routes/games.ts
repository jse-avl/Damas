import { Hono } from 'hono'
import { z } from 'zod'
import { ObjectId, Document } from 'mongodb'
import { streamSSE } from 'hono/streaming'
import { getCollection } from '../lib/db'
import { success, error } from '../lib/response'
import { authMiddleware, getUserIdFromToken } from '../middleware/auth'
import {
  Player,
  PieceType,
  Piece,
  GameState,
  Move,
} from '../game-engine/types'
import * as Rules from '../game-engine/rules'

const router = new Hono()

function boardToSerial(board: (Piece | null)[][]): number[][] {
  return board.map(row =>
    row.map(cell => {
      if (!cell) return 0
      if (cell.player === Player.Player1 && cell.type === PieceType.Man) return 1
      if (cell.player === Player.Player1 && cell.type === PieceType.King) return 2
      if (cell.player === Player.Player2 && cell.type === PieceType.Man) return 3
      if (cell.player === Player.Player2 && cell.type === PieceType.King) return 4
      return 0
    })
  )
}

function serialToBoard(data: number[][]): (Piece | null)[][] {
  return data.map(row =>
    row.map(val => {
      if (val === 1) return { player: Player.Player1, type: PieceType.Man }
      if (val === 2) return { player: Player.Player1, type: PieceType.King }
      if (val === 3) return { player: Player.Player2, type: PieceType.Man }
      if (val === 4) return { player: Player.Player2, type: PieceType.King }
      return null
    })
  )
}

router.get('/:id/events', async (c) => {
  const token = c.req.query('token')
  if (!token) return c.json(error('UNAUTHORIZED', 'Missing token'), 401)

  const userId = await getUserIdFromToken(token)
  if (!userId) {
    const devUserId = c.req.query('devUserId')
    if (!devUserId) return c.json(error('UNAUTHORIZED', 'Invalid token'), 401)
  }

  const uid = userId || c.req.query('devUserId')!
  const gameId = c.req.param('id')
  const games = getCollection<Document>('games')

  const game = await games.findOne({ _id: new ObjectId(gameId) })
  if (!game || (game.player1Id !== uid && game.player2Id !== uid)) {
    return c.json(error('NOT_FOUND', 'Game not found or not authorized'), 404)
  }

  return streamSSE(c, async (s) => {
    let lastUpdated = game.updatedAt.getTime()

    const initialPayload = {
      ...game,
      _id: game._id.toString(),
      player1Skin: (game as any).player1Skin || null,
      player2Skin: (game as any).player2Skin || null,
    }
    await s.writeSSE({
      event: 'state',
      data: JSON.stringify(initialPayload),
      id: '0',
    })

    while (true) {
      await s.sleep(1500)
      const current = await games.findOne({ _id: new ObjectId(gameId) })
      if (!current) {
        await s.writeSSE({ event: 'error', data: JSON.stringify({ message: 'Game not found' }) })
        break
      }

      const updatedTime = current.updatedAt.getTime()
      if (updatedTime > lastUpdated) {
        lastUpdated = updatedTime
        const payload = {
          ...current,
          _id: current._id.toString(),
          player1Skin: (current as any).player1Skin || null,
          player2Skin: (current as any).player2Skin || null,
        }
        await s.writeSSE({ event: 'state', data: JSON.stringify(payload) })

        if (current.status === 'won') {
          await s.writeSSE({ event: 'game_over', data: JSON.stringify({ winner: current.winner }) })
          break
        }
      }
    }
  })
})

router.use('*', authMiddleware)

router.post('/', async (c) => {
  try {
    const userId = c.get('userId')
    const initial = Rules.createInitialState()
    const games = getCollection<Document>('games')

    const body = await c.req.json().catch(() => ({}))
    const gameMode: string = body.mode || 'pve'
    const player1Skin = body.skin || {}

    const doc = {
      player1Id: userId,
      player2Id: null,
      board: boardToSerial(initial.board),
      currentPlayer: initial.currentPlayer,
      moveHistory: [] as string[],
      status: initial.status as string,
      winner: null,
      capturedP1: initial.capturedPieces[Player.Player1],
      capturedP2: initial.capturedPieces[Player.Player2],
      moveCount: 0,
      gameMode,
      player1Skin,
      startedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await games.insertOne(doc)
    return c.json(success({ gameId: result.insertedId.toString(), ...doc }), 201)
  } catch (err) {
    return c.json(error('CREATE_FAILED', 'Failed to create game'), 500)
  }
})

router.post('/join', async (c) => {
  try {
    const userId = c.get('userId')
    const games = getCollection<Document>('games')
    const body = await c.req.json().catch(() => ({}))
    const player2Skin = body.skin || {}

    const waiting = await games.findOne({
      status: 'waiting',
      player2Id: null,
      player1Id: { $ne: userId },
    })

    if (waiting) {
      await games.updateOne(
        { _id: waiting._id },
        { $set: { player2Id: userId, status: 'playing', player2Skin, updatedAt: new Date(), startedAt: new Date() } }
      )
      return c.json(success({
        gameId: waiting._id.toString(),
        player: 2,
        opponentId: waiting.player1Id,
        opponentSkin: (waiting as any).player1Skin || null,
      }))
    }

    const initial = Rules.createInitialState()
    const doc = {
      player1Id: userId,
      player2Id: null,
      board: boardToSerial(initial.board),
      currentPlayer: initial.currentPlayer,
      moveHistory: [] as string[],
      status: 'waiting',
      winner: null,
      capturedP1: initial.capturedPieces[Player.Player1],
      capturedP2: initial.capturedPieces[Player.Player2],
      moveCount: 0,
      gameMode: 'online',
      player1Skin: player2Skin,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await games.insertOne(doc)
    return c.json(success({
      gameId: result.insertedId.toString(),
      player: 1,
      opponentId: null,
    }))
  } catch (err) {
    return c.json(error('JOIN_FAILED', 'Failed to join or create game'), 500)
  }
})

router.get('/:id', async (c) => {
  try {
    const games = getCollection<Document>('games')
    const game = await games.findOne({ _id: new ObjectId(c.req.param('id')) })
    if (!game) return c.json(error('NOT_FOUND', 'Game not found'), 404)
    return c.json(success({ ...game, _id: game._id?.toString() }))
  } catch {
    return c.json(error('INVALID_ID', 'Invalid game ID'), 400)
  }
})

const moveSchema = z.object({
  moves: z.array(z.object({
    from: z.object({ row: z.number(), col: z.number() }),
    to: z.object({ row: z.number(), col: z.number() }),
    captured: z.object({ row: z.number(), col: z.number() }).optional(),
  })),
})

router.post('/:id/moves', async (c) => {
  try {
    const userId = c.get('userId')
    const games = getCollection<Document>('games')
    const gameId = c.req.param('id')
    const game = await games.findOne({ _id: new ObjectId(gameId) })
    if (!game) return c.json(error('NOT_FOUND', 'Game not found'), 404)
    if (game.status !== 'playing') return c.json(error('GAME_OVER', 'Game is already over'), 400)

    if (game.player2Id) {
      if (game.currentPlayer === 1 && userId !== game.player1Id) {
        return c.json(error('NOT_YOUR_TURN', 'It is not your turn'), 403)
      }
      if (game.currentPlayer === 2 && userId !== game.player2Id) {
        return c.json(error('NOT_YOUR_TURN', 'It is not your turn'), 403)
      }
    }

    const body = await c.req.json()
    const parsed = moveSchema.safeParse(body)
    if (!parsed.success) return c.json(error('INVALID_MOVE', parsed.error.message), 400)

    const board = serialToBoard(game.board as number[][])
    const state: GameState = {
      board,
      currentPlayer: game.currentPlayer as Player,
      moveHistory: [],
      status: 'playing',
      capturedPieces: {
        [Player.Player1]: (game as any).capturedP1 || 0,
        [Player.Player2]: (game as any).capturedP2 || 0,
      },
    }

    const newState = Rules.applyMove(state, parsed.data.moves as Move[])
    const updatedBoard = boardToSerial(newState.board)
    const moveCount = (game as any).moveCount + 1

    const now = new Date()
    const moveStrings = parsed.data.moves.map((m: any) => JSON.stringify(m))

    const update: any = {
      $set: {
        board: updatedBoard,
        currentPlayer: newState.currentPlayer,
        status: newState.status,
        winner: newState.winner || null,
        capturedP1: newState.capturedPieces[Player.Player1],
        capturedP2: newState.capturedPieces[Player.Player2],
        moveCount,
        updatedAt: now,
      },
      $push: { moveHistory: { $each: moveStrings } } as any,
    }

    if (newState.status === 'won') {
      update.$set.completedAt = now
    }

    await games.updateOne({ _id: new ObjectId(gameId) }, update)

    if (newState.status === 'won') {
      const rankings = getCollection<Document>('rankings')
      const users = getCollection<Document>('users')

      const startedAt = (game as any).startedAt || game.createdAt
      const elapsedSeconds = Math.floor((now.getTime() - new Date(startedAt).getTime()) / 1000)

      const winnerId = newState.winner === Player.Player1 ? game.player1Id : game.player2Id
      if (winnerId) {
        const user = await users.findOne({ clerkId: winnerId })
        const gameMode = (game as any).gameMode || 'pve'
        await rankings.insertOne({
          userId: winnerId,
          username: (user?.username as string) || 'Player',
          moves: moveCount,
          time: elapsedSeconds,
          won: true,
          gameMode,
          createdAt: new Date(),
        })
      }
    }

    return c.json(success({
      board: updatedBoard,
      currentPlayer: newState.currentPlayer,
      status: newState.status,
      winner: newState.winner,
      moveCount,
    }))
  } catch (err: any) {
    return c.json(error('MOVE_FAILED', err.message || 'Failed to make move'), 400)
  }
})

router.get('/', async (c) => {
  const userId = c.get('userId')
  const games = getCollection<Document>('games')
  const list = await games
    .find({
      $or: [
        { player1Id: userId },
        { player2Id: userId },
      ] as any,
    })
    .sort({ createdAt: -1 })
    .limit(20)
    .toArray()
  return c.json(success(list.map(g => ({ ...g, _id: g._id?.toString() }))))
})

export default router
