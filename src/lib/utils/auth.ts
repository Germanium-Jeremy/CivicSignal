import bcrypt from 'bcryptjs';
import jwt, { JwtPayload } from 'jsonwebtoken';
import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

export interface CustomJwtPayload extends JwtPayload {
    userId: string;
    email: string;
    role: string;
    isEmailVerified: boolean;
    isPhoneVerified: boolean;
    tenantId?: string;
}

export const ACCESS_COOKIE_NAME = 'civic_access';
export const REFRESH_COOKIE_NAME = 'civic_refresh';
export const SESSION_COOKIE_NAME = 'civic_sid';

const JWT_SECRET = process.env.JWT_SECRET || 'development-only-jwt-secret-change-me';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'development-only-refresh-secret-change-me';

const isProduction = process.env.NODE_ENV === 'production';

function getCookieOptions(maxAgeSeconds: number) {
    return {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax' as const,
        path: '/',
        maxAge: maxAgeSeconds,
    };
}

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
        errors,
    };
};

export const hashPassword = async (password: string): Promise<string> => {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
};

export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
    return bcrypt.compare(password, hashedPassword);
};

export const generateTokens = (payload: any) => {
    const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });
    const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: '7d' });
    return { accessToken, refreshToken };
};

export const verifyAccessToken = (token: string): CustomJwtPayload | null => {
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (typeof decoded === 'object' && decoded !== null && 'userId' in decoded) {
            return decoded as CustomJwtPayload;
        }
        return null;
    } catch {
        return null;
    }
};

export const verifyRefreshToken = (token: string): CustomJwtPayload | null => {
    try {
        const decoded = jwt.verify(token, JWT_REFRESH_SECRET);
        if (typeof decoded === 'object' && decoded !== null && 'userId' in decoded) {
            return decoded as CustomJwtPayload;
        }
        return null;
    } catch {
        return null;
    }
};

export const getAccessTokenFromRequest = (request: NextRequest): string | null => {
    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
    if (authHeader?.startsWith('Bearer ')) {
        return authHeader.substring(7);
    }

    const fromCookie = request.cookies.get(ACCESS_COOKIE_NAME)?.value;
    return fromCookie || null;
};

export const getRefreshTokenFromRequest = (request: NextRequest): string | null => {
    const fromBodyHeader = request.headers.get('x-refresh-token');
    if (fromBodyHeader) return fromBodyHeader;

    const fromCookie = request.cookies.get(REFRESH_COOKIE_NAME)?.value;
    return fromCookie || null;
};

export const attachAuthCookies = (
    response: NextResponse,
    tokens: { accessToken: string; refreshToken: string }
): NextResponse => {
    response.cookies.set(ACCESS_COOKIE_NAME, tokens.accessToken, getCookieOptions(60 * 60 * 24));
    response.cookies.set(REFRESH_COOKIE_NAME, tokens.refreshToken, getCookieOptions(60 * 60 * 24 * 7));
    return response;
};

export const clearAuthCookies = (response: NextResponse): NextResponse => {
    response.cookies.set(ACCESS_COOKIE_NAME, '', { ...getCookieOptions(0), maxAge: 0 });
    response.cookies.set(REFRESH_COOKIE_NAME, '', { ...getCookieOptions(0), maxAge: 0 });
    return response;
};

export const attachSessionCookie = (
    response: NextResponse,
    sessionId: string,
    maxAgeSeconds: number
): NextResponse => {
    response.cookies.set(SESSION_COOKIE_NAME, sessionId, getCookieOptions(maxAgeSeconds));
    return response;
};

export const getSessionIdFromRequest = (request: NextRequest): string | null => {
    return request.cookies.get(SESSION_COOKIE_NAME)?.value || null;
};

export const clearSessionCookie = (response: NextResponse): NextResponse => {
    response.cookies.set(SESSION_COOKIE_NAME, '', { ...getCookieOptions(0), maxAge: 0 });
    return response;
};

export const verifyAuth = (
    request: NextRequest
): { isAuthenticated: boolean; userId?: string; user?: CustomJwtPayload; error?: NextResponse } => {
    try {
        const token = getAccessTokenFromRequest(request);

        if (!token) {
            return {
                isAuthenticated: false,
                error: NextResponse.json(
                    {
                        success: false,
                        error: 'Authentication required',
                        message: 'No access token provided',
                    },
                    { status: 401 }
                ),
            };
        }

        const decoded = verifyAccessToken(token);

        if (!decoded) {
            return {
                isAuthenticated: false,
                error: NextResponse.json(
                    {
                        success: false,
                        error: 'Invalid or expired token',
                        message: 'Please login again',
                    },
                    { status: 401 }
                ),
            };
        }

        return {
            isAuthenticated: true,
            userId: decoded.userId,
            user: decoded,
        };
    } catch (error) {
        console.error('Auth verification error:', error);
        return {
            isAuthenticated: false,
            error: NextResponse.json(
                {
                    success: false,
                    error: 'Authentication failed',
                    message: 'An error occurred during authentication',
                },
                { status: 401 }
            ),
        };
    }
};

export const generateVerificationToken = (): string => {
    return crypto.randomBytes(32).toString('hex');
};

export const generateVerificationCode = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

export const getLocationFromIP = (_ip: string): string => {
    return 'Rwanda, Kigali';
};

export const isRwandanIP = (ip: string): boolean => {
    if (ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
        return true;
    }

    return true;
};

export const generateDeviceId = (userAgent: string, ip: string): string => {
    return crypto.createHash('sha256').update(userAgent + ip).digest('hex');
};

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
