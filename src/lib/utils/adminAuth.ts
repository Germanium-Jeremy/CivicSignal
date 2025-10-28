// Admin authentication middleware helper
import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from './auth';

export interface AdminAuthResult {
  isAuthorized: boolean;
  userId?: string;
  error?: NextResponse;
}

/**
 * Verify that the request is from an authenticated admin user
 */
export function verifyAdminAuth(request: NextRequest): AdminAuthResult {
  // Get token from Authorization header
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      isAuthorized: false,
      error: NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    };
  }

  const token = authHeader.split(' ')[1];

  // Verify token and get user info
  try {
    const decoded = verifyAccessToken(token);
    if (!decoded) {
      return {
        isAuthorized: false,
        error: NextResponse.json(
          { error: 'Invalid access token' },
          { status: 401 }
        )
      };
    }

    // Check if user is admin
    if (decoded.role !== 'admin') {
      return {
        isAuthorized: false,
        error: NextResponse.json(
          { error: 'Unauthorized. Admin access required.' },
          { status: 403 }
        )
      };
    }

    return {
      isAuthorized: true,
      userId: decoded.userId
    };
  } catch (err) {
    return {
      isAuthorized: false,
      error: NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    };
  }
}
