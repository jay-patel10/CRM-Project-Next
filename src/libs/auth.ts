import CredentialProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import type { NextAuthOptions } from 'next-auth'

export const authOptions: NextAuthOptions = {
  adapter: undefined,

  providers: [
    CredentialProvider({
      name: 'Credentials',
      type: 'credentials',
      credentials: {},

      async authorize(credentials) {
        const { email, password } = credentials as {
          email: string
          password: string
        }

        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
          })

          const data = await res.json()

          if (!res.ok) {
            throw new Error(data.message || 'Invalid credentials')
          }

          // FIXED KEY NAME: backendToken
          return {
            id: data.user.id,
            name: data.user.name,
            email: data.user.email,
            backendToken: data.token,
            role: data.user.roleId
          }
        } catch (e: any) {
          throw new Error(e.message)
        }
      }
    }),

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? ''
    })
  ],

  session: {
    strategy: 'jwt'
  },

  pages: {
    signIn: '/login'
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.name = user.name
        token.email = user.email
        token.role = user.role
        token.backendToken = user.backendToken // FIXED
      }

      return token
    },

    async session({ session, token }) {
      session.user.id = token.id
      session.user.name = token.name
      session.user.email = token.email
      session.user.role = token.role
      session.user.backendToken = token.backendToken

      return session
    }
  }
}
