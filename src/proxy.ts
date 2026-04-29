import { type NextRequest, NextResponse } from 'next/server';

import { SESSION_COOKIE_NAME } from '@/lib/constants';

const PUBLIC_PATHS = new Set(['/login']);
const STATIC_PREFIXES = ['/api/', '/_next/', '/favicon.ico'];

// Role-based route access map
// Admin has access to everything (checked in application code)
// These define minimum role requirements for route prefixes
const _ROUTE_ROLE_MAP: Array<{ prefix: string; roles: string[] }> = [
  { prefix: '/finance', roles: ['ADMIN', 'ACCOUNTANT'] },
  { prefix: '/attendance', roles: ['ADMIN', 'TEACHER'] },
  { prefix: '/contacts', roles: ['ADMIN', 'TEACHER'] },
  { prefix: '/directory', roles: ['ADMIN', 'TEACHER'] },
  { prefix: '/users', roles: ['ADMIN'] },
  { prefix: '/settings', roles: ['ADMIN'] },
  { prefix: '/audit-log', roles: ['ADMIN'] },
];

function isStaticPath(pathname: string): boolean {
  return STATIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.has(pathname);
}

function createNonce(): string {
  const randomBytes = new Uint8Array(16);
  crypto.getRandomValues(randomBytes);
  return Array.from(randomBytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

function buildCspValue(nonce: string): string {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}'`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: blob:",
    "font-src 'self' data: https://fonts.gstatic.com",
    "connect-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ');
}

function withSecurityHeaders(response: NextResponse, nonce: string): NextResponse {
  response.headers.set('Content-Security-Policy', buildCspValue(nonce));
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  response.headers.set('x-csp-nonce', nonce);
  return response;
}

export default function proxy(request: NextRequest): NextResponse {
  const nonce = createNonce();
  const pathname = request.nextUrl.pathname;

  // Allow static assets and API routes through
  if (isStaticPath(pathname)) {
    return NextResponse.next();
  }

  // Public paths (login) — redirect to dashboard if already authenticated
  if (isPublicPath(pathname)) {
    const sessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    if (sessionToken) {
      return withSecurityHeaders(NextResponse.redirect(new URL('/', request.nextUrl)), nonce);
    }

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-csp-nonce', nonce);

    return withSecurityHeaders(NextResponse.next({ request: { headers: requestHeaders } }), nonce);
  }

  // All other paths require authentication
  const sessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionToken) {
    const signInUrl = new URL('/login', request.nextUrl);
    signInUrl.searchParams.set('callbackUrl', pathname);
    return withSecurityHeaders(NextResponse.redirect(signInUrl), nonce);
  }

  // Session validation is done server-side in page/action code
  // Middleware only checks cookie existence for fast path
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-csp-nonce', nonce);

  return withSecurityHeaders(NextResponse.next({ request: { headers: requestHeaders } }), nonce);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)'],
};
