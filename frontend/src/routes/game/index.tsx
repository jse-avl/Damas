import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'

export interface GameSearch {
  difficulty?: string
  mode?: GameMode
  player?: 1 | 2
  boardSize?: number
}

export const Route = createFileRoute('/game/')(({
  component: GameLobby,
}))

type GameMode = 'pve' | 'pvp' | 'online'
type Difficulty = 'easy' | 'medium' | 'hard'

const MODE_OPTIONS: { id: GameMode; icon: string; label: string; desc: string; badge: string; badgeClass: string }[] = [
  { id: 'pve', icon: 'psychology', label: 'vs IA', desc: 'Desafía a la inteligencia artificial en tres niveles de dificultad.', badge: 'OFFLINE', badgeClass: 'bg-green-500/10 text-green-600 border-green-500/20' },
  { id: 'pvp', icon: 'swords', label: 'Local', desc: 'Juega contra un amigo en el mismo dispositivo. Elige tamaño de tablero.', badge: 'LOCAL', badgeClass: 'bg-orange-500/10 text-orange-600 border-orange-500/20' },
  { id: 'online', icon: 'public', label: 'Online', desc: 'Emparejamiento en tiempo real con sistema ELO. Encuentra oponentes en todo el mundo.', badge: 'ONLINE', badgeClass: 'bg-primary/10 text-primary border-primary/20' },
]

const DIFF_OPTIONS: { id: Difficulty; label: string }[] = [
  { id: 'easy', label: 'Fácil' },
  { id: 'medium', label: 'Medio' },
  { id: 'hard', label: 'Difícil' },
]

function GameLobby() {
  const navigate = useNavigate()
  const [difficulty, setDifficulty] = useState<Difficulty>('medium')
  const [mode, setMode] = useState<GameMode>('pve')
  const [boardSize, setBoardSize] = useState<number>(6)
  const [matching, setMatching] = useState(false)
  const [starting, setStarting] = useState(false)

  const startGame = () => {
    if (mode === 'online') {
      handleOnlineMatch()
    } else {
      setStarting(true)
      setTimeout(() => {
        navigate({ to: '/game/$gameId', params: { gameId: 'new' }, search: { difficulty, mode, boardSize } })
      }, 300)
    }
  }

  const handleOnlineMatch = async () => {
    if (!document.cookie.includes('__session')) {
      alert('Necesitas iniciar sesión para jugar online.')
      return
    }
    setMatching(true)
    try {
      const savedBoard = localStorage.getItem('equipped_board') || '1'
      const savedPiece = localStorage.getItem('equipped_piece') || '4'
      const res = await fetch('/api/games/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skin: { board: savedBoard, piece: savedPiece },
        }),
      })
      const json = await res.json()
      if (!res.ok || !json.success) throw new Error(json.error?.message || 'Failed')
      navigate({
        to: '/game/$gameId',
        params: { gameId: json.data.gameId },
        search: { mode: 'online', player: json.data.player },
      })
    } catch {
      setMatching(false)
    }
  }

  return (
    <div className="w-full flex-1 flex flex-col items-center px-4 sm:px-6 md:px-8 py-8 sm:py-12">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-10">
          <p className="eyebrow mb-2">SELECCIONA MODO</p>
          <h1 className="text-3xl sm:text-4xl font-headline font-bold">Elige tu modo de juego</h1>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {MODE_OPTIONS.map((option, idx) => (
            <button
              key={option.id}
              onClick={() => setMode(option.id)}
              className={`card-flat p-5 text-left cursor-pointer transition-all animate-fade-in-up stagger-${idx + 1} ${
                mode === option.id
                  ? 'border-primary ring-2 ring-primary/20'
                  : 'hover:border-primary/30'
              }`}
            >
              <div className="w-10 h-10 mb-3 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-lg text-primary">{option.icon}</span>
              </div>
              <h3 className="font-semibold text-sm mb-1">{option.label}</h3>
              <p className="text-xs text-on-surface-variant mb-3 leading-relaxed">{option.desc}</p>
              <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold font-mono uppercase tracking-wider border ${option.badgeClass}`}>
                {option.badge}
              </span>

              {option.id === 'pve' && mode === 'pve' && (
                <div className="flex gap-1.5 mt-4">
                  {DIFF_OPTIONS.map((d) => (
                    <button
                      key={d.id}
                      onClick={(e) => { e.stopPropagation(); setDifficulty(d.id) }}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                        difficulty === d.id
                          ? 'bg-primary text-on-primary border-primary'
                          : 'bg-transparent text-on-surface-variant border-outline-variant hover:border-primary/50'
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              )}

              {option.id === 'pvp' && mode === 'pvp' && (
                <div className="flex gap-1.5 mt-4">
                  {[6, 8].map((size) => (
                    <button
                      key={size}
                      onClick={(e) => { e.stopPropagation(); setBoardSize(size) }}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                        boardSize === size
                          ? 'bg-primary text-on-primary border-primary'
                          : 'bg-transparent text-on-surface-variant border-outline-variant hover:border-primary/50'
                      }`}
                    >
                      {size}x{size}
                    </button>
                  ))}
                </div>
              )}
            </button>
          ))}
        </div>

        <button
          onClick={startGame}
          disabled={starting || matching}
          className="w-full btn btn-primary btn-lg justify-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {starting || matching
            ? (matching ? 'Buscando oponente...' : 'Iniciando...')
            : 'Comenzar Juego'}
        </button>
      </div>
    </div>
  )
}
