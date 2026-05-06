import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value || ''

  // For client-side auth, we rely on localStorage
  // This middleware handles server-side redirects for auth pages
  const { pathname } = request.nextUrl

  // Public paths that don't require auth
  const publicPaths = ['/login', '/register', '/api', '/_next', '/favicon']
  const isPublicPath = publicPaths.some(p => pathname.startsWith(p))

  // We'll handle auth check on client side for SPA behavior
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
