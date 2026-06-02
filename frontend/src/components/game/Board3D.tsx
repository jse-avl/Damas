import { useRef, useMemo, useCallback, useEffect } from 'react'
import { Canvas, useFrame, ThreeEvent } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera, OrthographicCamera, useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { BOARD_SKINS, PIECE_SKINS, Skin } from '../../lib/constants'

const CELL_SIZE = 1

useGLTF.preload('/models/aventador_svj.glb')
useGLTF.preload('/models/porsche_911.glb')
useGLTF.preload('/models/phoenix.glb')

interface PieceData {
  id: string
  row: number
  col: number
  player: 1 | 2
  isKing: boolean
}

interface Board3DProps {
  board: number[][]
  currentPlayer: number
  validMoves: { row: number; col: number }[]
  selectedPos: { row: number; col: number } | null
  onCellClick: (row: number, col: number) => void
  isAIThinking?: boolean
  disabled?: boolean
  viewMode?: '3d' | 'top'
  boardSkinId?: string
  pieceSkinId?: string
  opponentBoardSkinId?: string
  opponentPieceSkinId?: string
}

function darkSquare(row: number, col: number): boolean {
  return (row + col) % 2 === 1
}

function getPieces(board: number[][]): PieceData[] {
  const pieces: PieceData[] = []
  const boardSize = board.length
  for (let r = 0; r < boardSize; r++) {
    for (let c = 0; c < boardSize; c++) {
      const val = board[r]?.[c]
      if (!val) continue
      pieces.push({
        id: `${r}-${c}`,
        row: r,
        col: c,
        player: val <= 2 ? 1 : 2,
        isKing: val === 2 || val === 4,
      })
    }
  }
  return pieces
}

function createPieceProfile(height: number): THREE.Vector2[] {
  const r = 0.4
  const h = height
  return [
    new THREE.Vector2(r * 1.05, 0),
    new THREE.Vector2(r * 1.0, 0.005),
    new THREE.Vector2(r * 0.98, 0.015),
    new THREE.Vector2(r * 0.93, 0.04),
    new THREE.Vector2(r * 0.85, 0.1),
    new THREE.Vector2(r * 0.8, 0.18),
    new THREE.Vector2(r * 0.78, 0.25),
    new THREE.Vector2(r * 0.77, 0.3),
    new THREE.Vector2(r * 0.77, 0.92 * h),
    new THREE.Vector2(r * 0.75, 0.95 * h),
    new THREE.Vector2(r * 0.7, 0.98 * h),
    new THREE.Vector2(r * 0.65, 0.995 * h),
    new THREE.Vector2(r * 0.6, h),
    new THREE.Vector2(0, h),
  ]
}

function F1CarPiece({ color, isRed, isSelected, pieceHeight }: {
  color: string
  isRed: boolean
  isSelected: boolean
  pieceHeight: number
}) {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((_, delta) => {
    if (groupRef.current && isSelected) {
      groupRef.current.rotation.y += delta * 0.5
    }
  })

  const bodyMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color,
    metalness: 0.7,
    roughness: 0.2,
    clearcoat: 0.9,
    clearcoatRoughness: 0.1,
  }), [color])

  const darkMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: isRed ? '#1a1a1a' : '#222222',
    metalness: 0.3,
    roughness: 0.6,
  }), [isRed])

  const accentMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: isRed ? '#ffd700' : '#00ff88',
    metalness: 0.6,
    roughness: 0.2,
    emissive: isSelected ? '#c9a84c' : (isRed ? '#ffd700' : '#00ff88'),
    emissiveIntensity: isSelected ? 0.5 : 0.15,
  }), [isRed, isSelected])

  const wingMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: '#111111',
    metalness: 0.2,
    roughness: 0.5,
  }), [])

  const scale = pieceHeight * 0.45
  const bodyGeo = useMemo(() => new THREE.BoxGeometry(0.55 * scale, 0.08 * scale, 0.15 * scale), [scale])
  const noseGeo = useMemo(() => new THREE.ConeGeometry(0.06 * scale, 0.2 * scale, 6), [scale])
  const wingGeo = useMemo(() => new THREE.BoxGeometry(0.18 * scale, 0.01 * scale, 0.28 * scale), [scale])
  const fnWingGeo = useMemo(() => new THREE.BoxGeometry(0.1 * scale, 0.01 * scale, 0.2 * scale), [scale])
  const wheelGeo = useMemo(() => new THREE.CylinderGeometry(0.05 * scale, 0.06 * scale, 0.04 * scale, 8), [scale])
  const haloGeo = useMemo(() => new THREE.TorusGeometry(0.07 * scale, 0.008 * scale, 6, 12), [scale])

  return (
    <group ref={groupRef}>
      <group position={[0, 0, 0]}>
        {/* Main body */}
        <mesh position={[0, 0.04 * scale, 0]} geometry={bodyGeo} material={bodyMat} />

        {/* Nose cone */}
        <mesh position={[0.35 * scale, 0.04 * scale, 0]} rotation={[0, 0, -Math.PI / 2]} geometry={noseGeo} material={bodyMat} />

        {/* Rear wing */}
        <mesh position={[-0.3 * scale, 0.07 * scale, 0]} geometry={wingGeo} material={wingMat} />
        <mesh position={[-0.3 * scale, 0.05 * scale, 0]} geometry={new THREE.BoxGeometry(0.04 * scale, 0.02 * scale, 0.22 * scale)} material={accentMat} />

        {/* Front wing */}
        <mesh position={[0.3 * scale, 0.01 * scale, 0]} geometry={fnWingGeo} material={wingMat} />

        {/* Halo */}
        <mesh position={[0.02 * scale, 0.1 * scale, 0]} rotation={[Math.PI / 2, 0, 0]} geometry={haloGeo} material={darkMat} />

        {/* Wheels - rear */}
        <mesh position={[-0.2 * scale, 0.02 * scale, 0.12 * scale]} rotation={[0, 0, Math.PI / 2]} geometry={wheelGeo} material={darkMat} />
        <mesh position={[-0.2 * scale, 0.02 * scale, -0.12 * scale]} rotation={[0, 0, Math.PI / 2]} geometry={wheelGeo} material={darkMat} />

        {/* Wheels - front */}
        <mesh position={[0.2 * scale, 0.02 * scale, 0.12 * scale]} rotation={[0, 0, Math.PI / 2]} geometry={wheelGeo} material={darkMat} />
        <mesh position={[0.2 * scale, 0.02 * scale, -0.12 * scale]} rotation={[0, 0, Math.PI / 2]} geometry={wheelGeo} material={darkMat} />

        {/* Number decal */}
        <mesh position={[0.08 * scale, 0.06 * scale, 0.076 * scale]} rotation={[0, 0, 0]}>
          <planeGeometry args={[0.08 * scale, 0.04 * scale]} />
          <meshBasicMaterial color={isRed ? '#ffffff' : '#ffffff'} transparent opacity={0.8} />
        </mesh>
      </group>
    </group>
  )
}

function ImprovedF1Car({ color, isRed, isSelected, pieceHeight }: {
  color: string; isRed: boolean; isSelected: boolean; pieceHeight: number
}) {
  const groupRef = useRef<THREE.Group>(null)
  useFrame((_, delta) => {
    if (groupRef.current && isSelected) groupRef.current.rotation.y += delta * 0.5
  })
  const s = pieceHeight * 0.45
  const bodyMat = useMemo(() => new THREE.MeshPhysicalMaterial({ color, metalness: 0.7, roughness: 0.2, clearcoat: 0.9, clearcoatRoughness: 0.1 }), [color])
  const darkMat = useMemo(() => new THREE.MeshPhysicalMaterial({ color: isRed ? '#1a1a1a' : '#222222', metalness: 0.3, roughness: 0.6 }), [isRed])
  const accentMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: isRed ? '#ffd700' : '#00ff88', metalness: 0.6, roughness: 0.2,
    emissive: isSelected ? '#c9a84c' : (isRed ? '#ffd700' : '#00ff88'), emissiveIntensity: isSelected ? 0.5 : 0.15,
  }), [isRed, isSelected])
  const wingMat = useMemo(() => new THREE.MeshPhysicalMaterial({ color: '#111111', metalness: 0.2, roughness: 0.5 }), [])
  return (
    <group ref={groupRef}>
      {/* Main chassis */}
      <mesh position={[0, 0.04 * s, 0]}><boxGeometry args={[0.65 * s, 0.07 * s, 0.16 * s]} /><meshPhysicalMaterial {...bodyMat} /></mesh>
      {/* Nose cone */}
      <mesh position={[0.42 * s, 0.035 * s, 0]} rotation={[0, 0, -Math.PI / 2]}><coneGeometry args={[0.05 * s, 0.2 * s, 8]} /><meshPhysicalMaterial {...bodyMat} /></mesh>
      {/* Cockpit opening */}
      <mesh position={[0.06 * s, 0.075 * s, 0]}><boxGeometry args={[0.12 * s, 0.015 * s, 0.07 * s]} /><meshPhysicalMaterial {...darkMat} /></mesh>
      {/* Sidepods */}
      <mesh position={[-0.06 * s, 0.025 * s, 0.15 * s]}><boxGeometry args={[0.3 * s, 0.035 * s, 0.05 * s]} /><meshPhysicalMaterial {...bodyMat} /></mesh>
      <mesh position={[-0.06 * s, 0.025 * s, -0.15 * s]}><boxGeometry args={[0.3 * s, 0.035 * s, 0.05 * s]} /><meshPhysicalMaterial {...bodyMat} /></mesh>
      {/* Rear wing */}
      <mesh position={[-0.36 * s, 0.09 * s, 0]}><boxGeometry args={[0.03 * s, 0.07 * s, 0.24 * s]} /><meshPhysicalMaterial {...wingMat} /></mesh>
      <mesh position={[-0.36 * s, 0.09 * s, 0.13 * s]}><boxGeometry args={[0.03 * s, 0.07 * s, 0.015 * s]} /><meshPhysicalMaterial {...accentMat} /></mesh>
      <mesh position={[-0.36 * s, 0.09 * s, -0.13 * s]}><boxGeometry args={[0.03 * s, 0.07 * s, 0.015 * s]} /><meshPhysicalMaterial {...accentMat} /></mesh>
      {/* Front wing */}
      <mesh position={[0.35 * s, 0.01 * s, 0]}><boxGeometry args={[0.04 * s, 0.01 * s, 0.22 * s]} /><meshPhysicalMaterial {...wingMat} /></mesh>
      <mesh position={[0.35 * s, 0.015 * s, 0.12 * s]}><boxGeometry args={[0.04 * s, 0.02 * s, 0.01 * s]} /><meshPhysicalMaterial {...accentMat} /></mesh>
      <mesh position={[0.35 * s, 0.015 * s, -0.12 * s]}><boxGeometry args={[0.04 * s, 0.02 * s, 0.01 * s]} /><meshPhysicalMaterial {...accentMat} /></mesh>
      {/* Rear diffuser */}
      <mesh position={[-0.35 * s, 0.01 * s, 0]}><boxGeometry args={[0.04 * s, 0.02 * s, 0.12 * s]} /><meshPhysicalMaterial {...darkMat} /></mesh>
      {/* Halo */}
      <mesh position={[0.02 * s, 0.1 * s, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.07 * s, 0.008 * s, 8, 16]} /><meshPhysicalMaterial {...darkMat} /></mesh>
      {/* Rear wheels */}
      <mesh position={[-0.22 * s, 0.015 * s, 0.13 * s]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.045 * s, 0.055 * s, 0.035 * s, 8]} /><meshPhysicalMaterial {...darkMat} /></mesh>
      <mesh position={[-0.22 * s, 0.015 * s, -0.13 * s]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.045 * s, 0.055 * s, 0.035 * s, 8]} /><meshPhysicalMaterial {...darkMat} /></mesh>
      {/* Front wheels */}
      <mesh position={[0.22 * s, 0.015 * s, 0.13 * s]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.04 * s, 0.05 * s, 0.03 * s, 8]} /><meshPhysicalMaterial {...darkMat} /></mesh>
      <mesh position={[0.22 * s, 0.015 * s, -0.13 * s]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.04 * s, 0.05 * s, 0.03 * s, 8]} /><meshPhysicalMaterial {...darkMat} /></mesh>
      {/* Front hubs */}
      <mesh position={[0.22 * s, 0.015 * s, 0.13 * s]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.015 * s, 0.015 * s, 0.032 * s, 6]} /><meshPhysicalMaterial {...accentMat} /></mesh>
      <mesh position={[0.22 * s, 0.015 * s, -0.13 * s]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.015 * s, 0.015 * s, 0.032 * s, 6]} /><meshPhysicalMaterial {...accentMat} /></mesh>
      {/* Rear hubs */}
      <mesh position={[-0.22 * s, 0.015 * s, 0.13 * s]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.015 * s, 0.015 * s, 0.037 * s, 6]} /><meshPhysicalMaterial {...accentMat} /></mesh>
      <mesh position={[-0.22 * s, 0.015 * s, -0.13 * s]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.015 * s, 0.015 * s, 0.037 * s, 6]} /><meshPhysicalMaterial {...accentMat} /></mesh>
      {/* Air intake */}
      <mesh position={[-0.12 * s, 0.075 * s, 0]}><boxGeometry args={[0.16 * s, 0.025 * s, 0.055 * s]} /><meshPhysicalMaterial {...darkMat} /></mesh>
    </group>
  )
}

function HorsePiece({ color, isRed, isSelected, pieceHeight }: {
  color: string; isRed: boolean; isSelected: boolean; pieceHeight: number
}) {
  const groupRef = useRef<THREE.Group>(null)
  useFrame((_, delta) => {
    if (groupRef.current && isSelected) groupRef.current.rotation.y += delta * 0.5
  })
  const s = pieceHeight * 0.5
  const bodyMat = useMemo(() => new THREE.MeshPhysicalMaterial({ color, metalness: 0.5, roughness: 0.4, emissive: isSelected ? '#c9a84c' : color, emissiveIntensity: isSelected ? 0.3 : 0.05 }), [color, isSelected])
  const darkMat = useMemo(() => new THREE.MeshPhysicalMaterial({ color: isRed ? '#1a0a0a' : '#0a1a0a', metalness: 0.3, roughness: 0.6 }), [isRed])
  const maneMat = useMemo(() => new THREE.MeshPhysicalMaterial({ color: isRed ? '#4a0e0e' : '#0d3018', metalness: 0.1, roughness: 0.8 }), [isRed])
  return (
    <group ref={groupRef}>
      {/* Body */}
      <mesh position={[0, 0.1 * s, 0]}><boxGeometry args={[0.2 * s, 0.12 * s, 0.1 * s]} /><meshPhysicalMaterial {...bodyMat} /></mesh>
      {/* Neck */}
      <mesh position={[0.15 * s, 0.18 * s, 0]} rotation={[0, 0, -0.3]}><coneGeometry args={[0.04 * s, 0.12 * s, 6]} /><meshPhysicalMaterial {...bodyMat} /></mesh>
      {/* Head */}
      <mesh position={[0.22 * s, 0.2 * s, 0]}><boxGeometry args={[0.06 * s, 0.04 * s, 0.04 * s]} /><meshPhysicalMaterial {...bodyMat} /></mesh>
      {/* Mane */}
      <mesh position={[0.12 * s, 0.2 * s, 0]}><boxGeometry args={[0.035 * s, 0.055 * s, 0.02 * s]} /><meshPhysicalMaterial {...maneMat} /></mesh>
      {/* Tail */}
      <mesh position={[-0.15 * s, 0.12 * s, 0]}><cylinderGeometry args={[0.01 * s, 0.025 * s, 0.07 * s, 4]} /><meshPhysicalMaterial {...maneMat} /></mesh>
      {/* Legs */}
      {[[-0.08, -0.04], [-0.08, 0.04], [0.08, -0.04], [0.08, 0.04]].map(([dx, dz], i) => (
        <mesh key={i} position={[dx * s, -0.04 * s, dz * s]}><cylinderGeometry args={[0.015 * s, 0.02 * s, 0.08 * s, 6]} /><meshPhysicalMaterial {...darkMat} /></mesh>
      ))}
      {/* Base */}
      <mesh position={[0, -0.08 * s, 0]}><cylinderGeometry args={[0.1 * s, 0.12 * s, 0.02 * s, 8]} /><meshPhysicalMaterial {...darkMat} metalness={0.2} roughness={0.7} /></mesh>
    </group>
  )
}

function CrownPiece({ color, isRed, isSelected, pieceHeight }: {
  color: string; isRed: boolean; isSelected: boolean; pieceHeight: number
}) {
  const groupRef = useRef<THREE.Group>(null)
  useFrame((_, delta) => {
    if (groupRef.current && isSelected) groupRef.current.rotation.y += delta * 0.4
  })
  const s = pieceHeight * 0.5
  const goldMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: '#c9a84c', metalness: 0.8, roughness: 0.15,
    emissive: isSelected ? '#c9a84c' : '#8a6a20', emissiveIntensity: isSelected ? 0.5 : 0.2,
  }), [isSelected])
  const jewelMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: isRed ? '#ff0040' : '#0088ff', metalness: 0.1, roughness: 0.05,
    emissive: isRed ? '#ff0040' : '#0088ff', emissiveIntensity: 0.5,
  }), [isRed])
  const redMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: isRed ? '#8a1a1a' : '#1a3a5a', metalness: 0.3, roughness: 0.4,
  }), [isRed])
  return (
    <group ref={groupRef}>
      {/* Crown base band */}
      <mesh position={[0, 0.03 * s, 0]}><cylinderGeometry args={[0.14 * s, 0.16 * s, 0.04 * s, 12]} /><meshPhysicalMaterial {...redMat} /></mesh>
      {/* Decorative torus ring */}
      <mesh position={[0, 0.05 * s, 0]}><torusGeometry args={[0.14 * s, 0.02 * s, 8, 16]} /><meshPhysicalMaterial {...goldMat} /></mesh>
      {/* Spikes */}
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh key={i} position={[
          Math.cos((i / 5) * Math.PI * 2) * 0.13 * s,
          0.09 * s,
          Math.sin((i / 5) * Math.PI * 2) * 0.13 * s,
        ]} rotation={[0, 0, 0]}>
          <coneGeometry args={[0.015 * s, 0.06 * s, 6]} />
          <meshPhysicalMaterial {...goldMat} />
        </mesh>
      ))}
      {/* Jewels on spike tips */}
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh key={`j${i}`} position={[
          Math.cos((i / 5) * Math.PI * 2) * 0.13 * s,
          0.12 * s,
          Math.sin((i / 5) * Math.PI * 2) * 0.13 * s,
        ]}>
          <sphereGeometry args={[0.012 * s, 6, 6]} />
          <meshPhysicalMaterial {...jewelMat} />
        </mesh>
      ))}
      {/* Center jewel */}
      <mesh position={[0, 0.07 * s, 0]}><sphereGeometry args={[0.02 * s, 8, 8]} /><meshPhysicalMaterial {...jewelMat} emissiveIntensity={0.7} /></mesh>
      {/* Base platform */}
      <mesh position={[0, -0.01 * s, 0]}><cylinderGeometry args={[0.12 * s, 0.14 * s, 0.02 * s, 8]} /><meshPhysicalMaterial {...goldMat} metalness={0.6} roughness={0.3} /></mesh>
    </group>
  )
}

function CrystalPiece({ color, isRed, isSelected, pieceHeight }: {
  color: string; isRed: boolean; isSelected: boolean; pieceHeight: number
}) {
  const groupRef = useRef<THREE.Group>(null)
  useFrame((_, delta) => {
    if (groupRef.current && isSelected) {
      groupRef.current.rotation.y += delta * 0.6
      groupRef.current.rotation.x = Math.sin(Date.now() * 0.001) * 0.05
    }
  })
  const s = pieceHeight * 0.5
  const crystalMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color, metalness: 0.05, roughness: 0.0, clearcoat: 1.0, clearcoatRoughness: 0.0,
    emissive: isSelected ? '#c9a84c' : (isRed ? '#ff4466' : '#66ccff'),
    emissiveIntensity: isSelected ? 0.6 : 0.3, transparent: true, opacity: 0.85,
  }), [color, isSelected, isRed])
  const glowMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: isRed ? '#ff4466' : '#66ccff', emissive: isRed ? '#ff4466' : '#66ccff',
    emissiveIntensity: 0.8, transparent: true, opacity: 0.3,
  }), [isRed])
  return (
    <group ref={groupRef}>
      {/* Main crystal - dual octahedra */}
      <mesh position={[0, 0.06 * s, 0]} rotation={[0.2, 0.5, 0.1]}>
        <octahedronGeometry args={[0.12 * s, 0]} />
        <meshPhysicalMaterial {...crystalMat} />
      </mesh>
      <mesh position={[0, 0.06 * s, 0]} rotation={[-0.3, 0.8, -0.2]}>
        <octahedronGeometry args={[0.09 * s, 0]} />
        <meshPhysicalMaterial {...crystalMat} emissiveIntensity={0.5} opacity={0.6} />
      </mesh>
      {/* Glow aura */}
      <mesh position={[0, 0.06 * s, 0]}>
        <sphereGeometry args={[0.1 * s, 8, 8]} />
        <meshPhysicalMaterial {...glowMat} />
      </mesh>
      {/* Base */}
      <mesh position={[0, -0.01 * s, 0]}><cylinderGeometry args={[0.08 * s, 0.1 * s, 0.02 * s, 6]} /><meshPhysicalMaterial color="#222" metalness={0.3} roughness={0.5} /></mesh>
    </group>
  )
}

function ShieldPiece({ color, isRed, isSelected, pieceHeight }: {
  color: string; isRed: boolean; isSelected: boolean; pieceHeight: number
}) {
  const groupRef = useRef<THREE.Group>(null)
  useFrame((_, delta) => {
    if (groupRef.current && isSelected) groupRef.current.rotation.y += delta * 0.5
  })
  const s = pieceHeight * 0.52
  const metalMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color, metalness: 0.6, roughness: 0.3,
    emissive: isSelected ? '#c9a84c' : color, emissiveIntensity: isSelected ? 0.3 : 0.05,
  }), [color, isSelected])
  const crestMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: '#c9a84c', metalness: 0.7, roughness: 0.2,
    emissive: '#c9a84c', emissiveIntensity: isSelected ? 0.4 : 0.1,
  }), [isSelected])
  const borderMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: isRed ? '#8a6a20' : '#6a8a40', metalness: 0.5, roughness: 0.4,
  }), [isRed])
  const darkMat = useMemo(() => new THREE.MeshPhysicalMaterial({ color: isRed ? '#2a1a0a' : '#0a1a2a', metalness: 0.2, roughness: 0.7 }), [isRed])
  return (
    <group ref={groupRef}>
      {/* Shield body */}
      <mesh position={[0, 0.08 * s, 0]}><boxGeometry args={[0.16 * s, 0.2 * s, 0.04 * s]} /><meshPhysicalMaterial {...metalMat} /></mesh>
      {/* Shield border */}
      <mesh position={[0, 0.08 * s, 0.025 * s]}><boxGeometry args={[0.17 * s, 0.21 * s, 0.01 * s]} /><meshPhysicalMaterial {...borderMat} /></mesh>
      {/* Crest / emblem */}
      <mesh position={[0, 0.1 * s, 0.03 * s]}><boxGeometry args={[0.08 * s, 0.06 * s, 0.008 * s]} /><meshPhysicalMaterial {...crestMat} /></mesh>
      {/* Center gem */}
      <mesh position={[0, 0.08 * s, 0.035 * s]}><sphereGeometry args={[0.015 * s, 6, 6]} /><meshPhysicalMaterial color={isRed ? '#ff0040' : '#0088ff'} metalness={0.1} roughness={0.1} emissive={isRed ? '#ff0040' : '#0088ff'} emissiveIntensity={0.5} /></mesh>
      {/* Cross pattern on shield */}
      <mesh position={[0, 0.06 * s, 0.03 * s]}><boxGeometry args={[0.04 * s, 0.01 * s, 0.006 * s]} /><meshPhysicalMaterial {...crestMat} emissiveIntensity={0.2} /></mesh>
      <mesh position={[0, 0.08 * s, 0.03 * s]}><boxGeometry args={[0.01 * s, 0.05 * s, 0.006 * s]} /><meshPhysicalMaterial {...crestMat} emissiveIntensity={0.2} /></mesh>
      {/* Base */}
      <mesh position={[0, -0.02 * s, 0]}><cylinderGeometry args={[0.1 * s, 0.12 * s, 0.02 * s, 8]} /><meshPhysicalMaterial {...darkMat} /></mesh>
    </group>
  )
}

function SpaceshipPiece({ color, isRed, isSelected, pieceHeight }: {
  color: string; isRed: boolean; isSelected: boolean; pieceHeight: number
}) {
  const groupRef = useRef<THREE.Group>(null)
  useFrame((_, delta) => {
    if (groupRef.current) {
      if (isSelected) groupRef.current.rotation.y += delta * 0.7
      groupRef.current.position.y = Math.sin(Date.now() * 0.002) * 0.02 * pieceHeight
    }
  })
  const s = pieceHeight * 0.48
  const hullMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color, metalness: 0.8, roughness: 0.1, clearcoat: 0.9,
    emissive: isSelected ? '#c9a84c' : color, emissiveIntensity: isSelected ? 0.4 : 0.05,
  }), [color, isSelected])
  const wingMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: isRed ? '#884422' : '#224488', metalness: 0.5, roughness: 0.4,
  }), [isRed])
  const cockpitMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: '#00ccff', metalness: 0.2, roughness: 0.0, clearcoat: 1.0,
    emissive: '#00ccff', emissiveIntensity: 0.3, transparent: true, opacity: 0.7,
  }), [])
  const engineMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: isRed ? '#ff4400' : '#4488ff', emissive: isRed ? '#ff4400' : '#4488ff',
    emissiveIntensity: 0.6, metalness: 0.3, roughness: 0.3,
  }), [isRed])
  return (
    <group ref={groupRef}>
      {/* Fuselage */}
      <mesh position={[0, 0.04 * s, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.06 * s, 0.22 * s, 8]} />
        <meshPhysicalMaterial {...hullMat} />
      </mesh>
      {/* Wings */}
      <mesh position={[-0.04 * s, 0, 0.12 * s]} rotation={[0, 0, -0.1]}><boxGeometry args={[0.1 * s, 0.005 * s, 0.1 * s]} /><meshPhysicalMaterial {...wingMat} /></mesh>
      <mesh position={[-0.04 * s, 0, -0.12 * s]} rotation={[0, 0, -0.1]}><boxGeometry args={[0.1 * s, 0.005 * s, 0.1 * s]} /><meshPhysicalMaterial {...wingMat} /></mesh>
      {/* Wing tips accent */}
      <mesh position={[-0.09 * s, 0, 0.17 * s]}><boxGeometry args={[0.04 * s, 0.003 * s, 0.02 * s]} /><meshPhysicalMaterial color={isRed ? '#ff6a00' : '#00aaff'} emissive={isRed ? '#ff6a00' : '#00aaff'} emissiveIntensity={0.4} /></mesh>
      <mesh position={[-0.09 * s, 0, -0.17 * s]}><boxGeometry args={[0.04 * s, 0.003 * s, 0.02 * s]} /><meshPhysicalMaterial color={isRed ? '#ff6a00' : '#00aaff'} emissive={isRed ? '#ff6a00' : '#00aaff'} emissiveIntensity={0.4} /></mesh>
      {/* Cockpit */}
      <mesh position={[0.1 * s, 0.06 * s, 0]}><sphereGeometry args={[0.025 * s, 8, 8]} /><meshPhysicalMaterial {...cockpitMat} /></mesh>
      {/* Engine */}
      <mesh position={[-0.14 * s, 0.03 * s, 0]}><cylinderGeometry args={[0.02 * s, 0.03 * s, 0.04 * s, 6]} /><meshPhysicalMaterial {...engineMat} /></mesh>
      {/* Engine glow */}
      <mesh position={[-0.16 * s, 0.03 * s, 0]}><sphereGeometry args={[0.015 * s, 6, 6]} /><meshPhysicalMaterial color="#ffffff" emissive={isRed ? '#ff4400' : '#4488ff'} emissiveIntensity={1.0} transparent opacity={0.6} /></mesh>
      {/* Base */}
      <mesh position={[0, -0.02 * s, 0]}><cylinderGeometry args={[0.08 * s, 0.1 * s, 0.015 * s, 8]} /><meshPhysicalMaterial color="#222" metalness={0.3} roughness={0.5} /></mesh>
    </group>
  )
}

function RobotPiece({ color, isRed, isSelected, pieceHeight }: {
  color: string; isRed: boolean; isSelected: boolean; pieceHeight: number
}) {
  const groupRef = useRef<THREE.Group>(null)
  useFrame((_, delta) => {
    if (groupRef.current && isSelected) {
      groupRef.current.rotation.y += delta * 0.5
      groupRef.current.position.y = Math.sin(Date.now() * 0.003) * 0.01
    }
  })
  const s = pieceHeight * 0.52
  const bodyMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color, metalness: 0.7, roughness: 0.3,
    emissive: isSelected ? '#c9a84c' : color, emissiveIntensity: isSelected ? 0.3 : 0.05,
  }), [color, isSelected])
  const darkMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: isRed ? '#1a1a1a' : '#2a2a2a', metalness: 0.6, roughness: 0.3,
  }), [isRed])
  const eyeMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: isRed ? '#ff4400' : '#00e5ff',
    emissive: isRed ? '#ff4400' : '#00e5ff',
    emissiveIntensity: 0.8, metalness: 0.1, roughness: 0.1,
  }), [isRed])
  const antennaMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: '#ff0040', emissive: '#ff0040', emissiveIntensity: 0.6,
  }), [])
  return (
    <group ref={groupRef}>
      {/* Head */}
      <mesh position={[0, 0.08 * s, 0]}><boxGeometry args={[0.14 * s, 0.14 * s, 0.12 * s]} /><meshPhysicalMaterial {...bodyMat} /></mesh>
      {/* Face plate */}
      <mesh position={[0, 0.08 * s, 0.065 * s]}><boxGeometry args={[0.1 * s, 0.08 * s, 0.01 * s]} /><meshPhysicalMaterial {...darkMat} /></mesh>
      {/* Eyes */}
      <mesh position={[-0.03 * s, 0.1 * s, 0.07 * s]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.015 * s, 0.015 * s, 0.015 * s, 8]} /><meshPhysicalMaterial {...eyeMat} /></mesh>
      <mesh position={[0.03 * s, 0.1 * s, 0.07 * s]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.015 * s, 0.015 * s, 0.015 * s, 8]} /><meshPhysicalMaterial {...eyeMat} /></mesh>
      {/* Mouth / grill */}
      <mesh position={[0, 0.04 * s, 0.07 * s]}><boxGeometry args={[0.05 * s, 0.01 * s, 0.005 * s]} /><meshPhysicalMaterial {...darkMat} metalness={0.8} roughness={0.1} /></mesh>
      {/* Antenna */}
      <mesh position={[0, 0.16 * s, 0]}><cylinderGeometry args={[0.004 * s, 0.004 * s, 0.04 * s, 4]} /><meshPhysicalMaterial color="#888" metalness={0.5} roughness={0.4} /></mesh>
      <mesh position={[0, 0.18 * s, 0]}><sphereGeometry args={[0.01 * s, 6, 6]} /><meshPhysicalMaterial {...antennaMat} /></mesh>
      {/* Ear panels */}
      <mesh position={[-0.08 * s, 0.08 * s, 0]}><boxGeometry args={[0.015 * s, 0.04 * s, 0.04 * s]} /><meshPhysicalMaterial {...darkMat} /></mesh>
      <mesh position={[0.08 * s, 0.08 * s, 0]}><boxGeometry args={[0.015 * s, 0.04 * s, 0.04 * s]} /><meshPhysicalMaterial {...darkMat} /></mesh>
      {/* Base */}
      <mesh position={[0, -0.01 * s, 0]}><cylinderGeometry args={[0.1 * s, 0.12 * s, 0.02 * s, 8]} /><meshPhysicalMaterial {...darkMat} /></mesh>
    </group>
  )
}

function PikachuCharmanderPiece({ color, isRed, isSelected, pieceHeight }: {
  color: string; isRed: boolean; isSelected: boolean; pieceHeight: number
}) {
  const groupRef = useRef<THREE.Group>(null)
  useFrame((_, delta) => {
    if (groupRef.current && isSelected) groupRef.current.rotation.y += delta * 0.5
  })
  const s = pieceHeight * 0.5
  const bodyMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: isRed ? '#ffde21' : '#f57c00', metalness: 0.2, roughness: 0.5,
    emissive: isSelected ? '#c9a84c' : (isRed ? '#ffde21' : '#f57c00'), emissiveIntensity: isSelected ? 0.4 : 0.05,
  }), [isRed, isSelected])
  const darkMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: isRed ? '#8a6a20' : '#6a4040', metalness: 0.3, roughness: 0.6,
  }), [isRed])
  const earMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: isRed ? '#ffde21' : '#f57c00', metalness: 0.1, roughness: 0.6,
  }), [isRed])
  const eyeMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: '#222', metalness: 0.1, roughness: 0.3,
  }), [])
  const cheekMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: '#ff4466', metalness: 0.1, roughness: 0.3,
    emissive: '#ff4466', emissiveIntensity: 0.2,
  }), [])
  return (
    <group ref={groupRef}>
      {/* Body */}
      <mesh position={[0, 0.06 * s, 0]}><sphereGeometry args={[0.1 * s, 12, 12]} /><meshPhysicalMaterial {...bodyMat} /></mesh>
      {/* Ears */}
      <mesh position={[-0.07 * s, 0.15 * s, 0]} rotation={[0, 0, -0.3]}><coneGeometry args={[0.02 * s, 0.07 * s, 6]} /><meshPhysicalMaterial {...earMat} /></mesh>
      <mesh position={[0.07 * s, 0.15 * s, 0]} rotation={[0, 0, 0.3]}><coneGeometry args={[0.02 * s, 0.07 * s, 6]} /><meshPhysicalMaterial {...earMat} /></mesh>
      {/* Ear tips */}
      <mesh position={[-0.07 * s, 0.19 * s, 0]}><sphereGeometry args={[0.008 * s, 6, 6]} /><meshPhysicalMaterial color="#222" metalness={0.1} roughness={0.5} /></mesh>
      <mesh position={[0.07 * s, 0.19 * s, 0]}><sphereGeometry args={[0.008 * s, 6, 6]} /><meshPhysicalMaterial color="#222" metalness={0.1} roughness={0.5} /></mesh>
      {/* Eyes */}
      <mesh position={[-0.04 * s, 0.08 * s, 0.09 * s]}><sphereGeometry args={[0.015 * s, 8, 8]} /><meshPhysicalMaterial {...eyeMat} /></mesh>
      <mesh position={[0.04 * s, 0.08 * s, 0.09 * s]}><sphereGeometry args={[0.015 * s, 8, 8]} /><meshPhysicalMaterial {...eyeMat} /></mesh>
      {/* Eye highlights */}
      <mesh position={[-0.035 * s, 0.09 * s, 0.1 * s]}><sphereGeometry args={[0.005 * s, 6, 6]} /><meshBasicMaterial color="#fff" /></mesh>
      <mesh position={[0.045 * s, 0.09 * s, 0.1 * s]}><sphereGeometry args={[0.005 * s, 6, 6]} /><meshBasicMaterial color="#fff" /></mesh>
      {/* Cheeks */}
      <mesh position={[-0.06 * s, 0.04 * s, 0.09 * s]}><sphereGeometry args={[0.012 * s, 8, 8]} /><meshPhysicalMaterial {...cheekMat} /></mesh>
      <mesh position={[0.06 * s, 0.04 * s, 0.09 * s]}><sphereGeometry args={[0.012 * s, 8, 8]} /><meshPhysicalMaterial {...cheekMat} /></mesh>
      {/* Nose */}
      <mesh position={[0, 0.06 * s, 0.1 * s]}><sphereGeometry args={[0.006 * s, 6, 6]} /><meshPhysicalMaterial color="#222" metalness={0.1} roughness={0.3} /></mesh>
      {/* Mouth */}
      <mesh position={[0, 0.035 * s, 0.1 * s]}><boxGeometry args={[0.02 * s, 0.004 * s, 0.004 * s]} /><meshPhysicalMaterial color="#222" metalness={0.1} roughness={0.3} /></mesh>
      {/* Tail (Charmander) */}
      {!isRed && <mesh position={[-0.12 * s, 0.02 * s, 0]} rotation={[0, 0, 0.5]}><coneGeometry args={[0.015 * s, 0.08 * s, 6]} /><meshPhysicalMaterial {...bodyMat} /></mesh>}
      {!isRed && <mesh position={[-0.16 * s, 0.06 * s, 0]}><sphereGeometry args={[0.012 * s, 6, 6]} /><meshPhysicalMaterial color="#ff6600" emissive="#ff4400" emissiveIntensity={0.5} metalness={0.1} roughness={0.5} /></mesh>}
      {/* Base */}
      <mesh position={[0, -0.02 * s, 0]}><cylinderGeometry args={[0.08 * s, 0.1 * s, 0.02 * s, 8]} /><meshPhysicalMaterial {...darkMat} /></mesh>
    </group>
  )
}

function MarioBowserPiece({ color, isRed, isSelected, pieceHeight }: {
  color: string; isRed: boolean; isSelected: boolean; pieceHeight: number
}) {
  const groupRef = useRef<THREE.Group>(null)
  useFrame((_, delta) => {
    if (groupRef.current && isSelected) groupRef.current.rotation.y += delta * 0.5
  })
  const s = pieceHeight * 0.5
  const bodyMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: isRed ? '#e53935' : '#2e7d32', metalness: 0.3, roughness: 0.5,
    emissive: isSelected ? '#c9a84c' : (isRed ? '#e53935' : '#2e7d32'), emissiveIntensity: isSelected ? 0.3 : 0.05,
  }), [isRed, isSelected])
  const skinMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: '#ffcc80', metalness: 0.1, roughness: 0.6,
  }), [])
  return (
    <group ref={groupRef}>
      {isRed ? (
        <>
          {/* Mario body */}
          <mesh position={[0, 0.04 * s, 0]}><boxGeometry args={[0.16 * s, 0.12 * s, 0.1 * s]} /><meshPhysicalMaterial {...bodyMat} /></mesh>
          {/* Head */}
          <mesh position={[0, 0.14 * s, 0]}><sphereGeometry args={[0.08 * s, 12, 12]} /><meshPhysicalMaterial {...skinMat} /></mesh>
          {/* Cap */}
          <mesh position={[0, 0.19 * s, 0]}><sphereGeometry args={[0.07 * s, 12, 12]} /><meshPhysicalMaterial color="#e53935" metalness={0.2} roughness={0.5} /></mesh>
          {/* Cap brim */}
          <mesh position={[0, 0.16 * s, 0.06 * s]}><boxGeometry args={[0.1 * s, 0.015 * s, 0.03 * s]} /><meshPhysicalMaterial color="#e53935" metalness={0.2} roughness={0.5} /></mesh>
          {/* M */}
          <mesh position={[0, 0.2 * s, 0.07 * s]}><boxGeometry args={[0.04 * s, 0.03 * s, 0.005 * s]} /><meshPhysicalMaterial color="#fff" metalness={0.1} roughness={0.3} /></mesh>
          {/* Eyes */}
          <mesh position={[-0.025 * s, 0.15 * s, 0.075 * s]}><sphereGeometry args={[0.01 * s, 6, 6]} /><meshBasicMaterial color="#222" /></mesh>
          <mesh position={[0.025 * s, 0.15 * s, 0.075 * s]}><sphereGeometry args={[0.01 * s, 6, 6]} /><meshBasicMaterial color="#222" /></mesh>
          {/* Mustache */}
          <mesh position={[0, 0.13 * s, 0.075 * s]}><boxGeometry args={[0.05 * s, 0.006 * s, 0.005 * s]} /><meshPhysicalMaterial color="#3e2723" metalness={0.1} roughness={0.7} /></mesh>
          {/* Overalls */}
          <mesh position={[0, 0.01 * s, 0]}><boxGeometry args={[0.12 * s, 0.06 * s, 0.08 * s]} /><meshPhysicalMaterial color="#1565c0" metalness={0.2} roughness={0.5} /></mesh>
        </>
      ) : (
        <>
          {/* Bowser shell body */}
          <mesh position={[0, 0.06 * s, 0]}><sphereGeometry args={[0.12 * s, 12, 12]} /><meshPhysicalMaterial {...bodyMat} /></mesh>
          {/* Spikes on shell */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
            <mesh key={deg} position={[
              Math.cos(deg * Math.PI / 180) * 0.1 * s,
              0.12 * s + Math.sin(deg * Math.PI / 180) * 0.02 * s,
              Math.sin(deg * Math.PI / 180) * 0.1 * s,
            ]}>
              <coneGeometry args={[0.01 * s, 0.04 * s, 4]} />
              <meshPhysicalMaterial color="#ffd54f" metalness={0.4} roughness={0.3} />
            </mesh>
          ))}
          {/* Head */}
          <mesh position={[0.12 * s, 0.02 * s, 0]}><sphereGeometry args={[0.06 * s, 12, 12]} /><meshPhysicalMaterial {...skinMat} /></mesh>
          {/* Snout */}
          <mesh position={[0.17 * s, 0.01 * s, 0]}><sphereGeometry args={[0.035 * s, 8, 8]} /><meshPhysicalMaterial color="#8d6e63" metalness={0.1} roughness={0.6} /></mesh>
          {/* Eyes */}
          <mesh position={[0.14 * s, 0.05 * s, 0.04 * s]}><sphereGeometry args={[0.01 * s, 6, 6]} /><meshBasicMaterial color="#ff0000" /></mesh>
          <mesh position={[0.14 * s, 0.05 * s, -0.04 * s]}><sphereGeometry args={[0.01 * s, 6, 6]} /><meshBasicMaterial color="#ff0000" /></mesh>
          {/* Horns */}
          <mesh position={[0.08 * s, 0.1 * s, 0.04 * s]} rotation={[0, 0, -0.3]}><coneGeometry args={[0.008 * s, 0.04 * s, 4]} /><meshPhysicalMaterial color="#5d4037" metalness={0.3} roughness={0.5} /></mesh>
          <mesh position={[0.08 * s, 0.1 * s, -0.04 * s]} rotation={[0, 0, -0.3]}><coneGeometry args={[0.008 * s, 0.04 * s, 4]} /><meshPhysicalMaterial color="#5d4037" metalness={0.3} roughness={0.5} /></mesh>
        </>
      )}
      {/* Base */}
      <mesh position={[0, -0.02 * s, 0]}><cylinderGeometry args={[0.08 * s, 0.1 * s, 0.02 * s, 8]} /><meshPhysicalMaterial color="#222" metalness={0.2} roughness={0.7} /></mesh>
    </group>
  )
}

function LinkGanonPiece({ color, isRed, isSelected, pieceHeight }: {
  color: string; isRed: boolean; isSelected: boolean; pieceHeight: number
}) {
  const groupRef = useRef<THREE.Group>(null)
  useFrame((_, delta) => {
    if (groupRef.current && isSelected) groupRef.current.rotation.y += delta * 0.5
  })
  const s = pieceHeight * 0.5
  const greenMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: '#4caf50', metalness: 0.3, roughness: 0.5,
    emissive: isSelected ? '#c9a84c' : '#4caf50', emissiveIntensity: isSelected ? 0.3 : 0.05,
  }), [isSelected])
  const purpleMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: '#6a1b9a', metalness: 0.5, roughness: 0.3,
    emissive: isSelected ? '#c9a84c' : '#6a1b9a', emissiveIntensity: isSelected ? 0.3 : 0.05,
  }), [isSelected])
  const mat = isRed ? greenMat : purpleMat
  return (
    <group ref={groupRef}>
      {isRed ? (
        <>
          {/* Link body - tunic */}
          <mesh position={[0, 0.04 * s, 0]}><boxGeometry args={[0.14 * s, 0.14 * s, 0.1 * s]} /><meshPhysicalMaterial {...mat} /></mesh>
          {/* Head */}
          <mesh position={[0, 0.14 * s, 0]}><sphereGeometry args={[0.06 * s, 12, 12]} /><meshPhysicalMaterial color="#ffcc80" metalness={0.1} roughness={0.6} /></mesh>
          {/* Hair/hat */}
          <mesh position={[0, 0.17 * s, 0.01 * s]}><coneGeometry args={[0.05 * s, 0.04 * s, 8]} /><meshPhysicalMaterial color="#ffd54f" metalness={0.1} roughness={0.5} /></mesh>
          {/* Eyes */}
          <mesh position={[-0.02 * s, 0.14 * s, 0.06 * s]}><sphereGeometry args={[0.008 * s, 6, 6]} /><meshBasicMaterial color="#1a237e" /></mesh>
          <mesh position={[0.02 * s, 0.14 * s, 0.06 * s]}><sphereGeometry args={[0.008 * s, 6, 6]} /><meshBasicMaterial color="#1a237e" /></mesh>
          {/* Sword */}
          <mesh position={[0.16 * s, 0.08 * s, 0]} rotation={[0, 0, 0.2]}><boxGeometry args={[0.06 * s, 0.006 * s, 0.004 * s]} /><meshPhysicalMaterial color="#9e9e9e" metalness={0.8} roughness={0.2} /></mesh>
          <mesh position={[0.18 * s, 0.04 * s, 0]}><boxGeometry args={[0.01 * s, 0.01 * s, 0.006 * s]} /><meshPhysicalMaterial color="#795548" metalness={0.3} roughness={0.5} /></mesh>
          {/* Shield */}
          <mesh position={[-0.12 * s, 0.06 * s, 0.07 * s]}><boxGeometry args={[0.04 * s, 0.06 * s, 0.008 * s]} /><meshPhysicalMaterial color="#1a237e" metalness={0.4} roughness={0.5} /></mesh>
        </>
      ) : (
        <>
          {/* Ganon body */}
          <mesh position={[0, 0.06 * s, 0]}><cylinderGeometry args={[0.08 * s, 0.12 * s, 0.16 * s, 8]} /><meshPhysicalMaterial {...mat} /></mesh>
          {/* Head */}
          <mesh position={[0, 0.16 * s, 0]}><sphereGeometry args={[0.06 * s, 12, 12]} /><meshPhysicalMaterial color="#4a148c" metalness={0.5} roughness={0.3} /></mesh>
          {/* Crown/helmet */}
          <mesh position={[0, 0.19 * s, 0]}><torusGeometry args={[0.05 * s, 0.01 * s, 8, 12]} /><meshPhysicalMaterial color="#ffd700" metalness={0.7} roughness={0.2} /></mesh>
          {/* Eyes (red) */}
          <mesh position={[-0.02 * s, 0.16 * s, 0.06 * s]}><sphereGeometry args={[0.008 * s, 6, 6]} /><meshBasicMaterial color="#ff0000" /></mesh>
          <mesh position={[0.02 * s, 0.16 * s, 0.06 * s]}><sphereGeometry args={[0.008 * s, 6, 6]} /><meshBasicMaterial color="#ff0000" /></mesh>
          {/* Trident */}
          <mesh position={[0.14 * s, 0.1 * s, 0]} rotation={[0, 0, 0.2]}><boxGeometry args={[0.07 * s, 0.004 * s, 0.004 * s]} /><meshPhysicalMaterial color="#616161" metalness={0.7} roughness={0.2} /></mesh>
          <mesh position={[0.17 * s, 0.14 * s, 0]}><coneGeometry args={[0.008 * s, 0.025 * s, 4]} /><meshPhysicalMaterial color="#9e9e9e" metalness={0.7} roughness={0.2} /></mesh>
        </>
      )}
      <mesh position={[0, -0.02 * s, 0]}><cylinderGeometry args={[0.08 * s, 0.1 * s, 0.02 * s, 8]} /><meshPhysicalMaterial color="#222" metalness={0.2} roughness={0.7} /></mesh>
    </group>
  )
}

function MuscleSportPiece({ color, isRed, isSelected, pieceHeight }: {
  color: string; isRed: boolean; isSelected: boolean; pieceHeight: number
}) {
  const groupRef = useRef<THREE.Group>(null)
  useFrame((_, delta) => {
    if (groupRef.current && isSelected) groupRef.current.rotation.y += delta * 0.5
  })
  const s = pieceHeight * 0.48
  const bodyMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: isRed ? '#c62828' : '#1565c0', metalness: 0.6, roughness: 0.3,
    emissive: isSelected ? '#c9a84c' : (isRed ? '#c62828' : '#1565c0'), emissiveIntensity: isSelected ? 0.3 : 0.05,
  }), [isRed, isSelected])
  const darkMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: '#222', metalness: 0.4, roughness: 0.5,
  }), [])
  return (
    <group ref={groupRef}>
      {/* Body */}
      <mesh position={[0, 0.05 * s, 0]}><boxGeometry args={[isRed ? 0.2 * s : 0.16 * s, 0.1 * s, 0.12 * s]} /><meshPhysicalMaterial {...bodyMat} /></mesh>
      {/* Cabin */}
      <mesh position={[0, 0.03 * s, 0.06 * s]}><boxGeometry args={[0.08 * s, 0.04 * s, 0.02 * s]} /><meshPhysicalMaterial color="#333" metalness={0.2} roughness={0.5} /></mesh>
      {/* Wheels */}
      {[[-0.1 * s, 0, 0.1 * s], [-0.1 * s, 0, -0.1 * s], [0.1 * s, 0, 0.1 * s], [0.1 * s, 0, -0.1 * s]].map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.025 * s, 0.03 * s, 0.02 * s, 8]} /><meshPhysicalMaterial {...darkMat} /></mesh>
      ))}
      {/* Spoiler (muscle) */}
      {isRed && <mesh position={[-0.12 * s, 0.08 * s, 0]}><boxGeometry args={[0.02 * s, 0.03 * s, 0.08 * s]} /><meshPhysicalMaterial {...darkMat} /></mesh>}
      {/* Spoiler (sport) */}
      {!isRed && <mesh position={[-0.1 * s, 0.06 * s, 0]}><boxGeometry args={[0.008 * s, 0.015 * s, 0.06 * s]} /><meshPhysicalMaterial {...darkMat} /></mesh>}
      {/* Headlights */}
      <mesh position={[0.12 * s, 0.03 * s, 0.06 * s]}><sphereGeometry args={[0.01 * s, 6, 6]} /><meshPhysicalMaterial color="#ffeb3b" emissive="#ffeb3b" emissiveIntensity={0.4} /></mesh>
      <mesh position={[0.12 * s, 0.03 * s, -0.06 * s]}><sphereGeometry args={[0.01 * s, 6, 6]} /><meshPhysicalMaterial color="#ffeb3b" emissive="#ffeb3b" emissiveIntensity={0.4} /></mesh>
      {/* Base */}
      <mesh position={[0, -0.02 * s, 0]}><cylinderGeometry args={[0.08 * s, 0.1 * s, 0.02 * s, 8]} /><meshPhysicalMaterial {...darkMat} /></mesh>
    </group>
  )
}

function AlienAstronautPiece({ color, isRed, isSelected, pieceHeight }: {
  color: string; isRed: boolean; isSelected: boolean; pieceHeight: number
}) {
  const groupRef = useRef<THREE.Group>(null)
  useFrame((_, delta) => {
    if (groupRef.current) {
      if (isSelected) groupRef.current.rotation.y += delta * 0.5
      groupRef.current.position.y = Math.sin(Date.now() * 0.002) * 0.015 * pieceHeight
    }
  })
  const s = pieceHeight * 0.5
  const greenMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: '#66bb6a', metalness: 0.2, roughness: 0.5,
    emissive: isSelected ? '#c9a84c' : '#66bb6a', emissiveIntensity: isSelected ? 0.3 : 0.05,
  }), [isSelected])
  const whiteMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: '#eeeeee', metalness: 0.3, roughness: 0.4,
    emissive: isSelected ? '#c9a84c' : '#eeeeee', emissiveIntensity: isSelected ? 0.3 : 0.02,
  }), [isSelected])
  const mat = isRed ? greenMat : whiteMat
  return (
    <group ref={groupRef}>
      {isRed ? (
        <>
          {/* Alien body */}
          <mesh position={[0, 0.04 * s, 0]}><sphereGeometry args={[0.1 * s, 12, 12]} /><meshPhysicalMaterial {...mat} /></mesh>
          {/* Head */}
          <mesh position={[0, 0.16 * s, 0]}><sphereGeometry args={[0.07 * s, 12, 12]} /><meshPhysicalMaterial {...mat} /></mesh>
          {/* Big eyes */}
          <mesh position={[-0.03 * s, 0.17 * s, 0.07 * s]}><sphereGeometry args={[0.02 * s, 8, 8]} /><meshBasicMaterial color="#111" /></mesh>
          <mesh position={[0.03 * s, 0.17 * s, 0.07 * s]}><sphereGeometry args={[0.02 * s, 8, 8]} /><meshBasicMaterial color="#111" /></mesh>
          {/* Eye glow */}
          <mesh position={[-0.03 * s, 0.17 * s, 0.075 * s]}><sphereGeometry args={[0.01 * s, 8, 8]} /><meshBasicMaterial color="#00e5ff" /></mesh>
          <mesh position={[0.03 * s, 0.17 * s, 0.075 * s]}><sphereGeometry args={[0.01 * s, 8, 8]} /><meshBasicMaterial color="#00e5ff" /></mesh>
          {/* Antenna */}
          <mesh position={[0, 0.22 * s, 0]}><cylinderGeometry args={[0.003 * s, 0.003 * s, 0.04 * s, 4]} /><meshBasicMaterial color="#888" /></mesh>
          <mesh position={[0, 0.24 * s, 0]}><sphereGeometry args={[0.006 * s, 6, 6]} /><meshBasicMaterial color="#00e5ff" /></mesh>
        </>
      ) : (
        <>
          {/* Astronaut body */}
          <mesh position={[0, 0.04 * s, 0]}><boxGeometry args={[0.14 * s, 0.14 * s, 0.1 * s]} /><meshPhysicalMaterial {...mat} /></mesh>
          {/* Head/Helmet */}
          <mesh position={[0, 0.15 * s, 0]}><sphereGeometry args={[0.07 * s, 12, 12]} /><meshPhysicalMaterial {...whiteMat} /></mesh>
          {/* Visor */}
          <mesh position={[0, 0.15 * s, 0.07 * s]}><sphereGeometry args={[0.04 * s, 12, 8]} /><meshPhysicalMaterial color="#ffd54f" metalness={0.9} roughness={0.1} emissive="#ffd54f" emissiveIntensity={0.1} /></mesh>
          {/* Backpack */}
          <mesh position={[0, 0.06 * s, -0.08 * s]}><boxGeometry args={[0.08 * s, 0.1 * s, 0.03 * s]} /><meshPhysicalMaterial color="#ccc" metalness={0.3} roughness={0.5} /></mesh>
          {/* Arms */}
          <mesh position={[-0.1 * s, 0.06 * s, 0]}><boxGeometry args={[0.02 * s, 0.08 * s, 0.02 * s]} /><meshPhysicalMaterial {...whiteMat} /></mesh>
          <mesh position={[0.1 * s, 0.06 * s, 0]}><boxGeometry args={[0.02 * s, 0.08 * s, 0.02 * s]} /><meshPhysicalMaterial {...whiteMat} /></mesh>
        </>
      )}
      <mesh position={[0, -0.02 * s, 0]}><cylinderGeometry args={[0.08 * s, 0.1 * s, 0.02 * s, 8]} /><meshPhysicalMaterial color="#222" metalness={0.2} roughness={0.7} /></mesh>
    </group>
  )
}

function DragonMagePiece({ color, isRed, isSelected, pieceHeight }: {
  color: string; isRed: boolean; isSelected: boolean; pieceHeight: number
}) {
  const groupRef = useRef<THREE.Group>(null)
  useFrame((_, delta) => {
    if (groupRef.current && isSelected) {
      groupRef.current.rotation.y += delta * 0.5
      if (!isRed) {
        const children = groupRef.current.children
        for (let i = 0; i < children.length; i++) {
          if (children[i].userData.float) {
            children[i].position.y += Math.sin(Date.now() * 0.003 + i) * 0.002
          }
        }
      }
    }
  })
  const s = pieceHeight * 0.5
  const dragonMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: '#b71c1c', metalness: 0.4, roughness: 0.4,
    emissive: isSelected ? '#c9a84c' : '#b71c1c', emissiveIntensity: isSelected ? 0.3 : 0.05,
  }), [isSelected])
  const mageMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: '#1a237e', metalness: 0.3, roughness: 0.5,
    emissive: isSelected ? '#c9a84c' : '#1a237e', emissiveIntensity: isSelected ? 0.3 : 0.05,
  }), [isSelected])
  return (
    <group ref={groupRef}>
      {isRed ? (
        <>
          {/* Dragon body */}
          <mesh position={[0, 0.06 * s, 0]}><sphereGeometry args={[0.1 * s, 12, 12]} /><meshPhysicalMaterial {...dragonMat} /></mesh>
          {/* Head */}
          <mesh position={[0.12 * s, 0.08 * s, 0]}><sphereGeometry args={[0.06 * s, 10, 10]} /><meshPhysicalMaterial {...dragonMat} /></mesh>
          {/* Snout */}
          <mesh position={[0.17 * s, 0.06 * s, 0]}><sphereGeometry args={[0.03 * s, 8, 8]} /><meshPhysicalMaterial color="#5d4037" metalness={0.2} roughness={0.6} /></mesh>
          {/* Eyes */}
          <mesh position={[0.14 * s, 0.1 * s, 0.04 * s]}><sphereGeometry args={[0.008 * s, 6, 6]} /><meshBasicMaterial color="#ffeb3b" /></mesh>
          <mesh position={[0.14 * s, 0.1 * s, -0.04 * s]}><sphereGeometry args={[0.008 * s, 6, 6]} /><meshBasicMaterial color="#ffeb3b" /></mesh>
          {/* Wings */}
          <mesh position={[-0.04 * s, 0.12 * s, 0.12 * s]} rotation={[-0.3, 0.2, 0]}><boxGeometry args={[0.1 * s, 0.004 * s, 0.06 * s]} /><meshPhysicalMaterial color="#424242" metalness={0.2} roughness={0.6} /></mesh>
          <mesh position={[-0.04 * s, 0.12 * s, -0.12 * s]} rotation={[0.3, -0.2, 0]}><boxGeometry args={[0.1 * s, 0.004 * s, 0.06 * s]} /><meshPhysicalMaterial color="#424242" metalness={0.2} roughness={0.6} /></mesh>
          {/* Tail */}
          <mesh position={[-0.14 * s, 0.04 * s, 0]} rotation={[0, 0, 0.3]}><coneGeometry args={[0.015 * s, 0.08 * s, 6]} /><meshPhysicalMaterial {...dragonMat} /></mesh>
          {/* Flame */}
          <mesh position={[0.2 * s, 0.05 * s, 0]}><sphereGeometry args={[0.015 * s, 6, 6]} /><meshPhysicalMaterial color="#ff6600" emissive="#ff4400" emissiveIntensity={0.6} metalness={0.1} roughness={0.3} /></mesh>
        </>
      ) : (
        <>
          {/* Mage body/robe */}
          <mesh position={[0, 0.04 * s, 0]}><coneGeometry args={[0.1 * s, 0.15 * s, 8]} /><meshPhysicalMaterial {...mageMat} /></mesh>
          {/* Head */}
          <mesh position={[0, 0.13 * s, 0]}><sphereGeometry args={[0.05 * s, 10, 10]} /><meshPhysicalMaterial color="#ffcc80" metalness={0.1} roughness={0.6} /></mesh>
          {/* Wizard hat */}
          <mesh position={[0, 0.18 * s, 0]}><coneGeometry args={[0.06 * s, 0.08 * s, 8]} /><meshPhysicalMaterial {...mageMat} /></mesh>
          {/* Hat brim */}
          <mesh position={[0, 0.14 * s, 0]}><torusGeometry args={[0.055 * s, 0.008 * s, 8, 12]} /><meshPhysicalMaterial {...mageMat} /></mesh>
          {/* Star on hat */}
          <mesh position={[0, 0.23 * s, 0]} userData={{ float: true }}><octahedronGeometry args={[0.01 * s, 0]} /><meshPhysicalMaterial color="#ffd700" emissive="#ffd700" emissiveIntensity={0.5} metalness={0.7} roughness={0.2} /></mesh>
          {/* Beard */}
          <mesh position={[0, 0.09 * s, 0.04 * s]}><coneGeometry args={[0.025 * s, 0.04 * s, 6]} /><meshPhysicalMaterial color="#eceff1" metalness={0.1} roughness={0.8} /></mesh>
          {/* Staff */}
          <mesh position={[0.12 * s, 0.08 * s, 0]}><cylinderGeometry args={[0.004 * s, 0.004 * s, 0.1 * s, 4]} /><meshPhysicalMaterial color="#795548" metalness={0.3} roughness={0.5} /></mesh>
          {/* Staff orb */}
          <mesh position={[0.12 * s, 0.14 * s, 0]} userData={{ float: true }}><sphereGeometry args={[0.012 * s, 8, 8]} /><meshPhysicalMaterial color="#00bcd4" emissive="#00bcd4" emissiveIntensity={0.5} metalness={0.3} roughness={0.2} /></mesh>
        </>
      )}
      <mesh position={[0, -0.02 * s, 0]}><cylinderGeometry args={[0.08 * s, 0.1 * s, 0.02 * s, 8]} /><meshPhysicalMaterial color="#222" metalness={0.2} roughness={0.7} /></mesh>
    </group>
  )
}

function DogCatPiece({ color, isRed, isSelected, pieceHeight }: {
  color: string; isRed: boolean; isSelected: boolean; pieceHeight: number
}) {
  const groupRef = useRef<THREE.Group>(null)
  useFrame((_, delta) => {
    if (groupRef.current && isSelected) groupRef.current.rotation.y += delta * 0.5
  })
  const s = pieceHeight * 0.5
  const brownMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: '#8d6e63', metalness: 0.1, roughness: 0.7,
    emissive: isSelected ? '#c9a84c' : '#8d6e63', emissiveIntensity: isSelected ? 0.3 : 0.03,
  }), [isSelected])
  const orangeMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: '#ff9800', metalness: 0.1, roughness: 0.6,
    emissive: isSelected ? '#c9a84c' : '#ff9800', emissiveIntensity: isSelected ? 0.3 : 0.03,
  }), [isSelected])
  const mat = isRed ? brownMat : orangeMat
  return (
    <group ref={groupRef}>
      {/* Body */}
      <mesh position={[0, 0.05 * s, 0]}><boxGeometry args={[0.16 * s, 0.1 * s, 0.1 * s]} /><meshPhysicalMaterial {...mat} /></mesh>
      {/* Head */}
      <mesh position={[0.12 * s, 0.1 * s, 0]}><sphereGeometry args={[0.06 * s, 10, 10]} /><meshPhysicalMaterial {...mat} /></mesh>
      {/* Snout */}
      <mesh position={[0.17 * s, 0.08 * s, 0]}><sphereGeometry args={[0.03 * s, 8, 8]} /><meshPhysicalMaterial color={isRed ? '#a1887f' : '#ffe0b2'} metalness={0.1} roughness={0.7} /></mesh>
      {/* Nose */}
      <mesh position={[0.2 * s, 0.08 * s, 0]}><sphereGeometry args={[0.006 * s, 6, 6]} /><meshPhysicalMaterial color="#222" metalness={0.1} roughness={0.5} /></mesh>
      {/* Eyes */}
      <mesh position={[0.14 * s, 0.12 * s, 0.04 * s]}><sphereGeometry args={[0.008 * s, 6, 6]} /><meshBasicMaterial color="#222" /></mesh>
      <mesh position={[0.14 * s, 0.12 * s, -0.04 * s]}><sphereGeometry args={[0.008 * s, 6, 6]} /><meshBasicMaterial color="#222" /></mesh>
      {/* Ears */}
      {isRed ? (
        <>
          {/* Dog floppy ears */}
          <mesh position={[0.08 * s, 0.14 * s, 0.05 * s]} rotation={[0, 0, -0.3]}><boxGeometry args={[0.03 * s, 0.05 * s, 0.008 * s]} /><meshPhysicalMaterial {...brownMat} /></mesh>
          <mesh position={[0.08 * s, 0.14 * s, -0.05 * s]} rotation={[0, 0, -0.3]}><boxGeometry args={[0.03 * s, 0.05 * s, 0.008 * s]} /><meshPhysicalMaterial {...brownMat} /></mesh>
        </>
      ) : (
        <>
          {/* Cat pointy ears */}
          <mesh position={[0.09 * s, 0.16 * s, 0.04 * s]} rotation={[0, 0, -0.4]}><coneGeometry args={[0.012 * s, 0.04 * s, 4]} /><meshPhysicalMaterial color="#ff9800" metalness={0.1} roughness={0.6} /></mesh>
          <mesh position={[0.09 * s, 0.16 * s, -0.04 * s]} rotation={[0, 0, -0.4]}><coneGeometry args={[0.012 * s, 0.04 * s, 4]} /><meshPhysicalMaterial color="#ff9800" metalness={0.1} roughness={0.6} /></mesh>
        </>
      )}
      {/* Tail */}
      {isRed ? (
        <mesh position={[-0.12 * s, 0.08 * s, 0]} rotation={[0, 0, 0.5]}><cylinderGeometry args={[0.008 * s, 0.012 * s, 0.06 * s, 4]} /><meshPhysicalMaterial {...brownMat} /></mesh>
      ) : (
        <mesh position={[-0.12 * s, 0.1 * s, 0]} rotation={[0, 0, 0.8]}><cylinderGeometry args={[0.006 * s, 0.008 * s, 0.06 * s, 4]} /><meshPhysicalMaterial color="#ff9800" metalness={0.1} roughness={0.6} /></mesh>
      )}
      {/* Base */}
      <mesh position={[0, -0.02 * s, 0]}><cylinderGeometry args={[0.08 * s, 0.1 * s, 0.02 * s, 8]} /><meshPhysicalMaterial color="#222" metalness={0.2} roughness={0.7} /></mesh>
    </group>
  )
}

function PizzaDonutPiece({ color, isRed, isSelected, pieceHeight }: {
  color: string; isRed: boolean; isSelected: boolean; pieceHeight: number
}) {
  const groupRef = useRef<THREE.Group>(null)
  useFrame((_, delta) => {
    if (groupRef.current && isSelected) groupRef.current.rotation.y += delta * 0.5
  })
  const s = pieceHeight * 0.5
  return (
    <group ref={groupRef}>
      {isRed ? (
        <>
          {/* Pizza crust */}
          <mesh position={[0, 0.02 * s, 0]} rotation={[0, 0, 0.2]}>
            <coneGeometry args={[0.14 * s, 0.015 * s, 3]} />
            <meshPhysicalMaterial color="#d4a46b" metalness={0.1} roughness={0.8} />
          </mesh>
          {/* Pizza toppings */}
          <mesh position={[0, 0.025 * s, 0]} rotation={[0, 0, 0.2]}>
            <coneGeometry args={[0.12 * s, 0.008 * s, 3]} />
            <meshPhysicalMaterial color="#e53935" metalness={0.1} roughness={0.7} />
          </mesh>
          {/* Cheese spots */}
          <mesh position={[0.04 * s, 0.03 * s, 0.04 * s]}><sphereGeometry args={[0.008 * s, 6, 6]} /><meshPhysicalMaterial color="#ffd54f" metalness={0.1} roughness={0.7} /></mesh>
          <mesh position={[-0.03 * s, 0.03 * s, -0.04 * s]}><sphereGeometry args={[0.006 * s, 6, 6]} /><meshPhysicalMaterial color="#ffd54f" metalness={0.1} roughness={0.7} /></mesh>
          {/* Pepperoni */}
          <mesh position={[0.06 * s, 0.025 * s, -0.02 * s]}><cylinderGeometry args={[0.01 * s, 0.01 * s, 0.004 * s, 8]} /><meshPhysicalMaterial color="#c62828" metalness={0.1} roughness={0.7} /></mesh>
          <mesh position={[-0.04 * s, 0.025 * s, 0.05 * s]}><cylinderGeometry args={[0.008 * s, 0.008 * s, 0.004 * s, 8]} /><meshPhysicalMaterial color="#c62828" metalness={0.1} roughness={0.7} /></mesh>
        </>
      ) : (
        <>
          {/* Donut body */}
          <mesh position={[0, 0.04 * s, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.1 * s, 0.035 * s, 8, 16]} />
            <meshPhysicalMaterial color="#d4a46b" metalness={0.1} roughness={0.6} />
          </mesh>
          {/* Icing */}
          <mesh position={[0, 0.07 * s, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.1 * s, 0.038 * s, 8, 16]} />
            <meshPhysicalMaterial color="#ff80ab" metalness={0.1} roughness={0.3} emissive="#ff80ab" emissiveIntensity={0.05} />
          </mesh>
          {/* Sprinkles */}
          {[
            [0.06 * s, 0.076 * s, 0.06 * s], [-0.06 * s, 0.076 * s, 0.06 * s],
            [0.08 * s, 0.076 * s, -0.02 * s], [-0.08 * s, 0.076 * s, -0.02 * s],
            [0, 0.076 * s, -0.09 * s], [0, 0.076 * s, 0.09 * s],
          ].map(([x, y, z], i) => (
            <mesh key={i} position={[x, y, z]}><boxGeometry args={[0.004 * s, 0.001 * s, 0.008 * s]} /><meshBasicMaterial color={['#e53935', '#43a047', '#1e88e5', '#ffd54f', '#ff7043', '#ab47bc'][i]} /></mesh>
          ))}
        </>
      )}
      <mesh position={[0, -0.02 * s, 0]}><cylinderGeometry args={[0.08 * s, 0.1 * s, 0.02 * s, 8]} /><meshPhysicalMaterial color="#222" metalness={0.2} roughness={0.7} /></mesh>
    </group>
  )
}

function GLBModelPiece({ color, isRed, isSelected, pieceHeight, modelPath }: {
  color: string; isRed: boolean; isSelected: boolean; pieceHeight: number; modelPath: string
}) {
  const groupRef = useRef<THREE.Group>(null)
  const { scene } = useGLTF(modelPath)

  useFrame((_, delta) => {
    if (groupRef.current && isSelected) {
      groupRef.current.rotation.y += delta * 0.5
    }
  })

  const clonedScene = useMemo(() => {
    const clone = scene.clone()
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh
        mesh.castShadow = true
        mesh.receiveShadow = true
      }
    })
    return clone
  }, [modelPath])

  useEffect(() => {
    clonedScene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh
        const mat = mesh.material as THREE.MeshPhysicalMaterial
        if (mat && !Array.isArray(mat)) {
          mat.color.set(color)
          if (isSelected) {
            mat.emissive?.set('#c9a84c')
            mat.emissiveIntensity = 0.4
          } else {
            mat.emissive?.set(isRed ? '#4a0e0e' : '#0d3018')
            mat.emissiveIntensity = 0.05
          }
        }
      }
    })
  }, [clonedScene, color, isSelected, isRed])

  const scale = pieceHeight * 0.8

  return (
    <group ref={groupRef} scale={[scale, scale, scale]}>
      <primitive object={clonedScene} />
    </group>
  )
}

function AnimatedPiece({
  piece,
  isSelected,
  onClick,
  disabled,
  skin,
  boardSize,
  skinId,
}: {
  piece: PieceData
  isSelected: boolean
  onClick: () => void
  disabled: boolean
  skin?: Skin
  boardSize: number
  skinId?: string
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  const pieceGroupRef = useRef<THREE.Group>(null)
  const crownRef = useRef<THREE.Group>(null)
  const glowRef = useRef<THREE.Mesh>(null)
  const boardOffset = (boardSize / 2) * CELL_SIZE
  const targetPos = useMemo(() => ({
    x: (piece.col - boardOffset / CELL_SIZE + 0.5) * CELL_SIZE,
    z: (piece.row - boardOffset / CELL_SIZE + 0.5) * CELL_SIZE,
  }), [piece.col, piece.row, boardOffset])

  const specialSkins = useMemo(() => new Set(['f1_car', 'horse', 'crown_model', 'magic_crystal', 'shield', 'spaceship', 'robot', 'aventador_svj', 'porsche_911', 'phoenix', 'pokemon', 'mario_bowser', 'link_ganon', 'muscle_sport', 'alien_astronaut', 'dragon_mage', 'dog_cat', 'pizza_donut']), [])
  const isSpecialSkin = skinId ? specialSkins.has(skinId) : false
  const pieceHeight = isSpecialSkin ? (piece.isKing ? 0.35 : 0.28) : (piece.isKing ? 0.38 : 0.32)
  const pieceProfile = useMemo(() => createPieceProfile(pieceHeight), [pieceHeight])
  const latheGeo = useMemo(() => new THREE.LatheGeometry(pieceProfile, 32), [pieceProfile])

  const PieceModelComponent = useMemo(() => {
    if (!skinId) return undefined
    const map: Record<string, React.FC<{ color: string; isRed: boolean; isSelected: boolean; pieceHeight: number }>> = {
      'f1_car': ImprovedF1Car,
      'horse': HorsePiece,
      'crown_model': CrownPiece,
      'magic_crystal': CrystalPiece,
      'shield': ShieldPiece,
      'spaceship': SpaceshipPiece,
      'robot': RobotPiece,
      'aventador_svj': (props) => GLBModelPiece({ ...props, modelPath: '/models/aventador_svj.glb' }),
      'porsche_911': (props) => GLBModelPiece({ ...props, modelPath: '/models/porsche_911.glb' }),
      'phoenix': (props) => GLBModelPiece({ ...props, modelPath: '/models/phoenix.glb' }),
      'pokemon': PikachuCharmanderPiece,
      'mario_bowser': MarioBowserPiece,
      'link_ganon': LinkGanonPiece,
      'muscle_sport': MuscleSportPiece,
      'alien_astronaut': AlienAstronautPiece,
      'dragon_mage': DragonMagePiece,
      'dog_cat': DogCatPiece,
      'pizza_donut': PizzaDonutPiece,
    }
    return map[skinId]
  }, [skinId])

  useFrame((_, delta) => {
    const target = isSpecialSkin ? pieceGroupRef.current?.position : meshRef.current?.position
    if (target) {
      target.x += (targetPos.x - target.x) * 0.15
      target.z += (targetPos.z - target.z) * 0.15
      if (isSelected) {
        target.y = 0.01 + Math.sin(Date.now() * 0.004) * 0.04
      } else {
        target.y += (0.01 - target.y) * 0.1
      }
    }
    if (crownRef.current) {
      crownRef.current.position.y = isSelected
        ? pieceHeight + 0.08 + Math.sin(Date.now() * 0.004) * 0.04
        : pieceHeight + 0.04
    }
    if (glowRef.current) {
      glowRef.current.scale.setScalar(1 + Math.sin(Date.now() * 0.003) * 0.05)
    }
  })

  const isRed = piece.player === 1
  const baseColor = isRed ? '#c62828' : '#2e7d4f'
  const color = isSelected ? '#c9a84c' : baseColor
  const emissive = isSelected ? '#c9a84c' : isRed ? '#4a0e0e' : '#0d3018'

  const skinConfig = skin?.config || {}

  const commonGroup = (
    <group>
      {isSelected && (
        <mesh position={[targetPos.x, 0.005, targetPos.z]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.35, 0.48, 32]} />
          <meshBasicMaterial color="#c9a84c" transparent opacity={0.3} />
        </mesh>
      )}
      {isSelected && (
        <mesh
          ref={glowRef}
          position={[targetPos.x, 0.005, targetPos.z]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <ringGeometry args={[0.38, 0.5, 32]} />
          <meshBasicMaterial color="#c9a84c" transparent opacity={0.15} />
        </mesh>
      )}
    </group>
  )

  if (isSpecialSkin && PieceModelComponent) {
    return (
      <group>
        {commonGroup}
        <group
          ref={pieceGroupRef}
          position={[targetPos.x, 0.01, targetPos.z]}
          onClick={(e: ThreeEvent<MouseEvent>) => {
            e.stopPropagation()
            if (!disabled) onClick()
          }}
        >
          <PieceModelComponent color={color} isRed={isRed} isSelected={isSelected} pieceHeight={pieceHeight} />
          {piece.isKing && (
            <group ref={crownRef} position={[0, pieceHeight + 0.04, 0]}>
              <mesh position={[0, 0, 0]}>
                <torusGeometry args={[0.08, 0.02, 8, 16]} />
                <meshPhysicalMaterial color="#c9a84c" emissive="#c9a84c" emissiveIntensity={0.2} metalness={0.7} roughness={0.2} />
              </mesh>
              <mesh position={[0, 0.03, 0]}>
                <boxGeometry args={[0.04, 0.04, 0.04]} />
                <meshPhysicalMaterial color="#ffd700" emissive="#c9a84c" emissiveIntensity={0.3} />
              </mesh>
            </group>
          )}
        </group>
      </group>
    )
  }

  return (
    <group>
      {commonGroup}
      <mesh
        ref={meshRef}
        position={[targetPos.x, 0.01, targetPos.z]}
        onClick={(e: ThreeEvent<MouseEvent>) => {
          e.stopPropagation()
          if (!disabled) onClick()
        }}
        castShadow
        geometry={latheGeo}
      >
        <meshPhysicalMaterial
          color={color}
          emissive={emissive}
          emissiveIntensity={isSelected ? 0.4 : (skinConfig.emissiveIntensity ?? 0.15)}
          metalness={skinConfig.metalness ?? 0.3}
          roughness={skinConfig.roughness ?? 0.6}
          clearcoat={skinConfig.clearcoat ?? 0.2}
          clearcoatRoughness={0.3}
          envMapIntensity={skinConfig.envMapIntensity ?? 0.5}
        />
      </mesh>

      {piece.isKing && (
        <group ref={crownRef} position={[targetPos.x, pieceHeight + 0.04, targetPos.z]}>
          <mesh position={[0, 0, 0]}>
            <torusGeometry args={[0.1, 0.025, 8, 16]} />
            <meshPhysicalMaterial color="#c9a84c" emissive="#c9a84c" emissiveIntensity={0.2} metalness={0.7} roughness={0.2} />
          </mesh>
          {[0, 1, 2].map((i) => (
            <mesh key={i} position={[
              Math.cos((i / 3) * Math.PI * 2) * 0.08,
              0.03,
              Math.sin((i / 3) * Math.PI * 2) * 0.08,
            ]}>
              <sphereGeometry args={[0.025, 6, 6]} />
              <meshPhysicalMaterial color="#ffd700" emissive="#c9a84c" emissiveIntensity={0.3} metalness={0.8} roughness={0.1} />
            </mesh>
          ))}
        </group>
      )}
    </group>
  )
}

function BoardGrid({ onClick, validMoves, selectedPos, disabled, skin, boardSize }: {
  onClick: (row: number, col: number) => void
  validMoves: { row: number; col: number }[]
  selectedPos: { row: number; col: number } | null
  disabled: boolean
  skin?: Skin
  boardSize: number
}) {
  const boardOffset = (boardSize / 2) * CELL_SIZE
  const tiles = useMemo(() => {
    const t: { row: number; col: number; isDark: boolean }[] = []
    for (let r = 0; r < boardSize; r++) {
      for (let c = 0; c < boardSize; c++) {
        t.push({ row: r, col: c, isDark: darkSquare(r, c) })
      }
    }
    return t
  }, [boardSize])

  const isValidMove = useCallback(
    (row: number, col: number) => validMoves.some(m => m.row === row && m.col === col),
    [validMoves]
  )

  const skinConfig = skin?.config || {}

  return (
    <group>
      {tiles.map(({ row, col, isDark }) => {
        const x = (col - boardOffset / CELL_SIZE + 0.5) * CELL_SIZE
        const z = (row - boardOffset / CELL_SIZE + 0.5) * CELL_SIZE
        const isSelected = selectedPos?.row === row && selectedPos?.col === col
        const isHighlight = isValidMove(row, col)

        const defaultDark = skinConfig.color1 || '#3d2b1a'
        const defaultLight = skinConfig.color2 || '#e8d5b7'

        let color = isDark ? defaultDark : defaultLight
        if (isHighlight) color = 'rgba(201, 168, 76, 0.6)'
        if (isSelected) color = '#c9a84c'

        return (
          <mesh
            key={`${row}-${col}`}
            position={[x, -0.05, z]}
            onClick={(e: ThreeEvent<MouseEvent>) => {
              e.stopPropagation()
              if (!disabled && isDark) onClick(row, col)
            }}
          >
            <boxGeometry args={[0.95, 0.08, 0.95]} />
            <meshStandardMaterial
              color={color}
              metalness={skinConfig.metalness ?? (isDark ? 0.1 : 0)}
              roughness={skinConfig.roughness ?? (isDark ? 0.8 : 0.4)}
            />
          </mesh>
        )
      })}
    </group>
  )
}

export default function Board3D({
  board,
  currentPlayer,
  validMoves,
  selectedPos,
  onCellClick,
  isAIThinking,
  disabled,
  viewMode = '3d',
  boardSkinId = 'classic',
  pieceSkinId = 'standard',
  opponentBoardSkinId,
  opponentPieceSkinId,
}: Board3DProps) {
  const pieces = useMemo(() => getPieces(board || []), [board])

  const boardSkin = useMemo(() => {
    return Object.values(BOARD_SKINS).find(s => s.id === boardSkinId) || BOARD_SKINS.classic
  }, [boardSkinId])

  const getSkinForPiece = useCallback((player: number) => {
    if (player === 1) {
      return {
        skin: Object.values(PIECE_SKINS).find(s => s.id === pieceSkinId) || PIECE_SKINS.standard,
        skinId: pieceSkinId,
      }
    }
    const id = opponentPieceSkinId || pieceSkinId
    return {
      skin: Object.values(PIECE_SKINS).find(s => s.id === id) || PIECE_SKINS.standard,
      skinId: id,
    }
  }, [pieceSkinId, opponentPieceSkinId])

  return (
    <div className="w-full h-full">
      <Canvas shadows onCreated={({ gl }) => {
          gl.setClearColor('#0c0a08')
          gl.toneMapping = THREE.ACESFilmicToneMapping
          gl.toneMappingExposure = 1.2
        }}>
        {viewMode === 'top' ? (
          <OrthographicCamera makeDefault position={[0, 10, 0]} zoom={0.75} near={0.1} far={100} left={-4} right={4} top={4} bottom={-4} />
        ) : (
          <PerspectiveCamera makeDefault position={[4.5, 6, 4.5]} fov={38} near={0.1} far={100} />
        )}

        <ambientLight intensity={0.3} color="#f5e6d3" />
        <directionalLight position={[4, 8, 4]} intensity={0.8} color="#f5e6d3" castShadow />
        <directionalLight position={[-3, 4, -3]} intensity={0.2} color="#c9a84c" />
        <spotLight position={[0, 6, 0]} angle={0.4} penumbra={1} intensity={0.3} color="#c9a84c" castShadow />
        <hemisphereLight args={['#f5e6d3', '#0c0a08', 0.4]} />

        <BoardGrid
          onClick={onCellClick}
          validMoves={validMoves}
          selectedPos={selectedPos}
          disabled={!!disabled}
          skin={boardSkin}
          boardSize={board.length}
        />

        {pieces.map((piece) => {
          const { skin, skinId } = getSkinForPiece(piece.player)
          return (
            <AnimatedPiece
              key={piece.id}
              piece={piece}
              isSelected={selectedPos?.row === piece.row && selectedPos?.col === piece.col}
              onClick={() => onCellClick(piece.row, piece.col)}
              disabled={!!disabled}
              skin={skin}
              skinId={skinId}
              boardSize={board.length}
            />
          )
        })}

        <OrbitControls
          enablePan={false}
          minPolarAngle={viewMode === 'top' ? 0 : Math.PI / 4}
          maxPolarAngle={viewMode === 'top' ? 0.1 : Math.PI / 3}
          minDistance={viewMode === 'top' ? 3 : 4}
          maxDistance={viewMode === 'top' ? 8 : 12}
          target={[0, 0, 0]}
          enableRotate={viewMode !== 'top'}
        />
      </Canvas>
    </div>
  )
}
