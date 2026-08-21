/**
 * lib/server-session.ts
 *
 * Robust helper to get the current user session in Next.js 16 App Router API routes.
 * Employs multiple fallback strategies to handle standard tokens, secure cookies,
 * proxies, and direct cookie decoding.
 */
import { getToken, decode } from "next-auth/jwt";
import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

const SECRET = process.env.NEXTAUTH_SECRET;

export interface SessionUser {
  id: string;
  email: string;
  name: string | null;
}

export interface ServerSession {
  user: SessionUser;
}

/**
 * Returns a session `{ user: { email, id, name } }` or null when unauthenticated.
 */
export async function getSession(request?: NextRequest | Request | null): Promise<ServerSession | null> {
  let token: { email?: string; id?: string; sub?: string; name?: string } | null = null;

  // Strategy 1: getToken on request with auto-detected secureCookie
  if (request) {
    try {
      token = (await getToken({ req: request as any, secret: SECRET })) as any;
    } catch {
      token = null;
    }

    // Strategy 2: If token is null, try explicit secureCookie=false / true
    if (!token?.email) {
      try {
        token = (await getToken({ req: request as any, secret: SECRET, secureCookie: false })) as any;
      } catch {
        token = null;
      }
    }
    if (!token?.email) {
      try {
        token = (await getToken({ req: request as any, secret: SECRET, secureCookie: true })) as any;
      } catch {
        token = null;
      }
    }
  }

  // Strategy 3: Fall back to NextAuth getServerSession(authOptions)
  if (!token?.email) {
    try {
      const serverSession = await getServerSession(authOptions);
      if (serverSession?.user?.email) {
        return {
          user: {
            id: (serverSession.user as { id?: string }).id ?? "",
            email: serverSession.user.email,
            name: serverSession.user.name ?? null,
          },
        };
      }
    } catch {
      // ignore
    }
  }

  // Strategy 4: Read directly from incoming cookies via next/headers
  if (!token?.email && SECRET) {
    try {
      const cookieStore = await cookies();
      const rawToken =
        cookieStore.get("next-auth.session-token")?.value ||
        cookieStore.get("__Secure-next-auth.session-token")?.value ||
        cookieStore.get("__Host-next-auth.session-token")?.value;
      if (rawToken) {
        token = (await decode({ token: rawToken, secret: SECRET })) as any;
      }
    } catch {
      // ignore
    }
  }

  if (!token?.email) return null;

  return {
    user: {
      id: (token.id as string | undefined) ?? (token.sub as string | undefined) ?? "",
      email: token.email as string,
      name: (token.name as string | undefined) ?? null,
    },
  };
}
