import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  // Security headers for all requests
  const response = NextResponse.next()
  
  // Prevent clickjacking
  response.headers.set('X-Frame-Options', 'DENY')
  
  // Prevent MIME type sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff')
  
  // XSS Protection
  response.headers.set('X-XSS-Protection', '1; mode=block')
  
  // Referrer Policy
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  
  // Content Security Policy
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Next.js requires unsafe-inline and unsafe-eval
    "style-src 'self' 'unsafe-inline'", // Tailwind requires unsafe-inline
    "img-src 'self' data: blob:",
    "font-src 'self'",
    "connect-src 'self' https://generativelanguage.googleapis.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; ')
  
  response.headers.set('Content-Security-Policy', csp)
  
  // API route specific security
  if (request.nextUrl.pathname.startsWith('/api/')) {
    // Prevent caching of API responses
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    
    // Rate limiting headers (basic implementation)
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
    response.headers.set('X-RateLimit-IP', ip.substring(0, 10)) // Truncate for privacy
    
    // CORS headers for API
    response.headers.set('Access-Control-Allow-Origin', request.headers.get('origin') || '*')
    response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  }
  
  // Log security events in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[SECURITY] ${request.method} ${request.nextUrl.pathname}`, {
      userAgent: request.headers.get('user-agent')?.substring(0, 50),
      ip: request.ip?.substring(0, 10)
    })
  }
  
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}