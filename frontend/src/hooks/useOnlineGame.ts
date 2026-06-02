import { useState, useEffect, useCallback, useRef } from 'react'
import type { Move } from './useGame'

export type OnlineStatus = 'idle' | 'connecting' | 'waiting' | 'playing' | 'won' | 'disconnected'

export interface OnlineGameState {
  status: OnlineStatus
  player: 1 | 2 | null
  opponentId: string | null
  gameId: string | null
  lastEvent: { type: 'move' | 'capture' | 'king' | 'win' | 'lose' | 'opponent_joined' } | null
}

const SESSION_COOKIE = '__session'

function getDevUserId(): string {
  let id = localStorage.getItem('devUserId')
  if (!id) {
    id = 'dev_' + Math.random().toString(36).slice(2, 10)
    localStorage.setItem('devUserId', id)
  }
  return id
}

function getAuthToken(): string {
  const match = document.cookie.match(new RegExp(`(^| )${SESSION_COOKIE}=([^;]+)`))
  return match ? match[2] : getDevUserId()
}

export function useOnlineGame() {
  const [onlineState, setOnlineState] = useState<OnlineGameState>({
    status: 'idle',
    player: null,
    opponentId: null,
    gameId: null,
    lastEvent: null,
  })
  const eventSourceRef = useRef<EventSource | null>(null)
  const onStateUpdateRef = useRef<((data: any) => void) | null>(null)
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const closeSSE = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current)
      reconnectTimerRef.current = null
    }
  }, [])

  const setOnStateUpdate = useCallback((handler: (data: any) => void) => {
    onStateUpdateRef.current = handler
  }, [])

  const subscribeToGame = useCallback((gameId: string) => {
    closeSSE()

    const token = getAuthToken()
    const es = new EventSource(`/api/games/${gameId}/events?token=${token}`)
    eventSourceRef.current = es

    es.addEventListener('state', (e) => {
      const data = JSON.parse(e.data)
      if (data.player2Id) {
        setOnlineState(s => ({
          ...s,
          opponentId: data.player2Id === s.player ? data.player1Id : data.player2Id,
          status: 'playing',
          lastEvent: { type: 'opponent_joined' },
        }))
      }
      if (onStateUpdateRef.current) {
        onStateUpdateRef.current(data)
      }
    })

    es.addEventListener('game_over', (e) => {
      const data = JSON.parse(e.data)
      setOnlineState(s => ({
        ...s,
        status: 'won',
        lastEvent: { type: data.winner === s.player ? 'win' : 'lose' },
      }))
    })

    es.addEventListener('error', () => {
      es.close()
      eventSourceRef.current = null
      setOnlineState(s => ({ ...s, status: 'disconnected' }))
    })
  }, [closeSSE])

  const joinMatchmaking = useCallback(async () => {
    try {
      setOnlineState(s => ({ ...s, status: 'connecting' }))
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      const token = getAuthToken()
      if (!document.cookie.includes(SESSION_COOKIE)) {
        headers['x-dev-user-id'] = token
      }

      const savedBoard = localStorage.getItem('equipped_board') || '1'
      const savedPiece = localStorage.getItem('equipped_piece') || '4'

      const res = await fetch('/api/games/join', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          skin: { board: savedBoard, piece: savedPiece },
        }),
      })
      const json = await res.json()
      if (!res.ok || !json.success) throw new Error(json.error?.message || 'Failed to join')

      const result = json.data
      setOnlineState(s => ({
        ...s,
        gameId: result.gameId,
        player: result.player,
        opponentId: result.opponentId || null,
        status: result.opponentId ? 'playing' : 'waiting',
      }))
      return result
    } catch {
      setOnlineState(s => ({ ...s, status: 'disconnected' }))
      return null
    }
  }, [])

  const submitMove = useCallback(async (gameId: string, moves: Move[]) => {
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      const token = getAuthToken()
      if (!document.cookie.includes(SESSION_COOKIE)) {
        headers['x-dev-user-id'] = token
      }

      const res = await fetch(`/api/games/${gameId}/moves`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ moves }),
      })
      const json = await res.json()
      if (!res.ok || !json.success) throw new Error(json.error?.message || 'Move failed')
      return json.data
    } catch {
      return null
    }
  }, [])

  const setLastEvent = useCallback((event: { type: 'move' | 'capture' | 'king' | 'win' | 'lose' | 'opponent_joined' } | null) => {
    setOnlineState(s => ({ ...s, lastEvent: event }))
  }, [])

  useEffect(() => {
    return () => {
      closeSSE()
    }
  }, [closeSSE])

  return {
    onlineState,
    joinMatchmaking,
    subscribeToGame,
    submitMove,
    setLastEvent,
    closeSSE,
    setOnStateUpdate,
  }
}
