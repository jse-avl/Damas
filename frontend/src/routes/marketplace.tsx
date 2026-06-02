import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'

export const Route = createFileRoute('/marketplace')(({
  component: MarketplacePage,
}))

type ItemType = 'board' | 'piece'

interface ShopItem {
  id: string
  name: string
  description: string
  price: number
  type: ItemType
  preview: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
}

const SHOP_ITEMS: ShopItem[] = [
  { id: '1', name: 'Clásico Nogal', description: 'Acabado madera tradicional. Clásico como el juego mismo.', price: 0, type: 'board', preview: '🎯', rarity: 'common' },
  { id: '2', name: 'Océano Nocturno', description: 'Tablero azul profundo con textura de olas. Calmado y concentrado.', price: 1200, type: 'board', preview: '🌊', rarity: 'rare' },
  { id: '3', name: 'Vacío de Ónice', description: 'Tablero casi negro con sutil contraste gris. Elegante y sigiloso.', price: 3500, type: 'board', preview: '🌑', rarity: 'epic' },
  { id: '4', name: 'Corte Dorada', description: 'Casillas de oro y marfil con brillo real. Solo para los dignos.', price: 8000, type: 'board', preview: '👑', rarity: 'legendary' },
  { id: '5', name: 'Porcelana Clásica', description: 'Piezas blancas estándar. Limpias, familiares, confiables.', price: 100, type: 'piece', preview: '⚪', rarity: 'common' },
  { id: '6', name: 'Serie Obsidiana', description: 'Piezas de vidrio volcánico negro pulido con brillo elegante.', price: 1800, type: 'piece', preview: '🪨', rarity: 'rare' },
  { id: '7', name: 'Corte Amatista', description: 'Piezas púrpura translúcidas con un sutil resplandor interior.', price: 4200, type: 'piece', preview: '💜', rarity: 'epic' },
  { id: '8', name: 'Llamarada Solar', description: 'Piezas doradas radiantes que brillan con un cálido resplandor.', price: 9500, type: 'piece', preview: '☀️', rarity: 'legendary' },
  { id: '37', name: 'Pokémon', description: 'Pikachu vs Charmander — modelo 3D low-poly. ¡Elige a tu inicial!', price: 500, type: 'piece', preview: '⚡', rarity: 'epic' },
  { id: '38', name: 'Mario', description: 'Mario vs Bowser — el fontanero y su némesis en tu tablero.', price: 500, type: 'piece', preview: '🍄', rarity: 'epic' },
  { id: '39', name: 'Zelda', description: 'Link vs Ganon — la lucha eterna de Hyrule en 3D.', price: 500, type: 'piece', preview: '⚔️', rarity: 'epic' },
  { id: '40', name: 'Autos', description: 'Muscle car vs Sport car — velocidad sobre el tablero.', price: 450, type: 'piece', preview: '🏎️', rarity: 'rare' },
  { id: '41', name: 'Espacio', description: 'Alien vs Astronauta — la conquista del cosmos.', price: 550, type: 'piece', preview: '👽', rarity: 'epic' },
  { id: '42', name: 'Fantasía', description: 'Dragón vs Mago — magia y fuego en cada movimiento.', price: 550, type: 'piece', preview: '🐉', rarity: 'epic' },
  { id: '43', name: 'Animales', description: 'Perro vs Gato — la rivalidad más tierna del tablero.', price: 400, type: 'piece', preview: '🐕', rarity: 'rare' },
  { id: '44', name: 'Comida', description: 'Pizza vs Donut — el duelo gastronómico definitivo.', price: 350, type: 'piece', preview: '🍕', rarity: 'rare' },
]

const RARITY_CONFIG: Record<string, { label: string; class: string }> = {
  common: { label: 'Common', class: 'bg-gray-500/10 text-gray-500 border-gray-500/20' },
  rare: { label: 'Rare', class: 'bg-primary/10 text-primary border-primary/20' },
  epic: { label: 'Epic', class: 'bg-purple-500/10 text-purple-500 border-purple-500/20' },
  legendary: { label: 'Legendary', class: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20' },
}

function MarketplacePage() {
  const [items] = useState<ShopItem[]>(SHOP_ITEMS)
  const [loading, setLoading] = useState(false)
  const [selectedType, setSelectedType] = useState<ItemType | 'all'>('all')
  const [inventory, setInventory] = useState<string[]>([])

  useEffect(() => {
    const saved = localStorage.getItem('owned_items')
    if (saved) setInventory(JSON.parse(saved))
  }, [])

  const filteredItems = selectedType === 'all'
    ? items
    : items.filter(item => item.type === selectedType)

  const handleBuy = async (item: ShopItem) => {
    if (inventory.includes(item.id)) {
      alert('Ya posees este artículo')
      return
    }
    setLoading(true)
    try {
      const newInventory = [...inventory, item.id]
      setInventory(newInventory)
      localStorage.setItem('owned_items', JSON.stringify(newInventory))
      alert(`¡${item.name} comprado exitosamente!`)
    } catch {
      alert('Error en la compra')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full flex-1 px-4 sm:px-6 md:px-8 py-8 sm:py-12">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <p className="eyebrow mb-2">TIENDA COSMÉTICA</p>
          <h1 className="text-3xl sm:text-4xl font-headline font-bold">Marketplace</h1>
        </div>

        {/* Balance Bar */}
        <div className="card-flat p-4 flex items-center justify-between mb-6">
          <span className="text-sm text-on-surface-variant">Tu saldo</span>
          <span className="text-xl font-headline font-bold">
            <span className="text-yellow-500">◆</span> 12,450
          </span>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-1.5 p-1 bg-surface-container-low rounded-xl w-fit mb-6">
          <button
            onClick={() => setSelectedType('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              selectedType === 'all'
                ? 'bg-surface text-on-surface shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setSelectedType('board')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              selectedType === 'board'
                ? 'bg-surface text-on-surface shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-lg">dashboard</span>
            Tableros
          </button>
          <button
            onClick={() => setSelectedType('piece')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              selectedType === 'piece'
                ? 'bg-surface text-on-surface shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-lg">circle</span>
            Piezas
          </button>
        </div>

        {/* Items Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredItems.map((item, idx) => {
            const isOwned = inventory.includes(item.id)
            const rarity = RARITY_CONFIG[item.rarity]
            return (
              <div key={item.id} className={`card-flat overflow-hidden animate-fade-in-up stagger-${(idx % 8) + 1}`}>
                {/* Preview */}
                <div className="aspect-[4/3] bg-gradient-to-br from-surface-container to-surface-container-low flex items-center justify-center text-5xl">
                  {item.preview}
                </div>

                {/* Info */}
                <div className="p-4">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold font-mono uppercase tracking-wider border mb-2 ${rarity.class}`}>
                    {rarity.label}
                  </span>
                  <h3 className="font-semibold text-sm mb-1">{item.name}</h3>
                  <p className="text-xs text-on-surface-variant mb-4 leading-relaxed">{item.description}</p>

                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm">
                      <span className="text-yellow-500">◆</span> {item.price.toLocaleString()}
                    </span>
                    <button
                      onClick={() => handleBuy(item)}
                      disabled={loading || isOwned}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        isOwned
                          ? 'bg-green-500/10 text-green-600 border border-green-500/20 cursor-default'
                          : 'btn-primary btn-sm'
                      }`}
                    >
                      {isOwned ? '✓ Propio' : 'Comprar'}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-on-surface-variant">No hay artículos disponibles</p>
          </div>
        )}
      </div>
    </div>
  )
}
