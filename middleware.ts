import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { securityHeaders, getClientIP, rateLimit } from '@/src/lib/security';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Apply rate limiting to sensitive routes
  if (pathname.startsWith('/api/auth') || pathname.startsWith('/api/user') || pathname.startsWith('/api/payment')) {
    const clientIP = getClientIP(request);
    const identifier = `${clientIP}:${pathname}`;
    const limit = rateLimit(identifier, 20, 60000); // 20 requests per minute
    
    if (!limit.success) {
      return new NextResponse(
        JSON.stringify({
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many requests',
            details: `Rate limit exceeded. Try again after ${new Date(limit.resetTime).toISOString()}`
          }
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': Math.ceil((limit.resetTime - Date.now()) / 1000).toString(),
            'X-RateLimit-Limit': '20',
            'X-RateLimit-Remaining': limit.remaining.toString(),
            'X-RateLimit-Reset': limit.resetTime.toString(),
          }
        }
      );
    }
  }
  
  // Check multiple token sources for social login compatibility
  const accessToken = request.cookies.get("accessToken")?.value;
  const nextAuthToken = request.cookies.get("next-auth.session-token")?.value;
  const hasAnyToken = accessToken || nextAuthToken;

  // Skip middleware for static files and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') // This will skip files with extensions
  ) {
    const response = NextResponse.next();
    return securityHeaders(response);
  }

  // Debug logging (only in development)
  if (process.env.NODE_ENV === 'development') {
    console.log('Middleware - Path:', pathname, 'AccessToken:', !!accessToken, 'NextAuthToken:', !!nextAuthToken);
  }

  // Define public routes explicitly
  const publicRoutes = [
    '/',
    '/video-hub',
    '/auth',
    '/login', 
    '/register',
    '/forgot-password',
    '/reset-password',
    '/address-setup'
  ];

  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
  const isProtectedRoute = !isPublicRoute;

  if (process.env.NODE_ENV === 'development') {
    console.log('Middleware - Is public route:', isPublicRoute, 'Is protected route:', isProtectedRoute);
  }

  // If user is not authenticated and trying to access protected route
  if (!hasAnyToken && isProtectedRoute) {
    if (process.env.NODE_ENV === 'development') {
      console.log('Middleware - Redirecting unauthenticated user to login');
    }
    const loginUrl = new URL("/auth?mode=login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    const response = NextResponse.redirect(loginUrl);
    return securityHeaders(response);
  }

  // REMOVED: Aggressive redirect from auth routes to home
  // This was causing redirect loops with social login
  // Users can now stay on auth page even if authenticated

  if (process.env.NODE_ENV === 'development') {
    console.log('Middleware - Allowing access to:', pathname);
  }
  
  const response = NextResponse.next();
  
  // Add performance headers for better caching
  if (pathname.startsWith('/static') || pathname.includes('.')) {
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  } else {
    response.headers.set('Cache-Control', 'public, max-age=60, s-maxage=60, stale-while-revalidate=30');
  }
  
  // Apply security headers
  return securityHeaders(response);
}

// Optimized matcher pattern to reduce middleware execution
export const config = {
  matcher: [
    // Match all routes except static files and API routes
    '/((?!api|_next/static|_next/image|favicon.ico).*)'
  ]
};