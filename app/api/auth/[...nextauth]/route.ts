import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import type { NextAuthOptions } from 'next-auth'

const allowedEmails: string[] | null = process.env.ALLOWED_GOOGLE_EMAILS
  ? process.env.ALLOWED_GOOGLE_EMAILS.split(',').map(e => e.trim().toLowerCase())
  : null

export const authOptions: NextAuthOptions = {
  providers: [
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const expectedUsername = process.env.ADMIN_USERNAME || 'admin'
        const expectedPassword = process.env.ADMIN_PASSWORD || 'prowider2024'
        if (
          credentials?.username === expectedUsername &&
          credentials?.password === expectedPassword
        ) {
          return { id: 'admin', name: 'Admin', email: 'admin@prowider.local' }
        }
        return null
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        if (allowedEmails === null) return true
        const email = (user.email ?? '').toLowerCase()
        if (allowedEmails.includes(email)) return true
        return '/unauthorized'
      }
      return true
    },
    async jwt({ token, account }) {
      if (account) token.provider = account.provider
      return token
    },
    async session({ session }) {
      return session
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: { strategy: 'jwt' },
  secret: process.env.SESSION_SECRET ?? process.env.NEXTAUTH_SECRET ?? 'prowider-fallback-secret',
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
