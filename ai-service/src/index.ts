import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { z } from 'zod'
import { Player, deserializeBoard, serializeBoard } from './types'
import { findBestMove } from './engine'
import { applyMove } from './board'

const app = new Hono()

app.use('*', cors())

const moveRequestSchema = z.object({
  board: z.array(z.array(z.number())),
  player: z.number().refine(v => v === 1 || v === 2, 'Player must be 1 or 2'),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional().default('medium'),
})

app.get('/api/ai/health', (c) => c.json({ status: 'ok', service: 'damas-ai' }))

app.post('/api/ai/move', async (c) => {
  try {
    const body = await c.req.json()
    const parsed = moveRequestSchema.safeParse(body)
    if (!parsed.success) {
      return c.json({ success: false, error: parsed.error.message }, 400)
    }

    const { board: boardData, player, difficulty } = parsed.data
    const board = deserializeBoard(boardData)
    const boardSize = board.length
    const aiPlayer = player as Player

    const bestMove = findBestMove(board, aiPlayer, difficulty)

    if (!bestMove) {
      return c.json({ success: false, error: 'No moves available' }, 400)
    }

    const newBoard = applyMove(board, bestMove)

    return c.json({
      success: true,
      data: {
        moves: bestMove.map(m => ({
          from: m.from,
          to: m.to,
          captured: m.captured || undefined,
        })),
        board: serializeBoard(newBoard),
      },
    })
  } catch (err: any) {
    return c.json({ success: false, error: err.message || 'AI computation failed' }, 500)
  }
})

const port = parseInt(process.env.PORT || '4001')

console.log(`AI service running on http://localhost:${port}`)
Bun.serve({ fetch: app.fetch, port })
