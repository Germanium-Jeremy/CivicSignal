import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { comparePassword, generateTokens, isRwandanIP, generateDeviceId, getDeviceName, getLocationFromIP } from '@/lib/utils/auth';
import { sendEmail } from '@/lib/services/notification';
import { ADMIN_CONFIG, isAdminCredentials } from '@/config/admin';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const { email, password, deviceInfo } = await request.json();
    
    // Get client IP and check if it's from Rwanda
    const clientIP = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     '127.0.0.1';
    
    if (!isRwandanIP(clientIP)) {
      return NextResponse.json(
        { error: 'Access denied. Service is only available in Rwanda.' }, 
        { status: 403 }
      );
    }

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' }, 
        { status: 400 }
      );
    }

    // Check if this is an admin login
    if (isAdminCredentials(email, password)) {
      // Generate tokens for admin
      const adminTokenPayload = {
        userId: 'admin',
        email: ADMIN_CONFIG.email,
        role: ADMIN_CONFIG.role,
        isEmailVerified: true,
        isPhoneVerified: true
      };

      const { accessToken, refreshToken } = generateTokens(adminTokenPayload);

      return NextResponse.json({
        success: true,
        message: 'Admin login successful',
        user: {
          id: 'admin',
          fullName: ADMIN_CONFIG.fullName,
          email: ADMIN_CONFIG.email,
          role: ADMIN_CONFIG.role,
          isEmailVerified: true,
          isPhoneVerified: true
        },
        tokens: {
          accessToken,
          refreshToken
        },
        isAdmin: true
      });
    }

    // Find user and include password for comparison
    const user = await User.findOne({ email }).select('+password +refreshTokens');
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' }, 
        { status: 401 }
      );
    }

    // Check if user is active
    if (!user.isActive) {
      return NextResponse.json(
        { error: 'Account is deactivated. Please contact support.' }, 
        { status: 401 }
      );
    }

    // Check password
    const isValidPassword = await comparePassword(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' }, 
        { status: 401 }
      );
    }

    // Check if both email and phone are verified
    if (!user.isEmailVerified || !user.isPhoneVerified) {
      return NextResponse.json(
        { 
          error: 'Account not fully verified', 
          requiresVerification: true,
          emailVerified: user.isEmailVerified,
          phoneVerified: user.isPhoneVerified
        }, 
        { status: 403 }
      );
    }

    // Generate device info
    const userAgent = request.headers.get('user-agent') || '';
    const deviceId = generateDeviceId(userAgent, clientIP);
    const deviceName = getDeviceName(userAgent);
    const location = getLocationFromIP(clientIP);

    // Check if this is a new device
    const existingDevice = user.loginDevices.find((device: any) => device.deviceId === deviceId);
    const isNewDevice = !existingDevice;

    // Update or add device info
    if (existingDevice) {
      existingDevice.lastLogin = new Date();
      existingDevice.isActive = true;
    } else {
      user.loginDevices.push({
        deviceId,
        deviceName,
        ipAddress: clientIP,
        location,
        lastLogin: new Date(),
        isActive: true
      });

      // Send new device login alert
      // await sendEmail(user.email, 'new-device-login', {
      //   fullName: user.fullName,
      //   deviceName,
      //   location,
      //   ipAddress: clientIP,
      //   loginTime: new Date().toLocaleString()
      // });
    }

    // Generate tokens
    const tokenPayload = {
      userId: user._id,
      email: user.email,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      isPhoneVerified: user.isPhoneVerified
    };

    const { accessToken, refreshToken } = generateTokens(tokenPayload);

    // Store refresh token
    user.refreshTokens.push(refreshToken);
    
    // Keep only last 5 refresh tokens per user
    if (user.refreshTokens.length > 5) {
      user.refreshTokens = user.refreshTokens.slice(-5);
    }

    await user.save();

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified,
        createdAt: user.createdAt
      },
      tokens: {
        accessToken,
        refreshToken
      },
      isNewDevice
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}
