import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// Next.js 16: file must be named proxy.ts and export a named `proxy` function.
// withAuth wraps our logic; the outer function is the proxy entry point.
export default withAuth(
  function proxy(req) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;

    // If user is already logged in and tries to access login or signup, redirect to /dashboard
    if (token && (pathname === "/login" || pathname === "/signup")) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        // Require authentication for /dashboard routes
        if (pathname.startsWith("/dashboard")) {
          return !!token;
        }

        // Allow public access to all other routes
        return true;
      },
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/signup"],
};
