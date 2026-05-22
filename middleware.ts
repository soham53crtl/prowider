import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken, COOKIE_NAME } from './lib/auth'

const PUBLIC_PREFIXES = [
  '/login',
  '/request-service',
  '/api/auth',
  '/api/leads',
  '/api/services',
  '/api/webhook',
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isPublic = PUBLIC_PREFIXES.some(
    p => pathname === p || pathname.startsWith(p + '/') || pathname.startsWith(p + '?')
  )
  if (isPublic) return NextResponse.next()

  const token = request.cookies.get(COOKIE_NAME)?.value
  if (!token || !(await verifyToken(token))) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
