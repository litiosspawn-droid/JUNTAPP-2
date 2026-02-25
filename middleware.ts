import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Rutas que requieren autenticación
const PROTECTED_ROUTES = [
  '/profile',
  '/notificaciones',
  '/analytics',
  '/admin',
]

// Rutas que requieren verificación de email
const REQUIRE_EMAIL_VERIFICATION = [
  '/admin',
]

// Rutas que requieren rol de admin
const ADMIN_ROUTES = [
  '/admin',
]

// Rutas públicas que no deben ser accesibles si ya está logueado
const PUBLIC_ROUTES_IF_LOGGED_IN = [
  '/auth/login',
  '/auth/register',
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Obtener sesión del cookie
  const sessionCookie = request.cookies.get('session')?.value
  
  // Verificar si es ruta protegida
  const isProtectedRoute = PROTECTED_ROUTES.some(route => 
    pathname.startsWith(route)
  )
  
  // Verificar si es ruta de admin
  const isAdminRoute = ADMIN_ROUTES.some(route => 
    pathname.startsWith(route)
  )
  
  // Verificar si es ruta pública
  const isPublicRoute = PUBLIC_ROUTES_IF_LOGGED_IN.some(route =>
    pathname.startsWith(route)
  )
  
  // Verificar si requiere email verificado
  const requiresEmailVerification = REQUIRE_EMAIL_VERIFICATION.some(route =>
    pathname.startsWith(route)
  )

  // Si es ruta pública y el usuario está logueado, redirigir al home
  if (isPublicRoute && sessionCookie) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Si es ruta protegida y no hay sesión
  if (isProtectedRoute && !sessionCookie) {
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Si es ruta de admin, verificar rol
  if (isAdminRoute && sessionCookie) {
    try {
      // Decodificar el cookie para verificar el rol
      // Nota: La verificación completa del token se hace en el servidor
      const sessionData = JSON.parse(decodeURIComponent(sessionCookie))
      
      if (sessionData.role !== 'admin') {
        return NextResponse.redirect(new URL('/', request.url))
      }
    } catch {
      // Si no se puede decodificar, redirigir al login
      const loginUrl = new URL('/auth/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // Si requiere email verificado, verificar en el cliente (se hace en el componente)
  // El middleware solo verifica la sesión
  
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
