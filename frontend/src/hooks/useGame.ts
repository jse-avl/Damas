import { useState, useCallback, useRef } from 'react'

export interface Move {
  from: { row: number; col: number }
  to: { row: number; col: number }
  captured?: { row: number; col: number }
}

export type GameMode = 'pve' | 'pvp' | 'online'

interface GameState {
  board: number[][]
  currentPlayer: number
  status: 'playing' | 'won' | 'draw'
  winner?: number
  moveCount: number
  capturedP1: number
  capturedP2: number
}

const BOARD_SIZE = 6

function isDarkSquare(row: number, col: number): boolean {
  return (row + col) % 2 === 1
}

function createInitialBoard(size: number = 6): number[][] {
  const board: number[][] = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => 0)
  )
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (!isDarkSquare(r, c)) continue
      if (r < (size === 8 ? 3 : 2)) board[r][c] = 3
      else if (r >= size - (size === 8 ? 3 : 2)) board[r][c] = 1
    }
  }
  return board
}

function getPlayer(val: number): number {
  return val <= 2 ? 1 : 2
}

export function useGame(mode: GameMode = 'pve', boardSize: number = 6, onMove?: (moves: Move[]) => void) {
  const [state, setState] = useState<GameState>({
    board: createInitialBoard(boardSize),
    currentPlayer: 1,
    status: 'playing',
    moveCount: 0,
    capturedP1: 0,
    capturedP2: 0,
  })
  const [selectedPos, setSelectedPos] = useState<{ row: number; col: number } | null>(null)
  const [validMoves, setValidMoves] = useState<{ row: number; col: number }[]>([])
  const [isAIThinking, setIsAIThinking] = useState(false)
  const [lastEvent, setLastEvent] = useState<{ type: 'move' | 'capture' | 'king' | 'win' | 'lose' } | null>(null)
  const boardRef = useRef(state.board)
  boardRef.current = state.board

  const humanCurrent = mode === 'pvp' || mode === 'online'
    ? state.currentPlayer
    : 1

  const mandatoryCapture = state.status === 'playing' && isAnyCaptureAvailable(state.board, humanCurrent)

  const getValidMoves = useCallback((row: number, col: number): Move[] => {
    const val = boardRef.current[row][col]
    if (!val) return []
    const captures = getCaptures(boardRef.current, row, col)
    if (captures.length > 0) return captures
    return getSimpleMoves(boardRef.current, row, col, val)
  }, [])

  const applyMove = useCallback((moves: Move[]) => {
    setState(prev => {
      const newBoard = prev.board.map(r => [...r])
      let capturedP1 = prev.capturedP1
      let capturedP2 = prev.capturedP2

      for (const move of moves) {
        const val = newBoard[move.from.row][move.from.col]
        newBoard[move.from.row][move.from.col] = 0

        if (move.captured) {
          const captured = newBoard[move.captured.row][move.captured.col]
          if (captured <= 2) capturedP1++
          else capturedP2++
          newBoard[move.captured.row][move.captured.col] = 0
        }

        let newVal = val
        const currentBoardSize = newBoard.length
        if (newVal === 1 && move.to.row === 0) newVal = 2
        else if (newVal === 3 && move.to.row === currentBoardSize - 1) newVal = 4
        newBoard[move.to.row][move.to.col] = newVal
      }

      const nextPlayer = prev.currentPlayer === 1 ? 2 : 1
      const opponentMovesExist = hasAnyMoves(newBoard, nextPlayer)
      const status = opponentMovesExist ? 'playing' as const : 'won' as const

      return {
        board: newBoard,
        currentPlayer: status === 'playing' ? nextPlayer : prev.currentPlayer,
        status,
        winner: status === 'won' ? prev.currentPlayer : undefined,
        moveCount: prev.moveCount + 1,
        capturedP1,
        capturedP2,
      }
    })
  }, [])

  function isAnyCaptureAvailable(board: number[][], player: number): boolean {
    const boardSize = board.length
    for (let r = 0; r < boardSize; r++) {
      for (let c = 0; c < boardSize; c++) {
        const val = board[r][c]
        if (val && getPlayer(val) === player && getAnyCapture(board, r, c, val, boardSize)) {
          return true
        }
      }
    }
    return false
  }

  const handleCellClick = useCallback((row: number, col: number) => {
    if (state.status !== 'playing' || isAIThinking) return

    if (selectedPos) {
      if (validMoves.some(m => m.row === row && m.col === col)) {
        const allMoves = getValidMoves(selectedPos.row, selectedPos.col)
        const matching = allMoves.filter(m => m.to.row === row && m.to.col === col)

        if (matching.length > 0) {
          const movesToApply = matching[0] ? [matching[0]] : matching
          applyMove(movesToApply)
          onMove?.(movesToApply)
          const isCapture = matching[0]?.captured
          const val = state.board[selectedPos.row][selectedPos.col]
          const currentBoardSize = state.board.length
          const promotes = (val === 1 && row === 0) || (val === 3 && row === currentBoardSize - 1)
          setLastEvent({ type: isCapture ? 'capture' : promotes ? 'king' : 'move' })
        }
      }
      setSelectedPos(null)
      setValidMoves([])
    } else {
      const val = state.board[row]?.[col]
      if (val && getPlayer(val) === humanCurrent) {
        const captureAvailable = isAnyCaptureAvailable(state.board, humanCurrent)
        const pieceMoves = getValidMoves(row, col)
        
        const validPieceMoves = captureAvailable 
          ? pieceMoves.filter(m => m.captured)
          : pieceMoves

        if (validPieceMoves.length > 0) {
          setSelectedPos({ row, col })
          setValidMoves(validPieceMoves.map(m => m.to))
        }
      }
    }
  }, [state, selectedPos, validMoves, isAIThinking, getValidMoves, applyMove, humanCurrent])

  const makeAIMove = useCallback(async (moves: Move[]) => {
    applyMove(moves)
    const isCapture = moves.some(m => m.captured)
    setLastEvent({ type: isCapture ? 'capture' : 'move' })
    setIsAIThinking(false)
  }, [applyMove])

  const resetGame = useCallback(() => {
    setState({
      board: createInitialBoard(boardSize),
      currentPlayer: 1,
      status: 'playing',
      moveCount: 0,
      capturedP1: 0,
      capturedP2: 0,
    })
    setSelectedPos(null)
    setValidMoves([])
    setIsAIThinking(false)
    setLastEvent(null)
  }, [boardSize])

  const syncFromServer = useCallback((serverState: {
    board: number[][]
    currentPlayer: number
    status: string
    winner?: number
    moveCount: number
    capturedP1: number
    capturedP2: number
  }) => {
    setState({
      board: serverState.board.map(r => [...r]),
      currentPlayer: serverState.currentPlayer,
      status: serverState.status as 'playing' | 'won' | 'draw',
      winner: serverState.winner,
      moveCount: serverState.moveCount,
      capturedP1: serverState.capturedP1,
      capturedP2: serverState.capturedP2,
    })
    setSelectedPos(null)
    setValidMoves([])
  }, [])

  return {
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
    getPlayer,
  }
}

function getDirections(val: number): [number, number][] {
  const isKing = val === 2 || val === 4
  if (isKing) return [[-1, -1], [-1, 1], [1, -1], [1, 1]]
  return getPlayer(val) === 1 ? [[-1, -1], [-1, 1]] : [[1, -1], [1, 1]]
}

function hasAnyMoves(board: number[][], player: number): boolean {
  const boardSize = board.length
  for (let r = 0; r < boardSize; r++) {
    for (let c = 0; c < boardSize; c++) {
      const val = board[r]?.[c]
      if (!val || getPlayer(val) !== player) continue
      if (getSimpleMoves(board, r, c, val).length > 0) return true
      if (getChainCaptures(board, { row: r, col: c }, val, []).length > 0) return true
    }
  }
  return false
}

function getSimpleMoves(board: number[][], row: number, col: number, val: number): Move[] {
  const moves: Move[] = []
  const dirs = getDirections(val)
  const boardSize = board.length
  for (const [dr, dc] of dirs) {
    const nr = row + dr
    const nc = col + dc
    if (nr < 0 || nr >= boardSize || nc < 0 || nc >= boardSize) continue
    if (!board[nr][nc]) {
      moves.push({ from: { row, col }, to: { row: nr, col: nc } })
    }
  }
  return moves
}

function getCaptures(board: number[][], row: number, col: number): Move[] {
  const val = board[row][col]
  if (!val) return []
  const chains = getChainCaptures(board, { row, col }, val, [])
  if (chains.length === 0) return []
  
  // En el frontend, simplificamos devolviendo solo el primer paso de cada cadena de captura más larga
  const maxLength = Math.max(...chains.map(c => c.length))
  const longestChains = chains.filter(c => c.length === maxLength)
  
  // Para evitar duplicados en 'to'
  const seen = new Set<string>()
  const results: Move[] = []
  
  for (const chain of longestChains) {
    const firstMove = chain[0]
    const key = `${firstMove.to.row},${firstMove.to.col}`
    if (!seen.has(key)) {
      seen.add(key)
      results.push(firstMove)
    }
  }
  
  return results
}

function getChainCaptures(
  board: number[][],
  pos: { row: number; col: number },
  val: number,
  visited: string[]
): Move[][] {
  const results: Move[][] = []
  const directions = [[-1, -1], [-1, 1], [1, -1], [1, 1]]
  const boardSize = board.length
  const player = getPlayer(val)
  const isKing = val === 2 || val === 4

  for (const [dr, dc] of directions) {
    // Si no es rey, solo puede capturar en sus direcciones de movimiento normales
    // Pero en muchas reglas de damas, los peones pueden capturar hacia atrás.
    // Revisando el estándar: en Damas Internacionales/Españolas, peones capturan hacia atrás.
    // Vamos a permitir captura en todas las direcciones para simplificar y ser consistentes con getAnyCapture
    
    const mr = pos.row + dr
    const mc = pos.col + dc
    const lr = pos.row + dr * 2
    const lc = pos.col + dc * 2

    const captureKey = `${mr},${mc}`
    if (
      lr >= 0 && lr < boardSize && lc >= 0 && lc < boardSize &&
      board[mr][mc] && getPlayer(board[mr][mc]) !== player &&
      !board[lr][lc] && !visited.includes(captureKey)
    ) {
      const move: Move = { from: pos, to: { row: lr, col: lc }, captured: { row: mr, col: mc } }
      
      // Simular el movimiento para capturas en cadena
      const nextBoard = board.map(r => [...r])
      nextBoard[pos.row][pos.col] = 0
      nextBoard[mr][mc] = 0
      nextBoard[lr][lc] = val
      
      // Promoción temporal para ver si la cadena continúa como rey
      let nextVal = val
      if (val === 1 && lr === 0) nextVal = 2
      if (val === 3 && lr === boardSize - 1) nextVal = 4

      // Si acaba de promocionar, la cadena se detiene según reglas comunes
      const justPromoted = val !== nextVal
      
      if (justPromoted) {
        results.push([move])
      } else {
        const chains = getChainCaptures(nextBoard, { row: lr, col: lc }, nextVal, [...visited, captureKey])
        if (chains.length > 0) {
          for (const chain of chains) {
            results.push([move, ...chain])
          }
        } else {
          results.push([move])
        }
      }
    }
  }

  return results
}

function getAnyCapture(board: number[][], row: number, col: number, val: number, boardSize: number): boolean {
  const dirs = getDirections(val)
  const player = getPlayer(val)

  for (const [dr, dc] of dirs) {
    const mr = row + dr
    const mc = col + dc
    const lr = row + dr * 2
    const lc = col + dc * 2

    if (lr < 0 || lr >= boardSize || lc < 0 || lc >= boardSize) continue
    const mid = board[mr]?.[mc]
    if (!mid || getPlayer(mid) === player) continue
    if (!board[lr][lc]) return true
  }
  return false
}
