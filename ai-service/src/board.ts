import {
  BOARD_SIZE,
  Player,
  PieceType,
  Piece,
  Position,
  Move,
  cloneBoard,
  isValidPosition,
} from './types'

export function getAllMoves(board: (Piece | null)[][], player: Player): Move[][] {
  const moves: Move[][] = []
  const boardSize = board.length

  for (let r = 0; r < boardSize; r++) {
    for (let c = 0; c < boardSize; c++) {
      const piece = board[r][c]
      if (piece && piece.player === player) {
        moves.push(...getPieceMoves(board, { row: r, col: c }, piece))
      }
    }
  }

  // Mandatory capture rule
  const captures = moves.filter(m => m[0].captured)
  if (captures.length > 0) {
    const maxLength = Math.max(...captures.map(c => c.length))
    return captures.filter(c => c.length === maxLength)
  }

  return moves
}

function getPieceMoves(board: (Piece | null)[][], pos: Position, piece: Piece): Move[][] {
  const captures = getChainCaptures(board, pos, piece, [])
  if (captures.length > 0) return captures

  const results: Move[][] = []
  const directions = getDirections(piece)
  const boardSize = board.length

  for (const [dr, dc] of directions) {
    const nr = pos.row + dr
    const nc = pos.col + dc

    if (nr >= 0 && nr < boardSize && nc >= 0 && nc < boardSize && !board[nr][nc]) {
      results.push([{ from: pos, to: { row: nr, col: nc } }])
    }
  }

  return results
}

function getChainCaptures(
  board: (Piece | null)[][],
  pos: Position,
  piece: Piece,
  visited: string[]
): Move[][] {
  const results: Move[][] = []
  const directions = [[-1, -1], [-1, 1], [1, -1], [1, 1]]
  const boardSize = board.length

  for (const [dr, dc] of directions) {
    const mr = pos.row + dr
    const mc = pos.col + dc
    const lr = pos.row + dr * 2
    const lc = pos.col + dc * 2

    const captureKey = `${mr},${mc}`
    if (
      lr >= 0 && lr < boardSize && lc >= 0 && lc < boardSize &&
      board[mr][mc] && board[mr][mc]?.player !== piece.player &&
      !board[lr][lc] && !visited.includes(captureKey)
    ) {
      const move: Move = { from: pos, to: { row: lr, col: lc }, captured: { row: mr, col: mc } }
      const newBoard = applyMove(board, [move])
      
      const promotedPiece = maybePromote(piece, lr, boardSize)
      const justPromoted = piece.type === PieceType.Man && promotedPiece.type === PieceType.King

      if (justPromoted) {
        results.push([move])
      } else {
        const chains = getChainCaptures(newBoard, { row: lr, col: lc }, promotedPiece, [...visited, captureKey])
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

function getDirections(piece: Piece): [number, number][] {
  if (piece.type === PieceType.King) {
    return [[-1, -1], [-1, 1], [1, -1], [1, 1]]
  }
  return piece.player === Player.Player1
    ? [[-1, -1], [-1, 1]]
    : [[1, -1], [1, 1]]
}

function maybePromote(piece: Piece, row: number, boardSize: number): Piece {
  if (piece.type === PieceType.King) return piece
  if (piece.player === Player.Player1 && row === 0) {
    return { ...piece, type: PieceType.King }
  }
  if (piece.player === Player.Player2 && row === boardSize - 1) {
    return { ...piece, type: PieceType.King }
  }
  return piece
}

export function applyMove(board: (Piece | null)[][], move: Move[]): (Piece | null)[][] {
  const newBoard = cloneBoard(board)
  for (const m of move) {
    const piece = newBoard[m.from.row][m.from.col]
    if (!piece) throw new Error('No piece at source')
    newBoard[m.from.row][m.from.col] = null
    if (m.captured) {
      newBoard[m.captured.row][m.captured.col] = null
    }
    const promoted = maybePromote(piece, m.to.row, newBoard.length)
    newBoard[m.to.row][m.to.col] = promoted
  }
  return newBoard
}
