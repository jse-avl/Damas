import { Player, Piece, Move, PieceType } from './types'
import { getAllMoves, applyMove } from './board'
import { evaluate } from './evaluation'

const DIFFICULTY_DEPTH: Record<string, number> = {
  easy: 2,
  medium: 4,
  hard: 6,
}

// Simple transposition table
const memo = new Map<string, number>()

function getBoardHash(board: (Piece | null)[][], aiPlayer: Player, depth: number, maximizing: boolean): string {
  let hash = `${aiPlayer},${depth},${maximizing}:`
  for (let r = 0; r < board.length; r++) {
    for (let c = 0; c < board[r].length; c++) {
      const p = board[r][c]
      if (p) hash += `${r}${c}${p.player === Player.Player1 ? '1' : '2'}${p.type === PieceType.Man ? 'm' : 'k'}`
    }
  }
  return hash
}

function orderMoves(board: (Piece | null)[][], moves: Move[][]): Move[][] {
  const boardSize = board.length
  return moves.sort((a, b) => {
    // Captures are already handled by getAllMoves priority, but we can refine
    const aCaptures = a.filter(m => m.captured).length
    const bCaptures = b.filter(m => m.captured).length
    if (aCaptures !== bCaptures) return bCaptures - aCaptures

    // Bonus for promoting
    const aPromotes = a.some(m => (board[m.from.row][m.from.col]?.player === Player.Player1 && m.to.row === 0) || (board[m.from.row][m.from.col]?.player === Player.Player2 && m.to.row === boardSize - 1))
    const bPromotes = b.some(m => (board[m.from.row][m.from.col]?.player === Player.Player1 && m.to.row === 0) || (board[m.from.row][m.from.col]?.player === Player.Player2 && m.to.row === boardSize - 1))
    if (aPromotes !== bPromotes) return aPromotes ? -1 : 1

    return 0
  })
}

function minimax(
  board: (Piece | null)[][],
  depth: number,
  alpha: number,
  beta: number,
  maximizing: boolean,
  aiPlayer: Player,
): number {
  const hash = getBoardHash(board, aiPlayer, depth, maximizing)
  if (memo.has(hash)) return memo.get(hash)!

  const currentPlayer = maximizing ? aiPlayer : (aiPlayer === Player.Player1 ? Player.Player2 : Player.Player1)
  const moves = getAllMoves(board, currentPlayer)

  if (moves.length === 0) {
    const result = maximizing ? -1000000 : 1000000
    memo.set(hash, result)
    return result
  }

  if (depth === 0) {
    const result = evaluate(board, aiPlayer)
    memo.set(hash, result)
    return result
  }

  const orderedMoves = orderMoves(board, moves)

  if (maximizing) {
    let maxEval = -Infinity
    for (const move of orderedMoves) {
      const newBoard = applyMove(board, move)
      const evalScore = minimax(newBoard, depth - 1, alpha, beta, false, aiPlayer)
      maxEval = Math.max(maxEval, evalScore)
      alpha = Math.max(alpha, evalScore)
      if (beta <= alpha) break
    }
    memo.set(hash, maxEval)
    return maxEval
  } else {
    let minEval = Infinity
    for (const move of orderedMoves) {
      const newBoard = applyMove(board, move)
      const evalScore = minimax(newBoard, depth - 1, alpha, beta, true, aiPlayer)
      minEval = Math.min(minEval, evalScore)
      beta = Math.min(beta, evalScore)
      if (beta <= alpha) break
    }
    memo.set(hash, minEval)
    return minEval
  }
}

export function findBestMove(
  board: (Piece | null)[][],
  aiPlayer: Player,
  difficulty: string = 'medium',
): Move[] | null {
  console.log(`AI thinking... difficulty: ${difficulty}, player: ${aiPlayer}`)
  const start = Date.now()
  memo.clear() // Clear memo at start of each turn

  const depth = DIFFICULTY_DEPTH[difficulty] || 4
  const moves = getAllMoves(board, aiPlayer)

  if (moves.length === 0) return null
  if (moves.length === 1) {
    console.log(`AI finished in ${Date.now() - start}ms (only 1 move)`)
    return moves[0]
  }

  const orderedMoves = orderMoves(board, moves)

  let bestScore = -Infinity
  let bestMove: Move[] = orderedMoves[0]
  let alpha = -Infinity
  let beta = Infinity

  for (const move of orderedMoves) {
    const newBoard = applyMove(board, move)
    const score = minimax(newBoard, depth - 1, alpha, beta, false, aiPlayer)
    if (score > bestScore) {
      bestScore = score
      bestMove = move
    }
    alpha = Math.max(alpha, bestScore)
  }

  console.log(`AI finished in ${Date.now() - start}ms (states: ${memo.size})`)
  return bestMove
}
