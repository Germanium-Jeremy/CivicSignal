// API Configuration
// Centralized configuration for API behavior including CORS

export const API_CONFIG = {
  // CORS Configuration
  cors: {
    // In development: Allow all origins
    // In production: You can specify allowed domains if needed
    allowedOrigins: process.env.NODE_ENV === 'production' 
      ? process.env.ALLOWED_ORIGINS?.split(',') || ['*']
      : ['*'],
    
    // Allow credentials (needed for cookies, auth headers)
    allowCredentials: true,
    
    // Allowed HTTP methods
    allowedMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    
    // Allowed headers
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Origin',
    ],
    
    // Exposed headers (headers that the client can access)
    exposedHeaders: ['Content-Length', 'X-Request-Id'],
    
    // Preflight cache duration (in seconds)
    maxAge: 86400, // 24 hours
  },

  // Rate limiting (for future implementation)
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.NODE_ENV === 'production' ? 100 : 1000, // requests per window
  },

  // API versioning
  version: 'v1',
  
  // Base path
  basePath: '/api',
};

/**
 * Check if an origin is allowed
 * Mobile apps don't send Origin header, so we allow requests without origin
 */
export function isOriginAllowed(origin: string | null): boolean {
  // If no origin (mobile app), allow it
  if (!origin) return true;
  
  // If wildcard is in allowed origins, allow all
  if (API_CONFIG.cors.allowedOrigins.includes('*')) return true;
  
  // Check if origin is in the allowed list
  return API_CONFIG.cors.allowedOrigins.some(allowed => {
    if (allowed === origin) return true;
    
    // Support wildcard subdomains (e.g., *.civicsignal.rw)
    if (allowed.startsWith('*.')) {
      const domain = allowed.slice(2);
      return origin.endsWith(domain);
    }
    
    return false;
  });
}

/**
 * Get CORS headers for a given origin
 */
export function getCorsHeaders(origin: string | null): Record<string, string> {
  const allowedOrigin = isOriginAllowed(origin) ? (origin || '*') : 'null';
  
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': API_CONFIG.cors.allowedMethods.join(', '),
    'Access-Control-Allow-Headers': API_CONFIG.cors.allowedHeaders.join(', '),
    'Access-Control-Allow-Credentials': API_CONFIG.cors.allowCredentials.toString(),
    'Access-Control-Expose-Headers': API_CONFIG.cors.exposedHeaders.join(', '),
    'Access-Control-Max-Age': API_CONFIG.cors.maxAge.toString(),
  };
}
