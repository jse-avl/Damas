import { Outlet, createRootRoute, Link, HeadContent, Scripts, useRouterState } from '@tanstack/react-router'
import { ClerkProvider, UserButton, SignInButton, useUser } from '@clerk/tanstack-react-start'
import { useRef, useState, useEffect } from 'react'
import '../styles/app.css'

export const Route = createRootRoute({
  component: RootLayout,
  notFoundComponent: () => (
    <div className="min-h-screen w-full flex items-center justify-center bg-background px-4">
      <div className="text-center max-w-md mx-auto py-12">
        <div className="w-14 h-14 mx-auto mb-5 rounded-xl bg-surface-container border border-outline-variant flex items-center justify-center">
          <span className="material-symbols-outlined text-2xl text-primary">search</span>
        </div>
        <h1 className="text-5xl sm:text-6xl font-headline font-bold accent-gradient mb-2">404</h1>
        <p className="text-on-surface-variant text-lg mb-2">Página no encontrada</p>
        <p className="text-on-surface-variant text-sm mb-8">El camino que buscas no está disponible.</p>
        <Link to="/" className="btn btn-primary">
          Volver al inicio
        </Link>
      </div>
    </div>
  ),
})

function NavUser() {
  const { isSignedIn } = useUser()

  if (!isSignedIn) {
    return (
      <SignInButton mode="modal">
        <button className="btn btn-primary btn-sm">
          Ingresar
        </button>
      </SignInButton>
    )
  }

  return (
    <UserButton
      appearance={{
        elements: {
          userButtonAvatarBox: { width: '2rem', height: '2rem' },
          userButtonTrigger: { outline: 'none' },
        },
      }}
    />
  )
}

const NAV_ITEMS = [
  { to: '/', icon: 'home', label: 'Inicio', exact: true },
  { to: '/game', icon: 'sports_esports', label: 'Jugar' },
  { to: '/rankings', icon: 'leaderboard', label: 'Rankings' },
  { to: '/marketplace', icon: 'store', label: 'Tienda' },
]

function NavLink({ to, icon, label, exact }: { to: string; icon: string; label: string; exact?: boolean }) {
  return (
    <Link
      to={to}
      activeOptions={exact ? { exact: true } : undefined}
      className="group relative flex items-center gap-2 px-3 sm:px-4 py-2 text-on-surface-variant hover:text-on-surface transition-colors text-sm rounded-lg hover:bg-surface-container"
    >
      <span className="material-symbols-outlined text-lg">{icon}</span>
      <span className="hidden md:inline font-label">{label}</span>
    </Link>
  )
}

function RootLayout() {
  const [pageKey, setPageKey] = useState(0)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useRouterState({ select: (s) => s.location })
  const prevPath = useRef(location.pathname)
  const isGameRoute = location.pathname.match(/^\/game\/[^/]+$/)

  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location.pathname])

  if (prevPath.current !== location.pathname) {
    setPageKey((k) => k + 1)
    prevPath.current = location.pathname
  }

  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <title>Damas 3D — Sala de Juego</title>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
        <HeadContent />
      </head>
      <body className="bg-background text-on-surface font-body min-h-screen overflow-x-hidden">
        <ClerkProvider>
          {/* Navbar */}
          {!isGameRoute && (
            <nav className="sticky top-0 left-0 right-0 z-40 bg-surface/80 backdrop-blur-md border-b border-outline-variant/50 shadow-sm">
              <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-3 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2 sm:gap-3 flex-shrink-0 no-underline">
                  <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10 border border-primary/20">
                    <span className="material-symbols-outlined text-lg text-primary">sports_esports</span>
                  </div>
                  <span className="hidden sm:inline font-headline text-base sm:text-lg font-semibold accent-gradient">Damas 3D</span>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-1">
                  {NAV_ITEMS.map((item) => (
                    <NavLink key={item.to} {...item} />
                  ))}
                </div>

                {/* User & Mobile Menu */}
                <div className="flex items-center gap-3">
                  <NavUser />
                  <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="md:hidden p-2 hover:bg-surface-container rounded-lg transition-colors"
                  >
                    <span className="material-symbols-outlined text-lg">{mobileMenuOpen ? 'close' : 'menu'}</span>
                  </button>
                </div>
              </div>

              {mobileMenuOpen && (
                <div className="md:hidden border-t border-outline-variant/30 bg-surface px-4 py-2">
                  {NAV_ITEMS.map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      activeOptions={item.exact ? { exact: true } : undefined}
                      className="block px-4 py-2 text-on-surface-variant hover:text-on-surface transition-colors text-sm rounded-lg hover:bg-surface-container"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </nav>
          )}

          {/* Main Content */}
          <main key={pageKey} className={`w-full min-h-screen flex flex-col relative ${isGameRoute ? '' : 'pb-8'}`}>
            <Outlet />
          </main>

          <Scripts />
        </ClerkProvider>
      </body>
    </html>
  )
}

export default RootLayout
