import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import AppleProvider from 'next-auth/providers/apple'
import FacebookProvider from 'next-auth/providers/facebook'
import EmailProvider from 'next-auth/providers/email'
import bcryptjs from 'bcryptjs'

import { connectToDatabase } from '@/lib/mongodb'
import User from '@/lib/models/user'

export const authOptions: NextAuthOptions = {
  providers: [
    // --- OAuth Providers ---
    GoogleProvider({
      clientId: process.env.GOOGLE_ID ?? '',
      clientSecret: process.env.GOOGLE_SECRET ?? '',
    }),
    AppleProvider({
      clientId: process.env.APPLE_ID ?? '',
      clientSecret: process.env.APPLE_SECRET ?? '',
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_ID ?? '',
      clientSecret: process.env.FACEBOOK_SECRET ?? '',
    }),

    // --- Passwordless / Email Provider ---
    EmailProvider({
      server: process.env.MAIL_SERVER ?? '',
      from: process.env.EMAIL_FROM ?? 'Notion <no-reply@example.com>',
    }),

    // --- Credentials Provider ---
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'email@example.com' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please enter an email and password');
        }

        await connectToDatabase();

        const user = await User.findOne({ email: credentials.email.trim().toLowerCase() });
        if (!user) {
          throw new Error('No account found with that email');
        }

        const isPasswordCorrect = await bcryptjs.compare(
          credentials.password,
          user.password
        );
        if (!isPasswordCorrect) {
          throw new Error('Incorrect password');
        }

        return {
          id: user._id.toString(),
          name: user.name || user.email.split('@')[0],
          email: user.email,
        };
      },
    }),
  ],

  secret: process.env.NEXTAUTH_SECRET,

  session: {
    strategy: 'jwt',
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string) || token.sub;
        if (token.name) {
          session.user.name = token.name;
        }
      }
      return session;
    },
  },

  pages: {
    signIn: '/login',
  },
}
