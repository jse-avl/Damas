export const BOARD_SIZE = 6
export const PIECES_PER_PLAYER = 6
export const DARK_SQUARE_CONDITION = (row: number, col: number) => (row + col) % 2 === 1

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
  moveHistory: Move[]
  status: 'playing' | 'won' | 'draw'
  winner?: Player
  capturedPieces: { [Player.Player1]: number; [Player.Player2]: number }
}

export function isDarkSquare(row: number, col: number): boolean {
  return DARK_SQUARE_CONDITION(row, col)
}

export function isValidPosition(row: number, col: number): boolean {
  return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE
}

export function createInitialBoard(): (Piece | null)[][] {
  const board: (Piece | null)[][] = Array.from({ length: BOARD_SIZE }, () =>
    Array.from({ length: BOARD_SIZE }, () => null)
  )

  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (!isDarkSquare(row, col)) continue
      if (row < 2) {
        board[row][col] = { type: PieceType.Man, player: Player.Player2 }
      } else if (row >= BOARD_SIZE - 2) {
        board[row][col] = { type: PieceType.Man, player: Player.Player1 }
      }
    }
  }

  return board
}

export function cloneBoard(board: (Piece | null)[][]): (Piece | null)[][] {
  return board.map(row => row.map(cell => (cell ? { ...cell } : null)))
}
