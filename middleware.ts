import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Rutas que requieren rol de admin
const ADMIN_ROUTES = [
  '/admin',
]

// Rutas públicas que no deben ser accesibles si ya está logueado
const PUBLIC_ROUTES_IF_LOGGED_IN = [
  '/auth/login',
  '/auth/register',
]

// Rutas públicas que siempre son accesibles
const PUBLIC_ROUTES = [
  '/',
  '/eventos',
  '/mapa',
  '/events/',
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Si es ruta pública, dejar pasar (el cliente maneja la auth)
  const isPublicRoute = PUBLIC_ROUTES.some(route => pathname.startsWith(route))
  if (isPublicRoute) {
    return NextResponse.next()
  }

  // Si es ruta de auth y ya está logueado, redirigir al home
  const isAuthRoute = PUBLIC_ROUTES_IF_LOGGED_IN.some(route => pathname.startsWith(route))
  if (isAuthRoute) {
    const hasAuthCookie = request.cookies.has('firebase-auth-token')
    if (hasAuthCookie) {
      return NextResponse.redirect(new URL('/', request.url))
    }
    return NextResponse.next()
  }

  // Si es ruta de admin, dejar pasar (el componente verifica el rol en el cliente)
  // Nota: La verificación de admin se hace en el cliente con Firebase Auth
  const isAdminRoute = ADMIN_ROUTES.some(route => pathname.startsWith(route))
  if (isAdminRoute) {
    return NextResponse.next()
  }

  // Para todas las demás rutas, dejar pasar
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|manifest.json|apple-icon.png|icon-.*.png|browserconfig.xml|safari-pinned-tab.svg).*)',
  ],
}
