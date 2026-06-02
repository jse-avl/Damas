export const BOARD_SIZE = 6

export enum Player {
  Player1 = 1,
  Player2 = 2,
}

export enum PieceType {
  Man = 'man',
  King = 'king',
}

export interface Piece {
  type: PieceType
  player: Player
}

export interface Position {
  row: number
  col: number
}

export interface Move {
  from: Position
  to: Position
  captured?: Position
}

export interface GameState {
  board: (Piece | null)[][]
  currentPlayer: Player
}

export function isDarkSquare(row: number, col: number): boolean {
  return (row + col) % 2 === 1
}

export function isValidPosition(row: number, col: number, boardSize: number): boolean {
  return row >= 0 && row < boardSize && col >= 0 && col < boardSize
}

export function cloneBoard(board: (Piece | null)[][]): (Piece | null)[][] {
  return board.map(row => row.map(cell => (cell ? { ...cell } : null)))
}

export function serializeBoard(board: (Piece | null)[][]): number[][] {
  return board.map(row =>
    row.map(cell => {
      if (!cell) return 0
      if (cell.player === Player.Player1 && cell.type === PieceType.Man) return 1
      if (cell.player === Player.Player1 && cell.type === PieceType.King) return 2
      if (cell.player === Player.Player2 && cell.type === PieceType.Man) return 3
      if (cell.player === Player.Player2 && cell.type === PieceType.King) return 4
      return 0
    })
  )
}

export function deserializeBoard(data: number[][]): (Piece | null)[][] {
  return data.map(row =>
    row.map(val => {
      if (val === 1) return { player: Player.Player1, type: PieceType.Man }
      if (val === 2) return { player: Player.Player1, type: PieceType.King }
      if (val === 3) return { player: Player.Player2, type: PieceType.Man }
      if (val === 4) return { player: Player.Player2, type: PieceType.King }
      return null
    })
  )
}
