# Damas Imperial — Design System

> Category: Gaming / Board Game
> Dark fantasy artifact aesthetic. Warm gold on charcoal, Playfair Display + DM Sans, glassmorphic panels with runic details.

## 1. Visual Theme & Atmosphere

Damas Imperial evokes a **dark fantasy artifact** — as if the game board were unearthed from an ancient tomb, still warm with residual magic. The entire experience rests on a deep charcoal canvas (`#0a0806`) with gold as the sole accent color, creating extreme contrast that suggests buried treasure illuminated by candlelight.

The signature visual gesture is **glassmorphism meets medieval illumination**: UI panels float like dark-stained glass with gold-chased borders, while the background breathes with subtle amber ambient light and a faint parchment-like noise texture. Gold is never flat — it uses linear gradients with a shimmer animation that suggests molten metal cooling.

**Key Characteristics:**
- Single-accent palette: gold (`#c49a3c` → `#e8c46a`) against deep charcoal (`#0a0806` → `#16110d`)
- Playfair Display for all headings — high-contrast serif with editorial gravitas
- DM Sans for UI labels — clean, geometric, always uppercase with wide tracking
- Glassmorphic panels with `backdrop-filter: blur(12px)` and gold-tinted borders
- Gold shimmer animation on primary text and CTAs
- 8px base spacing grid with 24px gutters
- 12-column grid for menus, fluid single-column for game
- Noise texture overlay on backgrounds for tactile depth
- Runic decorations as subtle easter eggs (ᚠ ᚢ ᚦ ᚨ ᚱ ᚲ)

## 2. Color Palette & Roles

### Surface & Background
| Token | Value | Usage |
|-------|-------|-------|
| `--surface` | `#16110d` | Primary surface |
| `--surface-dim` | `#0f0b08` | Dimmed surface |
| `--surface-bright` | `#2a221c` | Bright surface |
| `--surface-container-lowest` | `#080605` | Deepest background |
| `--surface-container-low` | `#1a1511` | Low container |
| `--surface-container` | `#1f1914` | Default container |
| `--surface-container-high` | `#2a221c` | Elevated container |
| `--surface-container-highest` | `#352c25` | Highest container |
| `--on-surface` | `#e6d7b8` | Text on surface |
| `--on-surface-variant` | `#b8a080` | Muted text |
| `--background` | `#0a0806` | Page background |

### Primary (Gold)
| Token | Value | Usage |
|-------|-------|-------|
| `--primary` | `#c49a3c` | Gold base |
| `--on-primary` | `#1f1500` | Text on gold |
| `--primary-container` | `#9a7530` | Darker gold for containers |
| `--on-primary-container` | `#ffdd88` | Light gold text |
| `--primary-fixed` | `#e8c46a` | Bright gold highlight |
| `--primary-fixed-dim` | `#c49a3c` | Dimmed gold |
| `--inverse-primary` | `#c49a3c` | Inverted gold |

### Semantic
| Token | Value | Usage |
|-------|-------|-------|
| `--error` | `#c44a4a` | Errors, opponent captures |
| `--error-container` | `#6b1a1a` | Error background |
| `--outline` | `#6b5a42` | Borders |
| `--outline-variant` | `#3d2e1e` | Subtle borders |

### Player Colors
| Token | Value | Usage |
|-------|-------|-------|
| `--p1` | `#8b1a1a` | Player 1 (red) |
| `--p1-dark` | `#5c0e0e` | Player 1 dark |
| `--p1-glow` | `rgba(139, 26, 26, 0.15)` | Player 1 glow |
| `--p2` | `#4a6741` | Player 2 (green) |
| `--p2-dark` | `#2f4229` | Player 2 dark |
| `--p2-glow` | `rgba(74, 103, 65, 0.15)` | Player 2 glow |

## 3. Typography Rules

### Font Families
- **Headlines**: `Playfair Display`, serif — high-contrast, editorial weight, for all display text
- **Body**: `DM Sans`, sans-serif — clean geometric for UI text
- **Labels**: `DM Sans`, sans-serif — always uppercase, wide tracking (0.1em+)

### Type Scale
| Role | Font | Size | Weight | Line Height | Letter Spacing |
|------|------|------|--------|-------------|----------------|
| display-hero | Playfair Display | 72px (4.5rem) | 800 | 1.05 | -0.02em |
| display-lg | Playfair Display | 48px (3rem) | 700 | 1.1 | -0.01em |
| display-md | Playfair Display | 36px (2.25rem) | 700 | 1.15 | -0.01em |
| headline-xl | Playfair Display | 32px (2rem) | 700 | 1.2 | normal |
| headline-lg | Playfair Display | 28px (1.75rem) | 600 | 1.25 | normal |
| headline-md | Playfair Display | 24px (1.5rem) | 600 | 1.3 | normal |
| headline-sm | Playfair Display | 20px (1.25rem) | 600 | 1.3 | normal |
| body-lg | DM Sans | 18px (1.125rem) | 400 | 1.6 | normal |
| body-md | DM Sans | 16px (1rem) | 400 | 1.5 | normal |
| body-sm | DM Sans | 14px (0.875rem) | 400 | 1.5 | normal |
| label-lg | DM Sans | 14px | 600 | 1.2 | 0.08em |
| label-md | DM Sans | 12px | 700 | 1.2 | 0.1em |
| label-sm | DM Sans | 10px | 700 | 1.2 | 0.15em |

### Gold Text Treatment
Headlines use a gold gradient shimmer:
```css
background: linear-gradient(135deg, #e8c46a, #c49a3c, #9a7530, #c49a3c);
background-size: 200% 200%;
-webkit-background-clip: text;
-webkit-text-fill-color: transparent;
background-clip: text;
```

## 4. Layout & Spacing

- **Base unit**: 8px
- **Gutter**: 24px
- **Container max**: 1200px
- **Margin mobile**: 16px
- **Margin desktop**: 48px
- **Grid**: 12 columns for menus/lobbies, fluid for game
- **Game area**: Full viewport height, 3D canvas fills remaining space

### Surface Elevation
| Level | Description |
|-------|-------------|
| 0 | No elevation — background only |
| 1 | Glass card with 1px gold border (0.12 opacity) |
| 2 | Glass card with shadow + hover gold border (0.25 opacity) |
| 3 | Modal/dialog with strong shadow + gold top border (scroll roll) |

## 5. Components

### Glass Cards
```
background: linear-gradient(145deg, rgba(31, 25, 20, 0.92), rgba(15, 11, 8, 0.95));
backdrop-filter: blur(12px);
border: 1px solid rgba(196, 154, 60, 0.12);
box-shadow: 0 2px 20px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(196, 154, 60, 0.06);
```

### Buttons
**Primary (Gold)**:
```
background: linear-gradient(180deg, #c49a3c, #8a6b2a);
border: 1px solid #e8c46a;
color: #0a0806;
```
Hover: brighter shadow, slight translateY(-1px). Includes shimmer sweep overlay.

**Secondary (Ghost)**:
```
background: transparent;
border: 1px solid rgba(196, 154, 60, 0.2);
color: #e6d7b8;
```

### Ornate Divider
A 2px gradient line with gold diamond end caps (⚜). Used between major sections.

### Player Avatar (Hexagonal Badge)
```
clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
background: linear-gradient(135deg, rgba(31,25,20,0.9), rgba(22,17,13,0.95));
border: 2px solid gold/half-opacity gold;
```

### Game Over Modal (Proclamation Scroll)
- Scroll roll top/bottom: gold gradient bars with subtle shadows
- Title in gold shimmer
- Stats in three-column layout with gold/red/green backgrounds
- Confetti particles on win

## 6. Motion & Animation

### Entrance Animations
- `fadeInUp` — 0.6s ease-out, for staggered card reveals
- `scaleInBounce` — 0.5s ease-out, for modal appearance
- `fadeIn` — 0.5s ease-out, for banners

### Ambient Animations
- `glowPulse` — 3s infinite, for active player border
- `goldShimmer` — 3s infinite, for gold text
- `floatSlow` — 4s infinite, for idle pieces
- `dotPulse` — 1.8s infinite, for "thinking" indicator
- `candleFlicker` — 2.5s infinite, for decorative elements

### Game-Specific
- `confettiFall` — 1.5-3s, for win celebration
- `spinSlow` — 6s infinite, for loading spinner
- `trophyGlow` — 2s infinite, for victory icon

## 7. Dark Square Pattern

The board uses an alternating pattern where `(row + col) % 2 === 1` marks playable dark squares. Standard colors:
- Dark squares: `#3d2b1a` (warm dark brown, adjustable via skins)
- Light squares: `#e8d5b7` (warm cream, adjustable via skins)
- Selected: `#c9a84c` (gold)
- Valid move highlight: `rgba(201, 168, 76, 0.6)`

## 8. Responsive Behavior

- **Mobile (< 640px)**: Single column layout, 16px margins, sidebar hidden behind toggle
- **Tablet (640-1024px)**: Two-column grid, collapsible sidebar
- **Desktop (> 1024px)**: Full layout with persistent sidebar, 48px margins
- **Game page**: Full viewport height, sidebar is toggleable drawer (w-80)
- **Navbar**: Hidden on game page, fixed position elsewhere with backdrop blur
