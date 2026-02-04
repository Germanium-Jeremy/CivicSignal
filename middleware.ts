import { NextRequest, NextResponse } from 'next/server';
import { getCorsHeaders } from './src/config/api';

function applySecurityHeaders(response: NextResponse) {
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'geolocation=(self), microphone=(self), camera=(self)');
  response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
  response.headers.set('Cross-Origin-Resource-Policy', 'same-site');
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; img-src 'self' data: https:; media-src 'self' blob: data: https:; connect-src 'self' https:; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; frame-ancestors 'none';"
  );
}

export function middleware(request: NextRequest) {
  const isApi = request.nextUrl.pathname.startsWith('/api/');
  const origin = request.headers.get('origin');

  if (isApi && request.method === 'OPTIONS') {
    const preflightResponse = new NextResponse(null, { status: 204 });
    const corsHeaders = getCorsHeaders(origin);
    Object.entries(corsHeaders).forEach(([key, value]) => preflightResponse.headers.set(key, value));
    applySecurityHeaders(preflightResponse);
    return preflightResponse;
  }

  const response = NextResponse.next();

  if (isApi) {
    const corsHeaders = getCorsHeaders(origin);
    Object.entries(corsHeaders).forEach(([key, value]) => response.headers.set(key, value));
  }

  applySecurityHeaders(response);
  return response;
}

export const config = {
  matcher: ['/api/:path*', '/((?!_next/static|_next/image|favicon.ico).*)'],
};

