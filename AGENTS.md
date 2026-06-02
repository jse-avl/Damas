# Damas 3D — Project Instructions

## Stack
- **Frontend**: TanStack Start + React 19 + Tailwind CSS 4 + React Three Fiber 9
- **Backend**: Hono 4 + Bun 1.3
- **AI Service**: Hono + Minimax with Alpha-Beta pruning
- **Database**: MongoDB 7 (via `mongodb` driver, not Mongoose)
- **Auth**: Clerk (`@clerk/tanstack-react-start`)
- **Runtime**: Bun (all services)

## Architecture (Microservices)

```
Frontend (:3000)  ───►  Backend (:4000)  ───►  MongoDB (:27017)
                             │
                      AI Service (:4001)  [stateless, POST /api/ai/move]
```

## Project Structure

```
Damas/
├── frontend/           # TanStack Start SSR app
│   ├── src/
│   │   ├── routes/             # File-based routing
│   │   │   ├── __root.tsx      # Root layout (html, head, nav)
│   │   │   ├── index.tsx       # Landing page
│   │   │   ├── game/route.tsx  # Game layout
│   │   │   ├── game/index.tsx  # Lobby (mode/difficulty selector)
│   │   │   ├── game/$gameId.tsx # Game page with 3D board
│   │   │   ├── auth/login.tsx
│   │   │   ├── auth/register.tsx
│   │   │   ├── rankings.tsx
│   │   │   ├── marketplace.tsx
│   │   │   └── api.ts          # API proxy route
│   │   ├── components/game/
│   │   │   ├── Board3D.tsx     # R3F 3D board + animated pieces
│   │   │   ├── GameInfo.tsx    # Turn/move/winner display
│   │   │   └── SoundManager.tsx # Web Audio API sounds
│   │   ├── hooks/
│   │   │   ├── useGame.ts     # Game state machine (PvE + PvP)
│   │   │   └── useAI.ts      # AI service client
│   │   ├── lib/
│   │   │   ├── api.ts         # API client (fetch wrappers)
│   │   │   └── constants.ts   # Colors, sizes
│   │   ├── router.tsx
│   │   ├── routeTree.gen.ts
│   │   └── styles/app.css
│   ├── app.config.ts
│   ├── vite.config.ts
│   └── package.json
├── backend/            # Hono API server
│   ├── src/
│   │   ├── index.ts           # Hono app entry
│   │   ├── game-engine/
│   │   │   ├── types.ts       # Board, Piece, Player, GameState types
│   │   │   └── rules.ts       # Move validation, capture chains, promotion
│   │   ├── routes/
│   │   │   ├── games.ts       # POST /api/games, GET/:id, POST/:id/moves
│   │   │   ├── rankings.ts    # GET /api/rankings
│   │   │   ├── marketplace.ts # GET /items, POST /buy, /equip
│   │   │   └── auth.ts        # POST /webhook, GET /profile
│   │   ├── middleware/auth.ts
│   │   ├── models/types.ts
│   │   └── lib/db.ts          # MongoDB connection
│   └── package.json
├── ai-service/         # Stateless AI microservice
│   ├── src/
│   │   ├── index.ts          # POST /api/ai/move
│   │   ├── types.ts          # Board types
│   │   ├── board.ts          # Move generation
│   │   ├── engine.ts         # Minimax + Alpha-Beta
│   │   └── evaluation.ts     # Heuristic function
│   └── package.json
├── docker-compose.yml
├── AGENTS.md
├── README.md
├── Damas.prd
└── .env.example
```

## Conventions

### Code style
- No JSDoc comments unless the logic is non-obvious
- No explanatory comments above code blocks
- Prefer `const` over `let`, `function` keyword for top-level exports
- Tailwind CSS for all styling (no CSS modules or styled-components)
- TypeScript strict mode across all services

### Game engine (board representation)
- Board is `number[][]` (6×6), values: 0=empty, 1=P1Man, 2=P1King, 3=P2Man, 4=P2King
- Dark squares only: `(row + col) % 2 === 1`
- Player 1 moves downward (increasing row), Player 2 moves upward
- Captures are mandatory; chain captures are required when available

### API patterns
- All responses: `{ success: true, data }` or `{ success: false, error: { code, message } }`
- AI service receives board as `number[][]`, returns `{ moves: Move[], board: number[][] }`
- Auth via Clerk JWTs in `Authorization: Bearer <token>` header

## Verification commands
```bash
# Backend TypeScript check
cd backend && bunx tsc --noEmit

# AI service TypeScript check
cd ai-service && bunx tsc --noEmit

# Backend start (requires MongoDB)
cd backend && bun run src/index.ts

# AI service start
cd ai-service && bun run src/index.ts

# Frontend dev server
cd frontend && bun run dev

# Full stack with Docker
docker compose up
```

## Custom commands

### `/reboot`
Run from project root. Stops all containers, removes volumes, prunes builder cache, then rebuilds and starts everything fresh:
```powershell
docker compose down -v
docker builder prune -af
docker compose up --build -d
```

## Testing approach
- Game engine unit tests: test move generation, capture chains, king promotion
- API tests: test game creation, move submission, win detection
- AI tests: verify valid moves returned, heuristic consistency
