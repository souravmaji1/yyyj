import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Cache for authentication checks
const authCache = new Map();

export function authMiddleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("accessToken")?.value;

  // Check cache first
  if (authCache.has(pathname)) {
    const cachedResult = authCache.get(pathname);
    if (cachedResult.requiresAuth && token) {
      return NextResponse.next();
    }
    if (!cachedResult.requiresAuth && !token) {
      return NextResponse.next();
    }
  }

  // Check if path requires authentication
  const requiresAuth = pathname.startsWith('/settings') || 
                      pathname.startsWith('/profile') || 
                      pathname.startsWith('/orders');

  // Cache the result
  authCache.set(pathname, { requiresAuth });

  if (requiresAuth && !token) {
    const loginUrl = new URL("/auth?mode=login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const response = NextResponse.next();
  
  // Add cache control headers
  response.headers.set('Cache-Control', 'public, max-age=3600, s-maxage=3600');
  
  return response;
}

export const config = {
  matcher: [
    '/settings/:path*',
    '/profile/:path*',
    '/orders/:path*'
  ]
}; 