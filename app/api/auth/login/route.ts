import { NextResponse } from 'next/server'
import { signToken, COOKIE_NAME, COOKIE_MAX_AGE } from '@/lib/auth'

export async function POST(req: Request) {
  const { username, password } = await req.json()

  const expectedUsername = process.env.ADMIN_USERNAME || 'admin'
  const expectedPassword = process.env.ADMIN_PASSWORD || 'prowider2024'

  if (username !== expectedUsername || password !== expectedPassword) {
    return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 })
  }

  const token = await signToken(`user:${username}:${Date.now()}`)
  const response = NextResponse.json({ ok: true })
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  })
  return response
}
