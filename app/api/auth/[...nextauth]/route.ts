import NextAuth, { NextAuthOptions } from 'next-auth'
import AppleProvider from 'next-auth/providers/apple'
import FacebookProvider from 'next-auth/providers/facebook'
import GoogleProvider from 'next-auth/providers/google'
import EmailProvider from 'next-auth/providers/email'

export const authOptions: NextAuthOptions = {
  providers: [
    AppleProvider({
      clientId: process.env.APPLE_ID ?? '',
      clientSecret: process.env.APPLE_SECRET ?? ''
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_ID ?? '',
      clientSecret: process.env.FACEBOOK_SECRET ?? ''
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_ID ?? '',
      clientSecret: process.env.GOOGLE_SECRET ?? ''
    }),
    EmailProvider({
      // `server` can be an SMTP connection string or object
      server: process.env.MAIL_SERVER,
      from: process.env.MAIL_FROM ?? 'NextAuth.js <no-reply@example.com>'
    }),
  ],
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }