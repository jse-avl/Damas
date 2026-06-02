# Damas 3D ♛

Juego de damas clásico en 3D con arquitectura de microservicios, modo online, marketplace y sistema de pagos.

**Stack:** TanStack Start + React 19 + Tailwind CSS 4 + React Three Fiber 9 + Bun + Hono + MongoDB

---

## Arquitectura

```
┌─────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│   Frontend      │     │    Backend       │     │   AI Service     │
│ (TanStack Start)│────▶│  (Hono + Bun)    │     │  (Minimax + α-β) │
│  :3000          │     │  :4000           │     │  :4001           │
│ React + R3F     │     │ MongoDB          │     │  stateless       │
│ Clerk Auth      │     │ Game Engine      │     │  POST /ai/move   │
└─────────────────┘     └────────┬─────────┘     └──────────────────┘
                                 │
                          ┌──────▼──────┐
                          │   MongoDB   │
                          │  :27017     │
                          └─────────────┘
```

## Requisitos

- [Bun](https://bun.sh) >= 1.3
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (opcional, para MongoDB)

## Inicio rápido

### Con Docker

```bash
docker compose up
```

### Sin Docker (desarrollo local)

Necesitas MongoDB corriendo en `localhost:27017`.

```bash
# Terminal 1 - Backend
cd backend
bun install
bun run src/index.ts

# Terminal 2 - AI Service
cd ai-service
bun install
bun run src/index.ts

# Terminal 3 - Frontend
cd frontend
bun install
bun run dev
```

Abrir [http://localhost:3000](http://localhost:3000)

---

## Modos de juego

### PvE (Jugador vs Bot)
- Juegas con las fichas rojas (Jugador 1)
- El bot juega con las fichas azules (Jugador 2)
- 3 dificultades: Fácil (2 ply), Medio (4 ply), Difícil (6 ply)
- El bot usa Minimax con poda Alpha-Beta

### PvP Local
- Dos jugadores se turnan en el mismo dispositivo
- Jugador 1: fichas rojas, Jugador 2: fichas azules

### PvP Online
- Matchmaking automático via SSE (Server-Sent Events)
- Requiere iniciar sesión con Clerk
- Turnos sincronizados en tiempo real
- Skins visibles para el oponente

---

## Reglas de Damas implementadas

- Tablero **6×6** u **8×8** con casillas oscuras y claras
- **6 fichas por jugador** (filas 1-2 vs filas 5-6) en 6×6; **12 fichas** en 8×8
- Movimiento diagonal **hacia adelante** (1 casilla)
- **Captura obligatoria** (salto por encima)
- **Captura múltiple encadenada**
- **Promoción a reina** al llegar al extremo opuesto
- La reina se mueve en **cualquier dirección diagonal**
- Victoria al capturar todas las fichas del oponente o dejarlo sin movimientos

---

## API Endpoints

### Backend (`:4000`)

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/health` | Health check |
| `POST` | `/api/games` | Crear partida (PvE) |
| `POST` | `/api/games/join` | Matchmaking online |
| `GET` | `/api/games/:id` | Obtener partida |
| `POST` | `/api/games/:id/moves` | Realizar movimiento |
| `GET` | `/api/games/:id/events` | SSE — suscripción a cambios |
| `GET` | `/api/games` | Listar partidas del usuario |
| `GET` | `/api/rankings` | Leaderboard (filtro por modo) |
| `GET` | `/api/marketplace/items` | Items de la tienda |
| `POST` | `/api/marketplace/buy` | Comprar item (monedas) |
| `GET` | `/api/marketplace/inventory` | Inventario del usuario |
| `POST` | `/api/marketplace/equip` | Equipar tablero/fichas |
| `POST` | `/api/auth/webhook` | Webhook Clerk (Svix) |
| `GET` | `/api/auth/profile` | Perfil del usuario |
| `GET` | `/api/payments/packs` | Paquetes de monedas |
| `POST` | `/api/payments/create-checkout` | Stripe Checkout |
| `POST` | `/api/payments/webhook` | Webhook Stripe |

### AI Service (`:4001`)

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/ai/health` | Health check |
| `POST` | `/api/ai/move` | Calcular mejor jugada |

---

## Marketplace & Skins

### Tableros disponibles

| Skin | Precio | Descripción |
|------|--------|-------------|
| Clásico | Gratis | Madera tradicional |
| Ébano | 100 | Madera oscura pulida |
| Verde | 180 | Tapete de fieltro verde |
| Dorado | 250 | Pan de oro con incrustaciones |
| Mármol | 300 | Mármol blanco con vetas grises |
| Desierto | 350 | Arena dorada del Sahara al atardecer |
| Travertino | 350 | Piedra natural beige |
| Otoñal | 400 | Hojas secas de arce en madera rústica |
| Oceánico | 400 | Aguas profundas del océano |
| Sakura | 450 | Pétalos de cerezo sobre madera clara |
| Circuito F1 | 450 | Asfalto de circuito de carreras |
| Volcánico | 500 | Lava incandescente entre roca volcánica |
| Glaciar | 500 | Hielo polar con reflejos cristalinos |
| Tóxico | 500 | Residuos radiactivos con brillo fosforescente |
| Cosmos | 550 | Nebulosas y estrellas en el espacio profundo |
| Cyberpunk | 600 | Neón magenta y cian sobre asfalto mojado |

### Fichas disponibles

| Skin | Precio | Descripción |
|------|--------|-------------|
| Clásicas | Gratis | Plástico estándar |
| Esmeralda | 150 | Gemas esmeralda talladas |
| Rubí | 200 | Rubíes facetados |
| Cristal | 250 | Cristal transparente iridiscente |
| Ónix | 180 | Piedra ónix y cuarzo |
| Travertino | 220 | Piedra travertino natural |
| Perla | 300 | Perlas iridiscentes |
| Obsidiana | 280 | Vidrio volcánico negro |
| **F1** | **350** | **Monoplazas de Fórmula 1 (modelo 3D)** |
| **Prisma** | **400** | **Cristal prismático con efecto arcoíris** |

### Monedas (Stripe)

| Paquete | Monedas | Precio |
|---------|---------|--------|
| Pequeño | 100 | $1.00 |
| Estándar | 500 | $4.00 |
| Grande | 1200 | $9.00 |
| Premium | 3000 | $20.00 |

---

## Fichas Temáticas

Además de las skins clásicas, el juego soporta fichas temáticas con modelos 3D reales. Los modelos `.glb` se cargan con `useGLTF` de `@react-three/drei`:

```tsx
import { useGLTF } from '@react-three/drei'

function MyPieceModel({ url }: { url: string }) {
  const { scene } = useGLTF(url)
  return <primitive object={scene} scale={0.8} />
}
```

Cada modelo se coloca en `frontend/public/models/` y se referencia desde `PIECE_SKINS` en `constants.ts`.

### Sets disponibles

| Set | Piezas | Precio | Descripción |
|-----|--------|--------|-------------|
| **Pokémon** | Pikachu vs Charmander | 500 | Modelos low-poly CC0 |
| **Mario** | Mario vs Bowser | 500 | Modelos inspirados en el fontanero |
| **Zelda** | Link vs Ganon | 500 | Héroes y villanos de Hyrule |
| **Autos** | Muscle vs Sport | 450 | Autos low-poly (Quaternius CC0) |
| **Espacio** | Alien vs Astronauta | 550 | Modelos del Ultimate Space Kit |
| **Fantasía** | Dragón vs Mago | 550 | Criaturas místicas low-poly |
| **Animales** | Perro vs Gato | 400 | Mascotas en 3D |
| **Comida** | Pizza vs Donut | 350 | Comida chibi en 3D |

---

## Características

- 🎮 **PvE, PvP Local y Online** — Tres modos de juego
- 🤖 **IA con Minimax + poda Alpha-Beta** — 3 niveles de dificultad
- 🏆 **Rankings** — Menor cantidad de movimientos/tiempo para ganar
- 🎨 **Marketplace** — 26 skins de tableros y fichas (monedas + Stripe)
- 🔐 **Auth** — Autenticación con Clerk (login/registro)
- 🏎️ **Ficha F1 3D** — Monoplaza modelado proceduralmente en Three.js
- 🎵 **Sonidos** — Efectos generativos con Web Audio API
- 🎲 **Tablero 3D** — Renderizado con React Three Fiber (vistas 3D y planta)
- 🏗️ **Microservicios** — Frontend, Backend, DB e IA separados
- 🪙 **Economía** — Monedas virtuales + pagos reales con Stripe
- 📡 **SSE en tiempo real** — Partidas online sincronizadas

---

## Estructura del proyecto

```
Damas/
├── frontend/              # TanStack Start (SSR + R3F)
│   ├── src/
│   │   ├── routes/               # File-based routing
│   │   │   ├── __root.tsx        # Root layout (nav, sidebar, mobile)
│   │   │   ├── index.tsx         # Landing page
│   │   │   ├── game/route.tsx    # Game layout
│   │   │   ├── game/index.tsx    # Lobby (modo, dificultad, tamaño)
│   │   │   ├── game/$gameId.tsx  # Partida con tablero 3D
│   │   │   ├── auth/login.tsx    # Login (Clerk)
│   │   │   ├── auth/register.tsx # Registro (Clerk)
│   │   │   ├── rankings.tsx      # Salón de la fama
│   │   │   └── marketplace.tsx   # Tienda + paquetes de monedas
│   │   ├── components/game/
│   │   │   ├── Board3D.tsx       # R3F 3D board + fichas animadas + F1
│   │   │   ├── GameInfo.tsx      # Turno/movimientos/capturas/ganador
│   │   │   └── SoundManager.tsx  # Web Audio API
│   │   ├── hooks/
│   │   │   ├── useGame.ts       # Game state machine (PvE + PvP)
│   │   │   ├── useAI.ts         # AI service client
│   │   │   └── useOnlineGame.ts # SSE + matchmaking online
│   │   ├── lib/
│   │   │   ├── api.ts           # API client (fetch wrappers)
│   │   │   └── constants.ts     # Skins, colores, constantes
│   │   ├── router.tsx           # TanStack Router
│   │   ├── routeTree.gen.ts     # Árbol de rutas generado
│   │   ├── start.tsx            # TanStack Start (Clerk middleware)
│   │   └── styles/app.css       # Tailwind + animaciones + tema
│   ├── public/
│   │   └── favicon.svg          # ♛ Favicon
│   ├── Dockerfile
│   ├── vite.config.ts
│   └── package.json
├── backend/               # Hono API server
│   ├── src/
│   │   ├── index.ts            # Hono app entry + rutas
│   │   ├── game-engine/
│   │   │   ├── types.ts        # Board, Piece, Player, GameState
│   │   │   └── rules.ts        # Movimiento, capturas, promoción
│   │   ├── routes/
│   │   │   ├── games.ts        # CRUD partidas + SSE + join
│   │   │   ├── rankings.ts     # GET /api/rankings
│   │   │   ├── marketplace.ts  # Items, buy, inventory, equip
│   │   │   ├── auth.ts         # Clerk webhook + profile
│   │   │   └── payments.ts     # Stripe packs + checkout + webhook
│   │   ├── middleware/
│   │   │   └── auth.ts         # JWT Clerk + dev fallback
│   │   ├── models/
│   │   │   └── types.ts        # Document types (Game, User, etc.)
│   │   └── lib/
│   │       ├── db.ts           # MongoDB connection + indexes
│   │       └── response.ts     # Helpers success/error
│   ├── Dockerfile
│   └── package.json
├── ai-service/            # AI microservicio stateless
│   ├── src/
│   │   ├── index.ts           # POST /api/ai/move + health
│   │   ├── types.ts           # Board types + serialize/deserialize
│   │   ├── board.ts           # Generación de movimientos
│   │   ├── engine.ts          # Minimax + Alpha-Beta poda
│   │   └── evaluation.ts      # Función heurística
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
├── AGENTS.md                  # Instrucciones del proyecto
├── DESIGN.md                  # Diseño de UI (Stitch)
├── .env.example               # Variables de entorno
├── Damas.prd                  # PRD original
└── README.md
```

## Nota técnica: A* vs Minimax

El PRD original menciona A*, pero para juegos adversariales por turnos (como Damas), el algoritmo estándar y más eficiente es **Minimax con poda Alpha-Beta**. A* está diseñado para pathfinding de agente único. Minimax evalúa el árbol de juego considerando las respuestas del oponente, que es exactamente lo que necesita un motor de Damas.

### Detalles de implementación

La IA está en `ai-service/src/engine.ts` e incluye:

| Componente | Archivo | Descripción |
|------------|---------|-------------|
| **Minimax** | `engine.ts:42` | Árbol de juego con profundidad configurable por dificultad |
| **Poda Alpha-Beta** | `engine.ts:77,88` | Poda de ramas no prometedoras (α = mejor para maximizador, β = mejor para minimizador) |
| **Ordenación de movimientos** | `engine.ts:25` | Capturas y promociones primero para poda más eficiente |
| **Tabla de transposición** | `engine.ts:12` | Memoización de estados ya evaluados para evitar recomputación |
| **Función heurística** | `evaluation.ts` | Evalúa material, posición, seguridad de reyes y capturas potenciales |
| **Dificultades** | `engine.ts:5-9` | Fácil (2 ply), Medio (4 ply), Difícil (6 ply) |
