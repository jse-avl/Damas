import {
  BOARD_SIZE,
  Player,
  PieceType,
  Piece,
  Position,
  Move,
  GameState,
  cloneBoard,
  isDarkSquare,
  isValidPosition,
} from './types'

function opponent(player: Player): Player {
  return player === Player.Player1 ? Player.Player2 : Player.Player1
}

function getDirections(piece: Piece): [number, number][] {
  if (piece.type === PieceType.King) {
    return [[-1, -1], [-1, 1], [1, -1], [1, 1]]
  }
  if (piece.player === Player.Player1) {
    return [[-1, -1], [-1, 1]]
  }
  return [[1, -1], [1, 1]]
}

export function getSimpleMoves(board: (Piece | null)[][], pos: Position, piece: Piece): Move[] {
  const moves: Move[] = []
  const directions = getDirections(piece)

  for (const [dr, dc] of directions) {
    const nr = pos.row + dr
    const nc = pos.col + dc
    if (!isValidPosition(nr, nc)) continue
    if (!board[nr][nc]) {
      moves.push({ from: pos, to: { row: nr, col: nc } })
    }
  }

  return moves
}

export function getCaptures(board: (Piece | null)[][], pos: Position, piece: Piece): Move[] {
  const captures: Move[] = []
  const directions = getDirections(piece)

  for (const [dr, dc] of directions) {
    const mr = pos.row + dr
    const mc = pos.col + dc
    const lr = pos.row + dr * 2
    const lc = pos.col + dc * 2

    if (!isValidPosition(lr, lc)) continue
    const midPiece = board[mr][mc]
    if (!midPiece || midPiece.player === piece.player) continue
    if (board[lr][lc]) continue

    captures.push({
      from: pos,
      to: { row: lr, col: lc },
      captured: { row: mr, col: mc },
    })
  }

  return captures
}

function getChainCaptures(
  board: (Piece | null)[][],
  pos: Position,
  piece: Piece,
  visited: string[]
): Move[][] {
  const results: Move[][] = []
  const directions = getDirections(piece)

  for (const [dr, dc] of directions) {
    const mr = pos.row + dr
    const mc = pos.col + dc
    const lr = pos.row + dr * 2
    const lc = pos.col + dc * 2

    if (!isValidPosition(lr, lc)) continue
    const midPiece = board[mr][mc]
    if (!midPiece || midPiece.player === piece.player) continue
    if (board[lr][lc]) continue

    const captureKey = `${lr},${lc}`
    if (visited.includes(captureKey)) continue

    const move: Move = {
      from: pos,
      to: { row: lr, col: lc },
      captured: { row: mr, col: mc },
    }

    const newBoard = cloneBoard(board)
    newBoard[mr][mc] = null
    newBoard[lr][lc] = piece
    newBoard[pos.row][pos.col] = null

    const promotedPiece = maybePromote(piece, lr)
    if (promotedPiece.type === PieceType.King) {
      results.push([move])
    } else {
      const chains = getChainCaptures(newBoard, { row: lr, col: lc }, promotedPiece, [...visited, captureKey])
      if (chains.length === 0) {
        results.push([move])
      } else {
        for (const chain of chains) {
          results.push([move, ...chain])
        }
      }
    }
  }

  return results
}

function maybePromote(piece: Piece, row: number): Piece {
  if (piece.type === PieceType.King) return piece
  if (piece.player === Player.Player1 && row === 0) {
    return { ...piece, type: PieceType.King }
  }
  if (piece.player === Player.Player2 && row === BOARD_SIZE - 1) {
    return { ...piece, type: PieceType.King }
  }
  return piece
}

export function getAllMoves(board: (Piece | null)[][], player: Player): Move[][] {
  const allCaptures: Move[][] = []

  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const piece = board[row][col]
      if (!piece || piece.player !== player) continue
      const pos: Position = { row, col }
      const chains = getChainCaptures(board, pos, piece, [])
      allCaptures.push(...chains)
    }
  }

  if (allCaptures.length > 0) {
    return allCaptures
  }

  const simpleMoves: Move[][] = []
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const piece = board[row][col]
      if (!piece || piece.player !== player) continue
      const pos: Position = { row, col }
      const moves = getSimpleMoves(board, pos, piece)
      for (const move of moves) {
        simpleMoves.push([move])
      }
    }
  }

  return simpleMoves
}

export function applyMove(state: GameState, move: Move[]): GameState {
  const newBoard = cloneBoard(state.board)
  const capturedPieces = { ...state.capturedPieces }

  let lastPiece: Piece | null = null

  for (const m of move) {
    const piece = newBoard[m.from.row][m.from.col]
    if (!piece) throw new Error('No piece at source position')

    newBoard[m.from.row][m.from.col] = null

    if (m.captured) {
      const captured = newBoard[m.captured.row][m.captured.col]
      if (captured) {
        capturedPieces[captured.player]++
      }
      newBoard[m.captured.row][m.captured.col] = null
    }

    const promoted = maybePromote(piece, m.to.row)
    newBoard[m.to.row][m.to.col] = promoted
    lastPiece = promoted
  }

  const nextPlayer = state.currentPlayer === Player.Player1 ? Player.Player2 : Player.Player1
  const opponentMoves = getAllMoves(newBoard, nextPlayer)

  let status: GameState['status'] = 'playing'
  let winner: Player | undefined

  if (opponentMoves.length === 0) {
    status = 'won'
    winner = state.currentPlayer
  }

  return {
    board: newBoard,
    currentPlayer: status === 'playing' ? nextPlayer : state.currentPlayer,
    moveHistory: [...state.moveHistory, ...move],
    status,
    winner,
    capturedPieces,
  }
}

export function createInitialState(): GameState {
  return {
    board: (() => {
      const b = Array.from({ length: BOARD_SIZE }, () =>
        Array.from({ length: BOARD_SIZE }, () => null) as (Piece | null)[]
      )
      for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
          if (!isDarkSquare(row, col)) continue
          if (row < 2) {
            b[row][col] = { type: PieceType.Man, player: Player.Player2 }
          } else if (row >= BOARD_SIZE - 2) {
            b[row][col] = { type: PieceType.Man, player: Player.Player1 }
          }
        }
      }
      return b
    })(),
    currentPlayer: Player.Player1,
    moveHistory: [],
    status: 'playing',
    capturedPieces: { [Player.Player1]: 0, [Player.Player2]: 0 },
  }
}

export function isCaptureMove(move: Move[]): boolean {
  return move.some(m => m.captured !== undefined)
}
