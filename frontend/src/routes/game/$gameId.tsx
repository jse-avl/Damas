import { useEffect, useRef, useCallback, useState, Suspense } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import Board3D from '../../components/game/Board3D'
import GameInfo from '../../components/game/GameInfo'
import SoundManager from '../../components/game/SoundManager'
import { useGame, GameMode, Move } from '../../hooks/useGame'
import { useAI } from '../../hooks/useAI'
import { useOnlineGame } from '../../hooks/useOnlineGame'
import { BOARD_SKINS, PIECE_SKINS } from '../../lib/constants'

export interface GameSearch {
  difficulty?: string
  mode?: GameMode
  player?: 1 | 2
  boardSize?: number
}

export const Route = createFileRoute('/game/$gameId')({
  component: GamePage,
  validateSearch: (search: Record<string, unknown>): GameSearch => ({
    difficulty: (search.difficulty as string) || 'medium',
    mode: (search.mode as GameMode) || 'pve',
    player: (search.player as 1 | 2) || 1,
    boardSize: Number(search.boardSize) || 6,
  }),
})

function FloatingParticles({ isWin }: { isWin: boolean }) {
  return (
    <div className="fixed inset-0 pointer-events-none z-[60] overflow-hidden">
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            width: `${3 + (i % 3) * 3}px`,
            height: `${3 + (i % 3) * 3}px`,
            left: `${(i * 5.3) % 100}%`,
            top: `${80 + (i % 15)}%`,
            background: isWin
              ? ['#4a8fe7', '#3575c9', '#6aabf0', '#d3e3fd'][i % 4]
              : ['#9aa0a6', '#74777c'][i % 2],
            opacity: 0,
            animation: `modalParticle ${3 + (i % 5) * 0.5}s ease-in ${1.5 + i * 0.15}s infinite`,
            borderRadius: i % 2 === 0 ? '50%' : '2px',
          }}
        />
      ))}
    </div>
  )
}

function GameOverModal({
  isWin,
  moveCount,
  capturedP1,
  capturedP2,
  currentPlayer,
  winner,
  mode,
  onPlayAgain,
  onBackToMenu,
}: {
  isWin: boolean
  moveCount: number
  capturedP1: number
  capturedP2: number
  currentPlayer: number
  winner?: number
  mode?: GameMode
  onPlayAgain: () => void
  onBackToMenu: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0" style={{
        background: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(6px)',
      }} />

      <FloatingParticles isWin={isWin} />

      <div className={`relative card-flat p-8 text-center animate-scale-in-bounce max-w-sm w-full ${isWin ? 'border-primary/30' : ''}`}>
        <div className={`w-14 h-14 mx-auto mb-4 rounded-2xl flex items-center justify-center ${
          isWin ? 'bg-primary/10 border border-primary/20' : 'bg-surface-container border border-outline-variant'
        }`}>
          <span className={`material-symbols-outlined text-3xl ${isWin ? 'text-primary' : 'text-on-surface-variant'}`}
            style={{ fontVariationSettings: "'FILL' 1" }}>
            {isWin ? 'workspace_premium' : 'sentiment_dissatisfied'}
          </span>
        </div>

        <h2 className="text-2xl font-headline font-bold mb-1">{isWin ? 'Victoria' : 'Derrota'}</h2>
        <p className="text-sm text-on-surface-variant mb-6">
          {mode === 'pve'
            ? (isWin ? 'Has derrotado a la IA' : 'La IA te ha derrotado')
            : mode === 'online'
            ? (isWin ? 'Has ganado la partida online' : 'Has perdido la partida online')
            : `Jugador ${winner} ha ganado`}
        </p>

        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="card-ghost p-3">
            <p className="text-xs text-on-surface-variant font-mono uppercase tracking-wider mb-1">Turnos</p>
            <p className="text-lg font-headline font-bold">{moveCount}</p>
          </div>
          <div className="p-3 rounded-xl" style={{ background: 'rgba(217, 48, 37, 0.06)', border: '1px solid rgba(217, 48, 37, 0.15)' }}>
            <p className="text-xs font-mono uppercase tracking-wider mb-1" style={{ color: '#d93025' }}>Capt. J1</p>
            <p className="text-lg font-headline font-bold" style={{ color: '#d93025' }}>{capturedP2}</p>
          </div>
          <div className="p-3 rounded-xl" style={{ background: 'rgba(30, 142, 62, 0.06)', border: '1px solid rgba(30, 142, 62, 0.15)' }}>
            <p className="text-xs font-mono uppercase tracking-wider mb-1" style={{ color: '#1e8e3e' }}>Capt. J2</p>
            <p className="text-lg font-headline font-bold" style={{ color: '#1e8e3e' }}>{capturedP1}</p>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <button onClick={onPlayAgain} className="btn btn-primary w-full justify-center">
            Jugar de nuevo
          </button>
          <button onClick={onBackToMenu} className="btn btn-secondary w-full justify-center">
            Volver al menú
          </button>
        </div>
      </div>
    </div>
  )
}

function Confetti({ isWin }: { isWin: boolean }) {
  const colors = isWin
    ? ['#4a8fe7', '#3575c9', '#6aabf0', '#d3e3fd', '#1a73e8']
    : ['#9aa0a6', '#74777c', '#5f6368', '#c4c7cb']

  return (
    <div className="fixed inset-0 pointer-events-none z-[60] overflow-hidden">
      {Array.from({ length: 30 }).map((_, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            width: `${4 + (i % 3) * 4}px`,
            height: `${4 + (i % 3) * 4}px`,
            left: `${(i * 7) % 100}%`,
            top: '-10px',
            background: colors[i % colors.length],
            borderRadius: i % 3 === 0 ? '50%' : '2px',
            animation: `confettiFall ${1.5 + (i % 3) * 0.8}s ease-in ${i * 0.08}s forwards`,
            transform: `rotate(${i * 45}deg)`,
          }}
        />
      ))}
    </div>
  )
}

function LoadingScreen() {
  return (
    <div className="flex-1 flex items-center justify-center min-h-[500px] bg-surface-container-low/30">
      <div className="text-center animate-scale-in">
        <div className="inline-block w-12 h-12 border-2 border-primary/30 border-t-primary rounded-full mb-4" style={{ animation: 'spin 0.8s linear infinite' }} />
        <p className="text-sm text-on-surface-variant">Cargando tablero...</p>
      </div>
    </div>
  )
}

function GamePage() {
  const { gameId } = Route.useParams()
  const { difficulty, mode, player: onlinePlayer, boardSize } = Route.useSearch()
  const navigate = useNavigate()
  const { getAIMove } = useAI()
  const [viewMode, setViewMode] = useState<'3d' | 'top'>('3d')
  const [showConfetti, setShowConfetti] = useState(false)
  const [showGameOver, setShowGameOver] = useState(false)
  const [showSidebar, setShowSidebar] = useState(true)

  const [boardSkinId, setBoardSkinId] = useState('classic')
  const [pieceSkinId, setPieceSkinId] = useState('standard')
  const [opponentBoardSkinId, setOpponentBoardSkinId] = useState<string | undefined>(undefined)
  const [opponentPieceSkinId, setOpponentPieceSkinId] = useState<string | undefined>(undefined)
  const hasSentSkin = useRef(false)

  useEffect(() => {
    const savedBoard = localStorage.getItem('equipped_board')
    const savedPiece = localStorage.getItem('equipped_piece')

    if (savedBoard) {
      const key = Object.keys(BOARD_SKINS).find(k => BOARD_SKINS[k].id === savedBoard)
      if (key) setBoardSkinId(key)
    }
    if (savedPiece) {
      const key = Object.keys(PIECE_SKINS).find(k => PIECE_SKINS[k].id === savedPiece)
      if (key) setPieceSkinId(key)
    }
  }, [])

  useEffect(() => {
    if (mode === 'pve' && gameId === 'new' && !hasSentSkin.current) {
      hasSentSkin.current = true
      const savedBoard = localStorage.getItem('equipped_board') || '1'
      const savedPiece = localStorage.getItem('equipped_piece') || '4'
      fetch('/api/games', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'pve',
          skin: { board: savedBoard, piece: savedPiece },
        }),
      }).catch(() => {})
    }
  }, [mode, gameId])

  const {
    state,
    selectedPos,
    validMoves,
    isAIThinking,
    lastEvent,
    humanCurrent,
    mandatoryCapture,
    handleCellClick,
    makeAIMove,
    setIsAIThinking,
    setLastEvent,
    resetGame,
    syncFromServer,
  } = useGame(mode, boardSize || 6, mode === 'online' ? (moves: Move[]) => {
    submitMove(gameId, moves)
  } : undefined)

  const {
    onlineState,
    subscribeToGame,
    submitMove,
    setLastEvent: setOnlineEvent,
    closeSSE,
    setOnStateUpdate,
  } = useOnlineGame()

  const aiTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const aiTriggeredRef = useRef(false)
  const aiSafetyRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (state.currentPlayer !== 2) {
      aiTriggeredRef.current = false
      if (aiSafetyRef.current) {
        clearTimeout(aiSafetyRef.current)
        aiSafetyRef.current = null
      }
    }
  }, [state.currentPlayer])

  useEffect(() => {
    if (isAIThinking) {
      aiSafetyRef.current = setTimeout(() => {
        setIsAIThinking(false)
        aiTriggeredRef.current = false
      }, 15000)
    }
    return () => {
      if (aiSafetyRef.current) {
        clearTimeout(aiSafetyRef.current)
        aiSafetyRef.current = null
      }
    }
  }, [isAIThinking])

  useEffect(() => {
    if (mode === 'online') {
      setOnStateUpdate((data: any) => {
        syncFromServer({
          board: data.board as number[][],
          currentPlayer: data.currentPlayer,
          status: data.status,
          winner: data.winner,
          moveCount: data.moveCount,
          capturedP1: data.capturedP1,
          capturedP2: data.capturedP2,
        })
        if (data.player1Skin && onlinePlayer === 2) {
          const s = data.player1Skin
          const boardKey = Object.keys(BOARD_SKINS).find(k => BOARD_SKINS[k].id === s.board)
          const pieceKey = Object.keys(PIECE_SKINS).find(k => PIECE_SKINS[k].id === s.piece)
          if (boardKey) setOpponentBoardSkinId(s.board)
          if (pieceKey) setOpponentPieceSkinId(s.piece)
        }
        if (data.player2Skin && onlinePlayer === 1) {
          const s = data.player2Skin
          const boardKey = Object.keys(BOARD_SKINS).find(k => BOARD_SKINS[k].id === s.board)
          const pieceKey = Object.keys(PIECE_SKINS).find(k => PIECE_SKINS[k].id === s.piece)
          if (boardKey) setOpponentBoardSkinId(s.board)
          if (pieceKey) setOpponentPieceSkinId(s.piece)
        }
      })
    }
  }, [mode, onlinePlayer])

  useEffect(() => {
    if (mode === 'online' && gameId !== 'new') {
      subscribeToGame(gameId)
    }
    return () => { closeSSE() }
  }, [mode, gameId])

  useEffect(() => {
    if (mode === 'online' && onlineState.lastEvent?.type === 'opponent_joined') {
      setOnlineEvent(null)
    }
  }, [onlineState.status])

  useEffect(() => {
    if (mode === 'pve' && state.status === 'playing' && state.currentPlayer === 2 && !aiTriggeredRef.current) {
      aiTriggeredRef.current = true
      setIsAIThinking(true)
      aiTimeoutRef.current = setTimeout(async () => {
        const moves = await getAIMove(state.board, difficulty)
        if (moves && moves.length > 0) {
          makeAIMove(moves)
        } else {
          setIsAIThinking(false)
          aiTriggeredRef.current = false
        }
      }, 500)
    }
    return () => {
      if (aiTimeoutRef.current) {
        clearTimeout(aiTimeoutRef.current)
        aiTimeoutRef.current = null
      }
    }
  }, [mode, state.currentPlayer, state.status])

  useEffect(() => {
    if (state.status === 'won') {
      if (mode === 'pve') {
        setLastEvent({ type: state.winner === 1 ? 'win' : 'lose' })
      } else if (mode === 'online') {
        setOnlineEvent({ type: onlinePlayer === state.winner ? 'win' : 'lose' })
      } else {
        setLastEvent({ type: 'win' })
      }
      if (state.winner === 1 || (mode === 'online' && onlinePlayer === state.winner) || mode === 'pvp') {
        setShowConfetti(true)
        setTimeout(() => setShowConfetti(false), 4000)
      }
      setTimeout(() => setShowGameOver(true), 1200)
    }
  }, [state.status, state.winner, mode])

  const isOnlineWaiting = mode === 'online' && onlineState.status === 'waiting'
  const isMyTurn = mode === 'online' ? onlinePlayer === state.currentPlayer : humanCurrent === state.currentPlayer
  const disabled = isAIThinking || state.status !== 'playing' || (mode === 'online' && (!isMyTurn || isOnlineWaiting))

  const onCellClick = useCallback((row: number, col: number) => {
    if (disabled) return
    handleCellClick(row, col)
  }, [disabled, handleCellClick])

  if (mode === 'online' && isOnlineWaiting) {
    return (
      <div className="flex-1 flex items-center justify-center bg-surface-container-low/30">
        <div className="text-center animate-fade-in-up">
          <div className="inline-block w-12 h-12 border-2 border-primary/30 border-t-primary rounded-full mb-4" style={{ animation: 'spin 0.8s linear infinite' }} />
          <h2 className="text-xl font-headline font-bold mb-1">Buscando oponente...</h2>
          <p className="text-sm text-on-surface-variant">Espera a que otro jugador se conecte</p>
        </div>
      </div>
    )
  }

  if (mode === 'online' && onlineState.status === 'disconnected') {
    return (
      <div className="flex-1 flex items-center justify-center px-4 bg-surface-container-low/30">
        <div className="text-center animate-fade-in-up">
          <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-error/10 border border-error/20 flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl text-error" style={{ fontVariationSettings: "'FILL' 1" }}>wifi_off</span>
          </div>
          <h2 className="text-xl font-headline font-bold mb-1">Conexión perdida</h2>
          <p className="text-sm text-on-surface-variant mb-6">No se pudo conectar al servidor</p>
          <button onClick={() => navigate({ to: '/game' })} className="btn btn-primary">
            Volver al menú
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full flex flex-col bg-surface" style={{ height: '100dvh' }}>
      {showConfetti && <Confetti isWin={state.winner === 1 || (mode === 'online' && onlinePlayer === state.winner)} />}
      <SoundManager lastEvent={onlineState.lastEvent ? onlineState.lastEvent as any : lastEvent} />

      {showGameOver && (
        <GameOverModal
          isWin={state.winner === 1 || (mode === 'online' && onlinePlayer === state.winner) || mode === 'pvp'}
          moveCount={state.moveCount}
          capturedP1={state.capturedP1}
          capturedP2={state.capturedP2}
          currentPlayer={state.currentPlayer}
          winner={state.winner}
          mode={mode}
          onPlayAgain={() => {
            setShowGameOver(false)
            resetGame()
          }}
          onBackToMenu={() => navigate({ to: '/game' })}
        />
      )}

      {/* Top Bar */}
      <header className="h-14 flex items-center justify-between px-4 md:px-6 border-b border-outline-variant/50 bg-surface shrink-0">
        <button onClick={resetGame} className="btn btn-ghost btn-sm">
          <span className="material-symbols-outlined text-lg">refresh</span>
          Reiniciar
        </button>

        <div className="flex items-center gap-2">
          <span className={`inline-block w-2 h-2 rounded-full ${
            isMyTurn && state.status === 'playing' ? 'bg-primary' : 'bg-on-surface-variant'
          }`} />
          <span className={`text-sm font-medium ${
            isAIThinking ? 'text-primary' : isMyTurn ? 'text-on-surface' : 'text-on-surface-variant'
          }`}>
            {isAIThinking ? 'IA pensando...' : isMyTurn ? 'Tu turno' : state.status === 'playing' ? 'Turno oponente' : state.status === 'won' ? (state.winner === 1 ? 'Victoria' : 'Derrota') : ''}
          </span>
          <span className="text-xs text-on-surface-variant font-mono">#{state.moveCount}</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex gap-0.5 p-0.5 bg-surface-container-low rounded-lg">
            <button onClick={() => setViewMode('3d')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                viewMode === '3d' ? 'bg-surface text-on-surface shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
              }`}>
              3D
            </button>
            <button onClick={() => setViewMode('top')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                viewMode === 'top' ? 'bg-surface text-on-surface shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
              }`}>
              Planta
            </button>
          </div>
        </div>
      </header>

      {/* AI Thinking Banner */}
      {isAIThinking && (
        <div className="px-4 py-1.5 text-center text-xs font-medium bg-primary/5 border-b border-primary/10 text-primary animate-fade-in">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary mr-2 align-middle animate-dot-pulse" />
          La IA está calculando su movimiento...
        </div>
      )}

      {/* Mandatory Capture Banner */}
      {mandatoryCapture && !isAIThinking && state.status === 'playing' && isMyTurn && (
        <div className="px-4 py-1.5 text-center text-xs font-medium bg-error/5 border-b border-error/10 text-error animate-fade-in-down">
          <span className="material-symbols-outlined text-sm align-text-bottom mr-1">gavel</span>
          ¡Captura obligada! Debes eliminar una ficha enemiga
        </div>
      )}

      <div className="flex-1 flex overflow-hidden">
        {/* 3D Canvas Area */}
        <div className="flex-1 relative flex items-center justify-center bg-surface-container-low/20">
          <Suspense fallback={<LoadingScreen />}>
            <Board3D
              board={state.board}
              currentPlayer={state.currentPlayer}
              validMoves={validMoves}
              selectedPos={selectedPos}
              onCellClick={onCellClick}
              isAIThinking={isAIThinking}
              disabled={disabled}
              viewMode={viewMode}
              boardSkinId={boardSkinId}
              pieceSkinId={pieceSkinId}
              opponentPieceSkinId={opponentPieceSkinId}
            />
          </Suspense>
        </div>

        {/* Sidebar */}
        <aside className={`flex flex-col z-20 shrink-0 overflow-y-auto border-l border-outline-variant/50 bg-surface transition-all duration-300 ${
          showSidebar ? 'w-72' : 'w-0 md:w-0 overflow-hidden'
        }`}>
          <div className="p-5 flex flex-col gap-5">
            {/* Match Info */}
            <div className="text-center pb-4 border-b border-outline-variant/30">
              <h2 className="text-base font-headline font-semibold">Partida</h2>
              <p className="text-xs text-on-surface-variant mt-0.5">
                {mode === 'pve' ? `vs IA (${difficulty === 'easy' ? 'Fácil' : difficulty === 'medium' ? 'Medio' : 'Difícil'})` : mode === 'online' ? 'Online' : 'Local'}
              </p>
            </div>

            {/* Player Avatars */}
            <div className="flex justify-between items-center">
              <div className="flex flex-col items-center gap-1.5">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${
                  isMyTurn && state.status === 'playing'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-outline-variant bg-surface-container text-on-surface-variant'
                }`}>
                  <span className="material-symbols-outlined">person</span>
                </div>
                <span className={`text-xs font-medium ${isMyTurn && state.status === 'playing' ? 'text-primary' : 'text-on-surface-variant'}`}>Tú</span>
              </div>
              <span className="text-xs text-on-surface-variant font-mono">VS</span>
              <div className="flex flex-col items-center gap-1.5">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${
                  !isMyTurn && state.status === 'playing'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-outline-variant bg-surface-container text-on-surface-variant'
                }`}>
                  <span className="material-symbols-outlined">smart_toy</span>
                </div>
                <span className={`text-xs font-medium ${!isMyTurn && state.status === 'playing' ? 'text-primary' : 'text-on-surface-variant'}`}>
                  {mode === 'pve' ? 'Bot' : mode === 'online' ? 'Online' : 'J2'}
                </span>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-2">
              <div className="card-ghost p-3 text-center">
                <span className="text-xs text-on-surface-variant font-mono uppercase tracking-wider block mb-0.5">Turno</span>
                <span className="text-lg font-headline font-bold">{state.moveCount}</span>
              </div>
              <div className="card-ghost p-3 text-center">
                <span className="text-xs text-on-surface-variant font-mono uppercase tracking-wider block mb-0.5">Jugador</span>
                <span className="text-lg font-headline font-bold">{state.currentPlayer === 1 ? 'J1' : 'J2'}</span>
              </div>
            </div>

            {/* Captures */}
            <div>
              <h3 className="text-xs font-mono uppercase tracking-wider text-on-surface-variant mb-2">Capturas</h3>
              <div className="card-ghost p-3 min-h-[44px] flex flex-wrap gap-1.5 items-center">
                {Array.from({ length: state.capturedP2 }).map((_, i) => (
                  <div key={`cap-p2-${i}`} className="w-5 h-5 rounded-full animate-scale-in"
                    style={{
                      background: 'radial-gradient(circle at 30% 30%, #d93025, #a50e0e)',
                      border: '1px solid rgba(217, 48, 37, 0.3)',
                    }} />
                ))}
                {state.capturedP2 === 0 && (
                  <span className="text-xs text-on-surface-variant">—</span>
                )}
              </div>
              <div className="card-ghost p-3 min-h-[44px] flex flex-wrap gap-1.5 items-center mt-1.5 opacity-60">
                {Array.from({ length: state.capturedP1 }).map((_, i) => (
                  <div key={`cap-p1-${i}`} className="w-5 h-5 rounded-full animate-scale-in"
                    style={{
                      background: 'radial-gradient(circle at 30% 30%, #1e8e3e, #137333)',
                      border: '1px solid rgba(30, 142, 62, 0.3)',
                    }} />
                ))}
                {state.capturedP1 === 0 && (
                  <span className="text-xs text-on-surface-variant">—</span>
                )}
              </div>
            </div>

            {/* Game Controls */}
            <nav className="mt-auto pt-4 border-t border-outline-variant/30 flex flex-col gap-1">
              <button
                onClick={() => setViewMode(viewMode === '3d' ? 'top' : '3d')}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-all"
              >
                <span className="material-symbols-outlined text-lg">{viewMode === '3d' ? '3d_rotation' : 'grid_on'}</span>
                {viewMode === '3d' ? 'Vista 3D' : 'Vista Planta'}
              </button>
              <button onClick={() => { setShowGameOver(false); resetGame() }}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-all">
                <span className="material-symbols-outlined text-lg">refresh</span>
                Nueva partida
              </button>
              <button onClick={() => navigate({ to: '/game' })}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-all">
                <span className="material-symbols-outlined text-lg">exit_to_app</span>
                Abandonar
              </button>
            </nav>
          </div>
        </aside>

        {/* Sidebar toggle */}
        <button onClick={() => setShowSidebar(s => !s)}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-1.5 bg-surface border border-outline-variant/50 rounded-l-lg text-on-surface-variant hover:text-on-surface transition-all">
          <span className="material-symbols-outlined text-lg">{showSidebar ? 'chevron_right' : 'chevron_left'}</span>
        </button>
      </div>
    </div>
  )
}
