import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GithubProvider from 'next-auth/providers/github'
import GoogleProvider from 'next-auth/providers/google'
import AppleProvider from 'next-auth/providers/apple'
import FacebookProvider from 'next-auth/providers/facebook'
import bcryptjs from 'bcryptjs'

import { connectToDatabase } from '@/lib/mongodb'
import User from '@/lib/models/user'

export const authOptions: NextAuthOptions = {
  providers: [
    // --- Google OAuth Provider ---
    GoogleProvider({
      clientId: process.env.GOOGLE_ID || process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_SECRET || process.env.GOOGLE_CLIENT_SECRET || '',
      allowDangerousEmailAccountLinking: true,
    }),

    // --- GitHub OAuth Provider ---
    GithubProvider({
      clientId: process.env.GITHUB_ID || process.env.GITHUB_CLIENT_ID || '',
      clientSecret: process.env.GITHUB_SECRET || process.env.GITHUB_CLIENT_SECRET || '',
      allowDangerousEmailAccountLinking: true,
    }),

    // --- Credentials Provider (Email & Password) ---
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
          image: user.image || '',
        };
      },
    }),
  ],

  secret: process.env.NEXTAUTH_SECRET,

  session: {
    strategy: 'jwt',
  },

  callbacks: {
    async signIn({ user, account }) {
      if (account && account.provider !== 'credentials') {
        try {
          await connectToDatabase();
          const email = user.email?.trim().toLowerCase();
          if (!email) return '/login?error=InvalidEmail';

          const existingUser = await User.findOne({ email });
          if (existingUser) {
            // If the user already registered with credentials (email/password)
            if (existingUser.password && (!existingUser.provider || existingUser.provider === 'credentials')) {
              return '/login?error=AccountExists';
            }

            // Update image if missing
            let hasUpdate = false;
            if (!existingUser.image && user.image) {
              existingUser.image = user.image;
              hasUpdate = true;
            }
            if (hasUpdate) {
              await existingUser.save();
            }
          } else {
            await User.create({
              name: user.name || email.split('@')[0],
              email: email,
              image: user.image || '',
              provider: account.provider,
              plan: 'free',
            });
          }
        } catch (error) {
          console.error('[OAuth SignIn Error]:', error);
          return '/login?error=OAuthError';
        }
      }
      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        if (user.image) token.picture = user.image;
      }
      if (trigger === 'update' && session?.name) {
        token.name = session.name;
      }

      if (token.email) {
        try {
          await connectToDatabase();
          const dbUser = await User.findOne({ email: (token.email as string).toLowerCase() });
          if (dbUser) {
            token.id = dbUser._id.toString();
            token.plan = dbUser.plan || 'free';
            if (dbUser.image) token.picture = dbUser.image;
          }
        } catch (err) {
          console.error('[JWT Fetch User Error]:', err);
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string) || (token.sub as string);
        if (token.name) {
          session.user.name = token.name as string;
        }
        if (token.email) {
          session.user.email = token.email as string;
        }
        if (token.picture) {
          session.user.image = token.picture as string;
        }
        if (token.plan) {
          session.user.plan = token.plan as string;
        }
      }
      return session;
    },
  },

  pages: {
    signIn: '/login',
  },
}
