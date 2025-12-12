import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getCorsHeaders } from '@/config/api';

/**
 * Middleware to handle API requests with proper CORS headers
 * 
 * IMPORTANT NOTES:
 * 1. Mobile apps (iOS/Android) don't enforce CORS - they don't send Origin headers
 * 2. This middleware primarily handles web browser CORS and OPTIONS preflight requests
 * 3. Mobile apps can access all API endpoints without CORS restrictions
 * 4. We still configure CORS for security best practices and web client support
 */

export function middleware(request: NextRequest) {
    // Get origin from request (null for mobile apps)
    const origin = request.headers.get('origin');
    
    // Handle preflight requests (OPTIONS) - sent by browsers, not mobile apps
    if (request.method === 'OPTIONS') {
        return new NextResponse(null, {
            status: 204,
            headers: getCorsHeaders(origin),
        });
    }

    // For all other API requests, add CORS headers
    const response = NextResponse.next();
    
    if (request.nextUrl.pathname.startsWith('/api/')) {
        const corsHeaders = getCorsHeaders(origin);
        Object.entries(corsHeaders).forEach(([key, value]) => {
            response.headers.set(key, value);
        });
        
        // Add security headers
        response.headers.set('X-Content-Type-Options', 'nosniff');
        response.headers.set('X-Frame-Options', 'DENY');
        response.headers.set('X-XSS-Protection', '1; mode=block');
    }

    return response;
}

// Configure which routes to run middleware on
export const config = {
    matcher: '/api/:path*', // Apply to all API routes
};
