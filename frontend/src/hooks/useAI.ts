import { useCallback } from 'react'
import type { Move } from './useGame'

const AI_SERVICE_URL = 'http://localhost:4001/api/ai/move'

export function useAI() {
  const getAIMove = useCallback(async (
    board: number[][],
    difficulty: string = 'medium',
  ): Promise<Move[] | null> => {
    try {
      const res = await fetch(AI_SERVICE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ board, player: 2, difficulty }),
      })

      if (!res.ok) return null
      const data = await res.json()
      if (!data.success) return null

      return data.data.moves.map((m: any) => ({
        from: m.from,
        to: m.to,
        captured: m.captured || undefined,
      }))
    } catch {
      return null
    }
  }, [])

  return { getAIMove }
}
