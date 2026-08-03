import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcryptjs from 'bcryptjs'

import { connectToDatabase } from '@/lib/mongodb'
import User from '@/lib/models/user'

export const authOptions: NextAuthOptions = {
  providers: [
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

        try {
          await connectToDatabase();
          const dbUser = await User.findOne({ email: session.user.email });
          if (dbUser) {
            session.user.plan = dbUser.plan || "free";
            session.user.aiUsageCount = dbUser.aiUsageCount || 0;
          }
        } catch (e) {
          console.error("Session sync database error:", e);
          session.user.plan = "free";
          session.user.aiUsageCount = 0;
        }
      }
      return session;
    },
  },

  pages: {
    signIn: '/login',
  },
}
