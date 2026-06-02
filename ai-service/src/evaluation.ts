import { BOARD_SIZE, Player, PieceType, Piece } from './types'

const PIECE_VALUE = 100
const KING_VALUE = 300
const ADVANCEMENT_BONUS = 10

const POSITION_TABLE: number[][] = (() => {
  const table: number[][] = Array.from({ length: BOARD_SIZE }, () =>
    Array.from({ length: BOARD_SIZE }, () => 0)
  )
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if ((r + c) % 2 === 0) continue
      const centerDist = Math.abs(c - (BOARD_SIZE - 1) / 2)
      table[r][c] = Math.max(0, 5 - centerDist) * 2
    }
  }
  return table
})()

export function evaluate(board: (Piece | null)[][], aiPlayer: Player): number {
  let score = 0
  const boardSize = board.length

  for (let row = 0; row < boardSize; row++) {
    for (let col = 0; col < boardSize; col++) {
      const piece = board[row][col]
      if (!piece) continue

      const sign = piece.player === aiPlayer ? 1 : -1

      if (piece.type === PieceType.King) {
        score += sign * KING_VALUE
      } else {
        score += sign * PIECE_VALUE
        score += sign * ADVANCEMENT_BONUS * (piece.player === Player.Player1 ? boardSize - 1 - row : row)
      }

      // Add position-based bonus (could be more sophisticated)
      const distFromCenter = Math.abs(row - (boardSize - 1) / 2) + Math.abs(col - (boardSize - 1) / 2)
      score += sign * (5 - distFromCenter)
    }
  }

  return score
}
