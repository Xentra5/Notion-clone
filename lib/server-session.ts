/**
 * lib/server-session.ts
 *
 * Helper to get the current user's email in Next.js 16 App Router API routes.
 *
 * NextAuth v4's getServerSession is unreliable in Route Handlers because it
 * can't automatically find the request context. Instead we use getToken() from
 * next-auth/jwt which reads and decodes the JWT directly from the incoming
 * request — this is the recommended approach for App Router + NextAuth v4.
 */
import { getToken } from "next-auth/jwt";
import { NextRequest } from "next/server";

const SECRET = process.env.NEXTAUTH_SECRET;

/**
 * Returns a minimal session-like object `{ user: { email, id, name } }`
 * or null when the request is unauthenticated.
 */
export async function getSession(request: NextRequest) {
  const token = await getToken({ req: request, secret: SECRET });
  if (!token?.email) return null;

  return {
    user: {
      id: (token.id as string | undefined) ?? token.sub ?? "",
      email: token.email as string,
      name: (token.name as string | undefined) ?? null,
    },
  };
}
