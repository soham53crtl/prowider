import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

const PUBLIC_PREFIXES = [
  '/login',
  '/unauthorized',
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

  const token = await getToken({
    req: request,
    secret: process.env.SESSION_SECRET ?? process.env.NEXTAUTH_SECRET ?? 'prowider-fallback-secret',
  })

  if (!token) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
