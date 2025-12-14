import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/utils/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export interface AuthResult {
  success: boolean;
  user?: {
    userId: string;
    email: string;
    role: string;
    isEmailVerified: boolean;
    isPhoneVerified: boolean;
  };
  error?: string;
  status?: number;
}

export async function requireAuth(request: NextRequest): Promise<AuthResult> {
  try {
    const authResult = verifyAuth(request);
    
    console.log('Auth result:', { 
      isAuthenticated: authResult.isAuthenticated, 
      userId: authResult.userId,
      error: authResult.error 
    });
    
    if (!authResult.isAuthenticated) {
      let errorMessage = 'Authentication required';
      if (authResult.error) {
        try {
          // Try to extract error message from NextResponse
          const errorResponse = authResult.error as NextResponse;
          const errorData = await errorResponse.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          errorMessage = 'Authentication failed';
        }
      }
      
      return {
        success: false,
        error: errorMessage,
        status: 401
      };
    }

    // Connect to database and verify user still exists and is active
    await connectDB();
    const user = await User.findById(authResult.userId);
    
    console.log('Found user:', { 
      userId: user?._id, 
      email: user?.email, 
      role: user?.role,
      isActive: user?.isActive 
    });
    
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
        isPhoneVerified: user.isPhoneVerified
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
