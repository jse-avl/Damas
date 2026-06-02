import { Hono } from 'hono'
import { getCollection } from '../lib/db'
import { success } from '../lib/response'
import type { RankingDoc } from '../models/types'

const router = new Hono()

router.get('/', async (c) => {
  const mode = c.req.query('mode')
  const rankings = getCollection<RankingDoc>('rankings')

  const filter: any = { won: true }
  if (mode && ['pve', 'pvp', 'online'].includes(mode)) {
    filter.gameMode = mode
  }

  const list = await rankings
    .find(filter)
    .sort({ time: 1, moves: 1 })
    .limit(50)
    .toArray()

  const formatted = list.map((r, i) => ({
    rank: i + 1,
    userId: r.userId,
    username: r.username,
    moves: r.moves,
    time: r.time,
    gameMode: r.gameMode,
    date: r.createdAt,
  }))

  return c.json(success(formatted))
})

export default router
