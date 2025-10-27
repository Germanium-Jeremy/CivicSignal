import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/utils/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    userId: string;
    email: string;
    role: string;
    isEmailVerified: boolean;
    isPhoneVerified: boolean;
  };
}

// Middleware to verify JWT token
export async function authenticateToken(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        { error: 'Access token is required' }, 
        { status: 401 }
      );
    }

    // Verify token
    const decoded = verifyAccessToken(token);
    if (!decoded || typeof decoded === 'string') {
      return NextResponse.json(
        { error: 'Invalid or expired access token' }, 
        { status: 401 }
      );
    }

    // Connect to database and verify user still exists and is active
    await connectDB();
    const user = await User.findById(decoded.userId);
    
    if (!user || !user.isActive) {
      return NextResponse.json(
        { error: 'User not found or account deactivated' }, 
        { status: 401 }
      );
    }

    // Add user info to request
    (request as AuthenticatedRequest).user = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      isPhoneVerified: user.isPhoneVerified
    };

    return null; // No error, continue
  } catch (error) {
    console.error('Authentication error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' }, 
      { status: 401 }
    );
  }
}

// Middleware to check if user has required role
export function requireRole(allowedRoles: string[]) {
  return (request: AuthenticatedRequest) => {
    if (!request.user) {
      return NextResponse.json(
        { error: 'Authentication required' }, 
        { status: 401 }
      );
    }

    if (!allowedRoles.includes(request.user.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' }, 
        { status: 403 }
      );
    }

    return null; // No error, continue
  };
}

// Middleware to check if user is fully verified
export function requireVerification(request: AuthenticatedRequest) {
  if (!request.user) {
    return NextResponse.json(
      { error: 'Authentication required' }, 
      { status: 401 }
    );
  }

  if (!request.user.isEmailVerified || !request.user.isPhoneVerified) {
    return NextResponse.json(
      { 
        error: 'Account verification required',
        requiresVerification: true,
        emailVerified: request.user.isEmailVerified,
        phoneVerified: request.user.isPhoneVerified
      }, 
      { status: 403 }
    );
  }

  return null; // No error, continue
}

// Helper function to apply multiple middlewares
export function applyMiddleware(
  request: NextRequest, 
  middlewares: ((req: any) => NextResponse | null)[]
) {
  for (const middleware of middlewares) {
    const result = middleware(request);
    if (result) {
      return result; // Return error response
    }
  }
  return null; // All middlewares passed
}
