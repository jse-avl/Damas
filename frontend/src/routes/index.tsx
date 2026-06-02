import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/')(({
  component: LandingPage,
}))

function Feature({ icon, title, desc, delay = 0 }: { icon: string; title: string; desc: string; delay?: number }) {
  const staggerClass = delay > 0 ? `stagger-${delay}` : ''
  return (
    <div className={`card p-6 animate-fade-in-up ${staggerClass}`}>
      <div className="w-10 h-10 mb-3 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
        <span className="material-symbols-outlined text-lg text-primary">{icon}</span>
      </div>
      <h3 className="text-base font-semibold text-on-surface mb-1">{title}</h3>
      <p className="text-sm text-on-surface-variant leading-relaxed">{desc}</p>
    </div>
  )
}

function LandingPage() {
  return (
    <div className="w-full flex-1 flex flex-col">
      {/* Hero Section */}
      <section className="w-full px-4 sm:px-6 md:px-8 py-16 sm:py-24 md:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-6 font-mono uppercase tracking-wider">
            v2.0 &middot; 3D Board
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-headline font-bold mb-4 accent-gradient">
            Damas 3D
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-on-surface-variant mb-8 max-w-2xl mx-auto leading-relaxed">
            Capture, rey, victoria. Una experiencia moderna de damas con tablero 3D, oponentes IA, juego online y estrategia profunda.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/game" className="btn btn-primary btn-lg">
              <span className="material-symbols-outlined">sports_esports</span>
              Jugar Ahora
            </Link>
            <Link to="/rankings" className="btn btn-secondary btn-lg">
              <span className="material-symbols-outlined">leaderboard</span>
              Rankings
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="w-full px-4 sm:px-6 md:px-8 py-12 sm:py-20 bg-surface-container-low/50 border-t border-b border-outline-variant/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="eyebrow mb-2">MODOS Y CARACTERÍSTICAS</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-headline font-bold">Cómo jugar</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <Feature
              icon="psychology"
              title="IA Inteligente"
              desc="Enfrenta una IA con tres niveles de dificultad. Desde principiante hasta gran maestro con búsqueda profunda."
              delay={1}
            />
            <Feature
              icon="swords"
              title="Modo Local"
              desc="Juega contra un amigo en el mismo dispositivo. Tablero 6x6 o 8x8 con capturas obligatorias."
              delay={2}
            />
            <Feature
              icon="public"
              title="Multijugador Online"
              desc="Emparejamiento en tiempo real con sistema ELO. Cada partida sube en el ranking global."
              delay={3}
            />
            <Feature
              icon="stars"
              title="Skins Personalizadas"
              desc="Personaliza tu tablero y piezas con estilos únicos: desde madera clásica hasta diseños 3D especiales."
              delay={4}
            />
            <Feature
              icon="leaderboard"
              title="Ranking Global"
              desc="Sube posiciones, gana capturas y obtén recompensas cosméticas cada temporada."
              delay={5}
            />
            <Feature
              icon="store"
              title="Marketplace"
              desc="Compra nuevas apariencias en la tienda y mejora tu experiencia de juego."
              delay={6}
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="w-full px-4 sm:px-6 md:px-8 py-12 sm:py-20">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="card-flat p-6 text-center">
              <div className="text-4xl sm:text-5xl font-headline font-bold accent-gradient mb-1">128K</div>
              <p className="text-sm text-on-surface-variant">jugadores activos</p>
            </div>
            <div className="card-flat p-6 text-center">
              <div className="text-4xl sm:text-5xl font-headline font-bold accent-gradient mb-1">4.2M</div>
              <p className="text-sm text-on-surface-variant">capturas este mes</p>
            </div>
            <div className="card-flat p-6 text-center">
              <div className="text-4xl sm:text-5xl font-headline font-bold accent-gradient mb-1">52</div>
              <p className="text-sm text-on-surface-variant">países en el tablero</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full px-4 sm:px-6 md:px-8 py-16 sm:py-24 text-center bg-surface-container-low/30 border-t border-outline-variant/30">
        <div className="max-w-lg mx-auto">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-headline font-bold mb-3">
            Tu movimiento
          </h2>
          <p className="text-base text-on-surface-variant mb-6">
            Gratis para jugar. Sin descargas. Tu ranking se sincroniza en todos tus dispositivos.
          </p>
          <Link to="/game" className="btn btn-primary btn-lg">
            <span className="material-symbols-outlined">sports_esports</span>
            Jugar — Es Gratis
          </Link>
        </div>
      </section>
    </div>
  )
}
