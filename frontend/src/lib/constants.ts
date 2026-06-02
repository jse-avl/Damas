export const BOARD_SIZE = 6
export const CELL_SIZE = 1

export const COLORS = {
  darkSquare: '#3d2b1a',
  lightSquare: '#e8d5b7',
  highlight: 'rgba(201, 168, 76, 0.6)',
  selected: '#c9a84c',
  player1: '#c62828',
  player2: '#2e7d4f',
  player1King: '#e53935',
  player2King: '#43a047',
  background: '#0c0a08',
}

export interface Skin {
  id: string
  name: string
  price: number
  type: 'board' | 'piece'
  model?: string
  config: {
    color1?: string
    color2?: string
    metalness?: number
    roughness?: number
    emissive?: string
    emissiveIntensity?: number
    clearcoat?: number
    envMapIntensity?: number
  }
}

export const BOARD_SKINS: Record<string, Skin> = {
  classic: {
    id: '1', name: 'Clásico', price: 0, type: 'board',
    config: { color1: '#6b3a1f', color2: '#d4a46b', metalness: 0.05, roughness: 0.75 }
  },
  ebony: {
    id: '2', name: 'Ébano', price: 100, type: 'board',
    config: { color1: '#0a0a0a', color2: '#1a1a2e', metalness: 0.3, roughness: 0.25 }
  },
  gold: {
    id: '3', name: 'Dorado', price: 250, type: 'board',
    config: { color1: '#7a5a2e', color2: '#d4af37', metalness: 0.7, roughness: 0.15 }
  },
  marble: {
    id: '7', name: 'Mármol', price: 300, type: 'board',
    config: { color1: '#e8ddd3', color2: '#f5efe6', metalness: 0.15, roughness: 0.08 }
  },
  verde: {
    id: '8', name: 'Verde', price: 180, type: 'board',
    config: { color1: '#0d3b1e', color2: '#2d6b3f', metalness: 0.08, roughness: 0.65 }
  },
  travertine: {
    id: '12', name: 'Travertino', price: 350, type: 'board',
    config: { color1: '#c4a882', color2: '#e8d9c8', metalness: 0.0, roughness: 0.85 }
  },
  ocean: {
    id: '13', name: 'Oceánico', price: 400, type: 'board',
    config: { color1: '#1a3a4a', color2: '#4a8ba8', metalness: 0.2, roughness: 0.3 }
  },
  circuito: {
    id: '18', name: 'Circuito F1', price: 450, type: 'board',
    config: { color1: '#2a2a2a', color2: '#3d3d3d', metalness: 0.0, roughness: 0.9 }
  },
  lava: {
    id: '19', name: 'Volcánico', price: 500, type: 'board',
    config: { color1: '#1a0500', color2: '#d84315', metalness: 0.1, roughness: 0.6, emissive: '#ff3d00', emissiveIntensity: 0.08 }
  },
  ice: {
    id: '20', name: 'Glaciar', price: 500, type: 'board',
    config: { color1: '#0a1628', color2: '#b8d4e3', metalness: 0.4, roughness: 0.1, emissive: '#4fc3f7', emissiveIntensity: 0.05 }
  },
  cosmos: {
    id: '21', name: 'Cosmos', price: 550, type: 'board',
    config: { color1: '#0d0221', color2: '#2d1b69', metalness: 0.5, roughness: 0.2, emissive: '#7c4dff', emissiveIntensity: 0.1 }
  },
  cyberpunk: {
    id: '22', name: 'Cyberpunk', price: 600, type: 'board',
    config: { color1: '#0a0a0a', color2: '#ff00ff', metalness: 0.6, roughness: 0.15, emissive: '#00e5ff', emissiveIntensity: 0.12 }
  },
  desert: {
    id: '23', name: 'Desierto', price: 350, type: 'board',
    config: { color1: '#8b7355', color2: '#d4b896', metalness: 0.0, roughness: 0.9 }
  },
  sakura: {
    id: '24', name: 'Sakura', price: 450, type: 'board',
    config: { color1: '#2d132c', color2: '#ffb7c5', metalness: 0.05, roughness: 0.4, emissive: '#ff80ab', emissiveIntensity: 0.04 }
  },
  toxic: {
    id: '25', name: 'Tóxico', price: 500, type: 'board',
    config: { color1: '#0a1a0a', color2: '#39ff14', metalness: 0.2, roughness: 0.5, emissive: '#00e676', emissiveIntensity: 0.15 }
  },
  autumn: {
    id: '26', name: 'Otoñal', price: 400, type: 'board',
    config: { color1: '#3e1f00', color2: '#d4731a', metalness: 0.05, roughness: 0.7 }
  },
}

export const PIECE_SKINS: Record<string, Skin> = {
  standard: {
    id: '4', name: 'Clásicas', price: 0, type: 'piece',
    config: { metalness: 0.3, roughness: 0.6, emissiveIntensity: 0.15 }
  },
  emerald: {
    id: '5', name: 'Esmeralda', price: 150, type: 'piece',
    config: { metalness: 0.05, roughness: 0.1, emissiveIntensity: 0.3, clearcoat: 0.8 }
  },
  ruby: {
    id: '9', name: 'Rubí', price: 200, type: 'piece',
    config: { metalness: 0.1, roughness: 0.08, emissiveIntensity: 0.35, clearcoat: 0.9 }
  },
  crystal: {
    id: '10', name: 'Cristal', price: 250, type: 'piece',
    config: { metalness: 0.05, roughness: 0.0, emissiveIntensity: 0.4, clearcoat: 1.0 }
  },
  onyx: {
    id: '11', name: 'Ónix', price: 180, type: 'piece',
    config: { metalness: 0.7, roughness: 0.08, emissiveIntensity: 0.08, clearcoat: 0.6 }
  },
  travertine_piece: {
    id: '14', name: 'Travertino', price: 220, type: 'piece',
    config: { metalness: 0.0, roughness: 0.85, emissiveIntensity: 0.05 }
  },
  pearl: {
    id: '15', name: 'Perla', price: 300, type: 'piece',
    config: { metalness: 0.2, roughness: 0.05, emissiveIntensity: 0.3, clearcoat: 0.9 }
  },
  obsidian: {
    id: '16', name: 'Obsidiana', price: 280, type: 'piece',
    config: { metalness: 0.8, roughness: 0.05, emissiveIntensity: 0.15, clearcoat: 0.7 }
  },
  f1_car: {
    id: '17', name: 'F1', price: 350, type: 'piece',
    config: { metalness: 0.6, roughness: 0.3, emissiveIntensity: 0.1, clearcoat: 0.9 }
  },
  prisma: {
    id: '27', name: 'Prisma', price: 400, type: 'piece',
    config: { metalness: 0.9, roughness: 0.0, emissiveIntensity: 0.5, clearcoat: 1.0, envMapIntensity: 1.5 }
  },
  horse: {
    id: '28', name: 'Caballo', price: 350, type: 'piece',
    config: { metalness: 0.5, roughness: 0.4, emissiveIntensity: 0.1, clearcoat: 0.3 }
  },
  crown_model: {
    id: '29', name: 'Corona Real', price: 400, type: 'piece',
    config: { metalness: 0.8, roughness: 0.15, emissiveIntensity: 0.3, clearcoat: 0.9 }
  },
  magic_crystal: {
    id: '30', name: 'Cristal Mágico', price: 350, type: 'piece',
    config: { metalness: 0.1, roughness: 0.0, emissiveIntensity: 0.5, clearcoat: 1.0 }
  },
  shield: {
    id: '31', name: 'Escudo', price: 300, type: 'piece',
    config: { metalness: 0.6, roughness: 0.3, emissiveIntensity: 0.1, clearcoat: 0.5 }
  },
  spaceship: {
    id: '32', name: 'Nave Estelar', price: 450, type: 'piece',
    config: { metalness: 0.8, roughness: 0.1, emissiveIntensity: 0.2, clearcoat: 0.9 }
  },
  robot: {
    id: '33', name: 'Autómata', price: 400, type: 'piece',
    config: { metalness: 0.7, roughness: 0.3, emissiveIntensity: 0.15, clearcoat: 0.4 }
  },
  aventador_svj: {
    id: '34', name: 'Aventador SVJ', price: 500, type: 'piece', model: '/models/aventador_svj.glb',
    config: { metalness: 0.7, roughness: 0.2, emissiveIntensity: 0.1, clearcoat: 0.9 }
  },
  porsche_911: {
    id: '35', name: 'Porsche 911', price: 500, type: 'piece', model: '/models/porsche_911.glb',
    config: { metalness: 0.7, roughness: 0.2, emissiveIntensity: 0.1, clearcoat: 0.9 }
  },
  phoenix: {
    id: '36', name: 'Fénix', price: 500, type: 'piece', model: '/models/phoenix.glb',
    config: { metalness: 0.5, roughness: 0.3, emissiveIntensity: 0.15, clearcoat: 0.5 }
  },
}
