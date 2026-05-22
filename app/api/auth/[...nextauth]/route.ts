import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import type { NextAuthOptions } from 'next-auth'

const allowedEmails: string[] | null = process.env.ALLOWED_GOOGLE_EMAILS
  ? process.env.ALLOWED_GOOGLE_EMAILS.split(',').map(e => e.trim().toLowerCase())
  : null

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
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
