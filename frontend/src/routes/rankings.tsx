import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { api } from '../lib/api'

export const Route = createFileRoute('/rankings')(({
  component: RankingsPage,
}))

type ModeFilter = 'all' | 'pve' | 'pvp' | 'online'

const MODE_FILTERS: { id: ModeFilter; label: string; icon: string }[] = [
  { id: 'all', label: 'Todas', icon: 'menu_book' },
  { id: 'pve', label: 'vs IA', icon: 'psychology' },
  { id: 'pvp', label: 'Local', icon: 'swords' },
  { id: 'online', label: 'Online', icon: 'travel_explore' },
]

const RANK_BADGES = [
  { label: '#1', class: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20' },
  { label: '#2', class: 'bg-gray-500/10 text-gray-500 border-gray-500/20' },
  { label: '#3', class: 'bg-amber-700/10 text-amber-700 border-amber-700/20' },
]

function RankingsPage() {
  const [modeFilter, setModeFilter] = useState<ModeFilter>('all')
  const [rankings, setRankings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const modeParam = modeFilter === 'all' ? undefined : modeFilter
    api.rankings.list(modeParam)
      .then(data => {
        setRankings(data || [])
        setLoading(false)
      })
      .catch(() => {
        setRankings([])
        setLoading(false)
      })
  }, [modeFilter])

  return (
    <div className="w-full flex-1 px-4 sm:px-6 md:px-8 py-8 sm:py-12">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <p className="eyebrow mb-2">CLASIFICACIÓN GLOBAL</p>
          <h1 className="text-3xl sm:text-4xl font-headline font-bold">Rankings</h1>
        </div>

        {/* Podium */}
        {rankings.length >= 3 && (
          <div className="flex items-end gap-4 mb-10 justify-center">
            <div className="card-flat p-5 text-center order-2 border-yellow-500/30 scale-105">
              <div className="text-3xl font-headline font-bold text-yellow-500">1</div>
              <div className="w-12 h-12 rounded-full bg-yellow-500/20 border border-yellow-500/30 flex items-center justify-center mx-auto my-2 font-bold text-sm text-yellow-600">
                {rankings[0].username?.charAt(0).toUpperCase() || '?'}
              </div>
              <div className="font-semibold text-sm">{rankings[0].username}</div>
              <div className="text-xs text-on-surface-variant font-mono mt-1">{rankings[0].rating || 1000} pts</div>
            </div>
            <div className="card-flat p-5 text-center order-1">
              <div className="text-3xl font-headline font-bold text-gray-400">2</div>
              <div className="w-10 h-10 rounded-full bg-gray-500/20 border border-gray-500/20 flex items-center justify-center mx-auto my-2 font-bold text-xs text-gray-500">
                {rankings[1]?.username?.charAt(0).toUpperCase() || '?'}
              </div>
              <div className="font-semibold text-sm">{rankings[1]?.username}</div>
              <div className="text-xs text-on-surface-variant font-mono mt-1">{rankings[1]?.rating || 1000} pts</div>
            </div>
            <div className="card-flat p-5 text-center order-3">
              <div className="text-3xl font-headline font-bold text-amber-700">3</div>
              <div className="w-10 h-10 rounded-full bg-amber-700/20 border border-amber-700/20 flex items-center justify-center mx-auto my-2 font-bold text-xs text-amber-700">
                {rankings[2]?.username?.charAt(0).toUpperCase() || '?'}
              </div>
              <div className="font-semibold text-sm">{rankings[2]?.username}</div>
              <div className="text-xs text-on-surface-variant font-mono mt-1">{rankings[2]?.rating || 1000} pts</div>
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex gap-1.5 p-1 bg-surface-container-low rounded-xl w-fit mb-6">
          {MODE_FILTERS.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setModeFilter(filter.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                modeFilter === filter.id
                  ? 'bg-surface text-on-surface shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-lg">{filter.icon}</span>
              <span className="hidden sm:inline">{filter.label}</span>
            </button>
          ))}
        </div>

        {/* Rankings Table */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-on-surface-variant">Cargando rankings...</p>
          </div>
        ) : rankings.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-on-surface-variant">No hay datos disponibles</p>
          </div>
        ) : (
          <div className="card-flat overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-outline-variant/50">
                  <th className="text-left py-3 px-4 font-medium text-on-surface-variant text-xs uppercase tracking-wider font-mono">Rank</th>
                  <th className="text-left py-3 px-4 font-medium text-on-surface-variant text-xs uppercase tracking-wider font-mono">Jugador</th>
                  <th className="text-right py-3 px-4 font-medium text-on-surface-variant text-xs uppercase tracking-wider font-mono hidden sm:table-cell">Victorias</th>
                  <th className="text-right py-3 px-4 font-medium text-on-surface-variant text-xs uppercase tracking-wider font-mono">Puntos</th>
                  <th className="text-right py-3 px-4 font-medium text-on-surface-variant text-xs uppercase tracking-wider font-mono">W/L</th>
                </tr>
              </thead>
              <tbody>
                {rankings.map((entry, idx) => (
                  <tr key={idx} className="border-b border-outline-variant/20 hover:bg-surface-container-low/50 transition-colors animate-fade-in-up">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {idx < 3 ? (
                          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold font-mono border ${RANK_BADGES[idx].class}`}>
                            {RANK_BADGES[idx].label}
                          </span>
                        ) : (
                          <span className="font-mono text-on-surface-variant text-sm">#{idx + 1}</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium">{entry.username}</span>
                    </td>
                    <td className="py-3 px-4 text-right hidden sm:table-cell">
                      <span className="font-mono">{entry.wins || 0}</span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="font-mono font-semibold text-primary">{entry.rating || 1000}</span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="font-mono text-xs">
                        <span className="text-green-600">{entry.wins || 0}</span>
                        <span className="text-on-surface-variant">/</span>
                        <span className="text-red-500">{entry.losses || 0}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
