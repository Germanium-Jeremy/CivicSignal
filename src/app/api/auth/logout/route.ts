import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { verifyAccessToken, generateDeviceId } from '@/lib/utils/auth';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const { refreshToken, logoutAll = false } = await request.json();
    
    // Get access token from Authorization header
    const authHeader = request.headers.get('authorization');
    const accessToken = authHeader?.replace('Bearer ', '');
    
    if (!accessToken) {
      return NextResponse.json(
        { error: 'Access token is required' }, 
        { status: 401 }
      );
    }

    // Verify access token
    const decoded = verifyAccessToken(accessToken);
    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid access token' }, 
        { status: 401 }
      );
    }

    // Find user
    const user = await User.findById(decoded.userId).select('+refreshTokens');
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' }, 
        { status: 404 }
      );
    }

    if (logoutAll) {
      // Logout from all devices
      user.refreshTokens = [];
      user.loginDevices.forEach((device: any) => {
        device.isActive = false;
      });
    } else {
      // Logout from current device only
      if (refreshToken) {
        // Remove specific refresh token
        user.refreshTokens = user.refreshTokens.filter((token: String) => token !== refreshToken);
      }
      
      // Deactivate current device
      const clientIP = request.headers.get('x-forwarded-for') || 
                       request.headers.get('x-real-ip') || 
                       '127.0.0.1';
      const userAgent = request.headers.get('user-agent') || '';
      const deviceId = generateDeviceId(userAgent, clientIP);
      
      const currentDevice = user.loginDevices.find((device: any) => device.deviceId === deviceId);
      if (currentDevice) {
        currentDevice.isActive = false;
      }
    }
    
    await user.save();

    return NextResponse.json({
      success: true,
      message: logoutAll ? 'Logged out from all devices successfully' : 'Logged out successfully'
    });

  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}
