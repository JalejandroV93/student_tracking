// src/middleware.ts (Middleware for Route Protection)

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/tokens';


const protectedRoutes = ["/dashboard"]; // Protected routes

export async function middleware(request: NextRequest) {

  /* if (request.nextUrl.pathname.startsWith("/v1/toefl/shared/")) {
      return NextResponse.next();
  } */

  const token = request.cookies.get('auth_token')?.value;
  let isLoggedIn = false;

  if (token) {
    try {
      // Verify the token.  If it's invalid, it will throw an error.
      await verifyToken(token);
      isLoggedIn = true;
    } catch (error) {
      console.error("Error verifying token in middleware:", error);
      isLoggedIn = false; // Treat verification errors as not logged in.
    }
  }

  const isProtectedRoute = protectedRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );

    if (isProtectedRoute && !isLoggedIn) {
        const absoluteURL = new URL("/", request.nextUrl.origin);
        return NextResponse.redirect(absoluteURL.toString());
    }

  return NextResponse.next();
}


export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};