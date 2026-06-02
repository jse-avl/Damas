import { createStart, createMiddleware } from '@tanstack/react-start'
import { clerkMiddleware } from '@clerk/tanstack-react-start/server'

const faviconMiddleware = createMiddleware().server(async ({ request, next }) => {
  const url = new URL(request.url)
  if (url.pathname === '/favicon.ico') {
    return new Response(null, { status: 204 })
  }
  return next()
})

export const startInstance = createStart(() => ({
  requestMiddleware: [
    clerkMiddleware(),
    faviconMiddleware,
  ],
}))