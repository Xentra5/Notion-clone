import NextAuth from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { checkRateLimit } from '@/lib/ratelimit'

const handler = NextAuth(authOptions)

/**
 * Wrap the NextAuth handler with brute-force / credential-stuffing protection.
 * Only the POST route (sign-in attempts) is rate-limited; GET (session check) is not.
 * Limit: 10 login attempts per minute per IP.
 */
export async function GET(req: NextRequest, ctx: { params: Promise<{ nextauth: string[] }> }) {
  return handler(req as any, ctx as any)
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ nextauth: string[] }> }) {
  // Apply rate limiting only to the sign-in endpoint to block credential stuffing
  const url = new URL(req.url)
  if (url.pathname.endsWith('/callback/credentials') || url.pathname.endsWith('/signin')) {
    const rl = await checkRateLimit(req, 'auth_login', { limit: 10, windowMs: 60_000 })
    if (!rl.success) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please wait a minute and try again.' },
        { status: 429 }
      )
    }
  }
  return handler(req as any, ctx as any)
}
