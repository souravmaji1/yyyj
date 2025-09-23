import { NextRequest, NextResponse } from 'next/server';

/**
 * Security Headers Configuration
 * Implements OWASP recommendations for web application security
 */
export function securityHeaders(response: NextResponse): NextResponse {
  // Content Security Policy
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://js.stripe.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: blob: https://images.unsplash.com https://lh3.googleusercontent.com https://intelli-verse-x-media.s3.us-east-1.amazonaws.com",
    "media-src 'self' blob:",
    "connect-src 'self' https://api.intelli-verse-x.ai https://www.google-analytics.com https://api.stripe.com",
    "frame-src 'self' https://js.stripe.com https://www.youtube.com",
    "worker-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests"
  ].join('; ');

  // Set security headers
  response.headers.set('Content-Security-Policy', csp);
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  // HSTS (only in production)
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }

  return response;
}

/**
 * CORS Configuration for API routes
 */
export function corsHeaders(origin?: string): Record<string, string> {
  const allowedOrigins = [
    'https://intelli-verse-x.ai',
    'https://www.intelli-verse-x.ai',
    ...(process.env.NODE_ENV === 'development' ? ['http://localhost:3000'] : [])
  ];

  const isAllowed = !origin || allowedOrigins.includes(origin);

  return {
    'Access-Control-Allow-Origin': isAllowed ? (origin || '*') : 'null',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400', // 24 hours
  };
}

/**
 * Rate limiting store (in-memory for simplicity, use Redis in production)
 */
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

/**
 * Simple rate limiting implementation
 */
export function rateLimit(
  identifier: string, 
  maxRequests: number = 100, 
  windowMs: number = 60000
): { success: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const key = identifier;
  
  // Clean up expired entries
  if (rateLimitStore.size > 10000) {
    rateLimitStore.forEach((v, k) => {
      if (v.resetTime < now) {
        rateLimitStore.delete(k);
      }
    });
  }
  
  const current = rateLimitStore.get(key);
  
  if (!current || current.resetTime < now) {
    // New window
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + windowMs
    });
    return {
      success: true,
      remaining: maxRequests - 1,
      resetTime: now + windowMs
    };
  }
  
  if (current.count >= maxRequests) {
    return {
      success: false,
      remaining: 0,
      resetTime: current.resetTime
    };
  }
  
  current.count++;
  return {
    success: true,
    remaining: maxRequests - current.count,
    resetTime: current.resetTime
  };
}

/**
 * Get client IP address from request
 */
export function getClientIP(request: NextRequest): string {
  const xForwardedFor = request.headers.get('x-forwarded-for');
  const xRealIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  
  if (xForwardedFor) {
    const firstIP = xForwardedFor.split(',')[0];
    return firstIP ? firstIP.trim() : '';
  }
  
  if (cfConnectingIP) {
    return cfConnectingIP;
  }
  
  if (xRealIP) {
    return xRealIP;
  }
  
  // Fallback for development
  return request.ip || '127.0.0.1';
}

/**
 * Apply rate limiting to API routes
 */
export function withRateLimit(
  handler: (request: NextRequest) => Promise<NextResponse>,
  options: { maxRequests?: number; windowMs?: number } = {}
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const { maxRequests = 100, windowMs = 60000 } = options;
    const clientIP = getClientIP(request);
    const identifier = `${clientIP}:${request.nextUrl.pathname}`;
    
    const limit = rateLimit(identifier, maxRequests, windowMs);
    
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
            'X-RateLimit-Limit': maxRequests.toString(),
            'X-RateLimit-Remaining': limit.remaining.toString(),
            'X-RateLimit-Reset': limit.resetTime.toString(),
          }
        }
      );
    }
    
    const response = await handler(request);
    
    // Add rate limit headers to successful responses
    response.headers.set('X-RateLimit-Limit', maxRequests.toString());
    response.headers.set('X-RateLimit-Remaining', limit.remaining.toString());
    response.headers.set('X-RateLimit-Reset', limit.resetTime.toString());
    
    return response;
  };
}