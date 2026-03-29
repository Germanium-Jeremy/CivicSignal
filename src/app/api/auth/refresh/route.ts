import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import {
  verifyRefreshToken,
  generateTokens,
  attachAuthCookies,
  attachSessionCookie,
  getRefreshTokenFromRequest,
  getSessionIdFromRequest,
} from '@/lib/utils/auth';
import { createServerSession, destroyServerSession } from '@/lib/session/sessionStore';
import { resolveTenantContext } from '@/lib/utils/tenant';

export async function POST(request: NextRequest) {
     try {
          await connectDB();
          
          const body = await request.json().catch(() => ({}));
          const refreshToken = body?.refreshToken || getRefreshTokenFromRequest(request);
          
          if (!refreshToken) {
               return NextResponse.json({ error: 'Refresh token is required' }, { status: 400 });
          }

          // Verify refresh token
          const decoded = verifyRefreshToken(refreshToken);
          if (!decoded) {
               return NextResponse.json({ error: 'Invalid refresh token' }, { status: 401 });
          }

          // Find user and check if refresh token exists
          const user = await User.findById(decoded.userId).select('+refreshTokens');
          if (!user || !user.refreshTokens.includes(refreshToken)) {
               return NextResponse.json({ error: 'Invalid refresh token' }, { status: 401 });
          }

          // Check if user is still active
          if (!user.isActive) {
               return NextResponse.json({ error: 'Account is deactivated' }, { status: 401 });
          }

          // Generate new tokens
          const tokenPayload = {
               userId: user._id,
               email: user.email,
               role: user.role,
               isEmailVerified: user.isEmailVerified,
               isPhoneVerified: user.isPhoneVerified
          };

          const { accessToken, refreshToken: newRefreshToken } = generateTokens(tokenPayload);
          const { tenantId } = resolveTenantContext(request);

          // Replace old refresh token with new one
          const tokenIndex = user.refreshTokens.indexOf(refreshToken);
          user.refreshTokens[tokenIndex] = newRefreshToken;
          
          await user.save();

          const response = NextResponse.json({
               success: true,
               message: 'Tokens refreshed successfully',
               tokens: { accessToken, refreshToken: newRefreshToken }
          });

          const currentSessionId = getSessionIdFromRequest(request);
          if (currentSessionId) {
            await destroyServerSession(currentSessionId);
          }

          const session = await createServerSession({
            userId: String(user._id),
            email: user.email,
            role: user.role,
            isEmailVerified: user.isEmailVerified,
            isPhoneVerified: user.isPhoneVerified,
            tenantId,
          });

          attachAuthCookies(response, { accessToken, refreshToken: newRefreshToken });
          attachSessionCookie(response, session.sessionId, session.ttlSeconds);
          return response;

     } catch (error) {
          console.error('Token refresh error:', error);
          return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
     }
}
