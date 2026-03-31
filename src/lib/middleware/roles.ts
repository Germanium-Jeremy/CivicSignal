import { NextRequest } from 'next/server';
import { getSessionIdFromRequest, verifyAuth } from '@/lib/utils/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { getServerSession } from '@/lib/session/sessionStore';

export interface AuthResult {
  success: boolean;
  user?: {
    userId: string;
    email: string;
    role: string;
    isEmailVerified: boolean;
    isPhoneVerified: boolean;
    tenantId?: string;
  };
  error?: string;
  status?: number;
}

export async function requireAuth(request: NextRequest): Promise<AuthResult> {
  try {
    const authResult = verifyAuth(request);
    let authenticatedUser: AuthResult['user'] | null = null;

    if (authResult.isAuthenticated && authResult.userId && authResult.user) {
      authenticatedUser = {
        userId: authResult.userId,
        email: authResult.user.email,
        role: authResult.user.role,
        isEmailVerified: authResult.user.isEmailVerified,
        isPhoneVerified: authResult.user.isPhoneVerified,
        tenantId: authResult.user.tenantId,
      };
    }

    if (!authenticatedUser) {
      const sessionId = getSessionIdFromRequest(request);
      if (sessionId) {
        const session = await getServerSession(sessionId);
        if (session) {
          authenticatedUser = {
            userId: session.userId,
            email: session.email,
            role: session.role,
            isEmailVerified: session.isEmailVerified,
            isPhoneVerified: session.isPhoneVerified,
            tenantId: session.tenantId,
          };
        }
      }
    }

    if (!authenticatedUser) {
      return {
        success: false,
        error: 'Authentication required',
        status: 401
      };
    }

    // Connect to database and verify user still exists and is active
    await connectDB();
    const user = await User.findById(authenticatedUser.userId);
    
    if (!user || !user.isActive) {
      return {
        success: false,
        error: 'User not found or account deactivated',
        status: 401
      };
    }

    return {
      success: true,
      user: {
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified,
        tenantId: authenticatedUser.tenantId,
      }
    };

  } catch (error) {
    console.error('Authentication error:', error);
    return {
      success: false,
      error: 'Authentication failed',
      status: 401
    };
  }
}

export async function requireRole(request: NextRequest, allowedRoles: string[]): Promise<AuthResult> {
  try {
    const authResult = await requireAuth(request);
    
    if (!authResult.success) {
      return authResult;
    }

    if (!authResult.user || !allowedRoles.includes(authResult.user.role)) {
      return {
        success: false,
        error: authResult.error ? authResult.error : 'Insufficient permissions',
        status: 403
      };
    }

    return { success: true };

  } catch (error) {
    console.error('Role verification error:', error);
    return {
      success: false,
      error: 'Authorization failed',
      status: 500
    };
  }
}
