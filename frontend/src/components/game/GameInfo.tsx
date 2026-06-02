interface GameInfoProps {
  currentPlayer: number
  moveCount: number
  capturedP1: number
  capturedP2: number
  status: string
  isAIThinking: boolean
  winner?: number
  mode?: 'pve' | 'pvp' | 'online'
}

export default function GameInfo({ currentPlayer, moveCount, capturedP1, capturedP2, status, isAIThinking, winner, mode = 'pve' }: GameInfoProps) {
  if (status === 'won') {
    return (
      <div className="p-5 rounded-xl card-flat text-center">
        <div className="text-3xl mb-1">👑</div>
        <p className="text-base font-semibold text-on-surface">
          {mode === 'pve'
            ? (winner === 1 ? '¡Has ganado!' : 'El bot ha ganado')
            : mode === 'online'
            ? (winner === 1 ? '¡Jugador 1 ha ganado!' : '¡Jugador 2 ha ganado!')
            : `¡Jugador ${winner} ha ganado!`}
        </p>
        <p className="text-sm mt-1 text-on-surface-variant">Movimientos: {moveCount}</p>
      </div>
    )
  }

  const playerColor = currentPlayer === 1 ? 'var(--color-p1)' : 'var(--color-p2)'
  const playerLabel = mode === 'pve'
    ? (currentPlayer === 1 ? 'Tú' : 'Bot')
    : mode === 'online'
    ? (currentPlayer === 1 ? 'Jugador 1' : 'Jugador 2')
    : (currentPlayer === 1 ? 'Jugador 1' : 'Jugador 2')

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between py-1.5 border-b border-outline-variant/30">
        <span className="text-sm text-on-surface-variant">Turno:</span>
        <span className="font-semibold flex items-center gap-1.5 text-sm" style={{ color: playerColor }}>
          <span style={{
            display: 'inline-block',
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: playerColor,
          }} />
          {playerLabel}
          {isAIThinking && currentPlayer === 2 && (
            <span className="inline-block w-3 h-3 border-2 rounded-full animate-spin"
              style={{ borderColor: playerColor, borderTopColor: 'transparent' }} />
          )}
        </span>
      </div>
      <div className="flex items-center justify-between py-1.5 border-b border-outline-variant/30">
        <span className="text-sm text-on-surface-variant">Movimientos:</span>
        <span className="font-mono font-bold text-on-surface">{moveCount}</span>
      </div>
      <div className="flex items-center justify-between py-1.5">
        <span className="text-sm text-on-surface-variant">Capturadas:</span>
        <div className="flex gap-3">
          <span className="font-mono flex items-center gap-1.5" style={{ color: 'var(--color-p1)' }}>
            <span style={{
              display: 'inline-block',
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: 'var(--color-p1)'
            }} />
            {capturedP1}
          </span>
          <span className="font-mono flex items-center gap-1.5" style={{ color: 'var(--color-p2)' }}>
            <span style={{
              display: 'inline-block',
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: 'var(--color-p2)'
            }} />
            {capturedP2}
          </span>
        </div>
      </div>
    </div>
  )
}
