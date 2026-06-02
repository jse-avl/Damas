const API_BASE = '/api'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  })
  const data = await res.json()
  if (!res.ok || data.error) throw new Error(data.error?.message || data.error || 'Request failed')
  return data.data
}

export const api = {
  health: () => request<{ status: string }>('/health'),

  games: {
    create: () => request<{ gameId: string }>('/games', { method: 'POST' }),
    get: (id: string) => request<any>(`/games/${id}`),
    move: (id: string, moves: any[]) =>
      request<any>(`/games/${id}/moves`, { method: 'POST', body: JSON.stringify({ moves }) }),
    list: () => request<any[]>('/games'),
    join: () => request<{ gameId: string; player: 1 | 2; opponentId: string | null }>('/games/join', { method: 'POST' }),
  },

  rankings: {
    list: (mode?: string) => request<any[]>(`/rankings${mode ? `?mode=${mode}` : ''}`),
  },

  marketplace: {
    items: () => request<any[]>('/marketplace/items'),
    buy: (itemId: string) =>
      request<any>('/marketplace/buy', { method: 'POST', body: JSON.stringify({ itemId }) }),
    inventory: () => request<any[]>('/marketplace/inventory'),
    equip: (boardId?: string, pieceId?: string) =>
      request<any>('/marketplace/equip', { method: 'POST', body: JSON.stringify({ boardId, pieceId }) }),
  },

  auth: {
    profile: () => request<any>('/auth/profile'),
  },

  payments: {
    packs: () => request<{ id: string; coins: number; price: number; label: string; description: string }[]>('/payments/packs'),
    createCheckout: (packId: string) =>
      request<{ url: string }>('/payments/create-checkout', {
        method: 'POST',
        body: JSON.stringify({ packId }),
      }),
  },

  ai: {
    move: (board: number[][], player: number, difficulty: string = 'medium') =>
      request<{ moves: any[]; board: number[][] }>(`${API_BASE}/ai/move`, {
        method: 'POST',
        body: JSON.stringify({ board, player, difficulty }),
      }),
  },
}
