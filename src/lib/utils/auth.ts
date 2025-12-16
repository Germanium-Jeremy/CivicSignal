import bcrypt from 'bcryptjs';
import jwt, { JwtPayload } from 'jsonwebtoken';
import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
// import geoip from 'geoip-country';

// JWT Payload interface
export interface CustomJwtPayload extends JwtPayload {
    userId: string;
    email: string;
    role: string;
    isEmailVerified: boolean;
    isPhoneVerified: boolean;
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key';

// Password validation
export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (password.length < 8) {
        errors.push('Password must be at least 8 characters long');
    }
    
    if (!/(?=.*[a-z])/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/(?=.*[A-Z])/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/(?=.*\d)/.test(password)) {
        errors.push('Password must contain at least one number');
    }
  
    if (!/(?=.*[@$!%*?&])/.test(password)) {
        errors.push('Password must contain at least one special character (@$!%*?&)');
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
};

// Hash password
export const hashPassword = async (password: string): Promise<string> => {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
};

// Compare password
export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
    return await bcrypt.compare(password, hashedPassword);
};

// Generate tokens
export const generateTokens = (payload: any) => {
    const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });
    const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: '7d' });
    return { accessToken, refreshToken };
};

// Verify access token
export const verifyAccessToken = (token: string): CustomJwtPayload | null => {
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        console.log("Decoded from token: ", decoded)
        // Type guard to ensure it's an object with our expected properties
        if (typeof decoded === 'object' && decoded !== null && 'userId' in decoded) {
            return decoded as CustomJwtPayload;
        }
        return null;
    } catch (error) {
        return null;
    }
};

// Verify refresh token
export const verifyRefreshToken = (token: string): CustomJwtPayload | null => {
    try {
        const decoded = jwt.verify(token, JWT_REFRESH_SECRET);
        // Type guard to ensure it's an object with our expected properties
        if (typeof decoded === 'object' && decoded !== null && 'userId' in decoded) {
            return decoded as CustomJwtPayload;
        }
        return null;
    } catch (error) {
        return null;
    }
};

// Verify authentication from request headers
export const verifyAuth = (request: NextRequest): { isAuthenticated: boolean; userId?: string; user?: CustomJwtPayload; error?: NextResponse; } => {
    try {
    // Get Authorization header
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
        return {
            isAuthenticated: false,
            error: NextResponse.json(
                {
                    success: false,
                    error: 'Authentication required',
                    message: 'No authorization header provided'
                },
                { status: 401 }
            )
        };
    }

    // Check if it's a Bearer token
    if (!authHeader.startsWith('Bearer ')) {
        return {
            isAuthenticated: false,
            error: NextResponse.json(
                {
                    success: false,
                    error: 'Invalid authorization format',
                message: 'Authorization header must be in format: Bearer <token>'
                },
                { status: 401 }
            )
        };
    }

    // Extract token
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = verifyAccessToken(token);

    if (!decoded) {
        return {
            isAuthenticated: false,
            error: NextResponse.json(
                {
                    success: false,
                    error: 'Invalid or expired token',
                    message: 'Please login again'
                },
                { status: 401 }
            )
        };
    }

    // Return authenticated user info
    return {
        isAuthenticated: true,
        userId: decoded.userId,
        user: decoded
    };
    } catch (error) {
    console.error('Auth verification error:', error);
        return {
            isAuthenticated: false,
            error: NextResponse.json(
                {
                    success: false,
                    error: 'Authentication failed',
                    message: 'An error occurred during authentication'
                },
                { status: 401 }
            )
        };
    }
};

// Generate verification codes
export const generateVerificationToken = (): string => {
    return crypto.randomBytes(32).toString('hex');
};

export const generateVerificationCode = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
};

// Get location from IP
export const getLocationFromIP = (ip: string): string => {
        return `Rwanda, Kigali`;

    // const geo = geoip.lookup(ip);
    // if (geo) {
    //   return `${geo.country}, ${geo.country}`;
    // }

    return 'Unknown Location';
};

// Check if IP is from Rwanda
export const isRwandanIP = (ip: string): boolean => {
    // For development, allow localhost
    if (ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
        return true;
    }
  
    // const geo = geoip.lookup(ip);
    // return geo?.country === 'RW';
    return true
};

// Generate device ID
export const generateDeviceId = (userAgent: string, ip: string): string => {
    return crypto.createHash('sha256').update(userAgent + ip).digest('hex');
};

// Extract device name from user agent
export const getDeviceName = (userAgent: string): string => {
    if (userAgent.includes('Mobile')) {
        if (userAgent.includes('iPhone')) return 'iPhone';
        if (userAgent.includes('Android')) return 'Android Phone';
        return 'Mobile Device';
    }
  
    if (userAgent.includes('Tablet') || userAgent.includes('iPad')) {
        return 'Tablet';
    }
  
    if (userAgent.includes('Windows')) return 'Windows PC';
    if (userAgent.includes('Mac')) return 'Mac';
    if (userAgent.includes('Linux')) return 'Linux PC';
  
    return 'Unknown Device';
};
