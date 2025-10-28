import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { generateVerificationCode, generateTokens } from '@/lib/utils/auth';
import { sendPhoneVerification } from '@/lib/services/notification';

// Verify phone with code
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const { phone, code } = await request.json();
    
    if (!phone || !code) {
      return NextResponse.json(
        { error: 'Phone number and verification code are required' }, 
        { status: 400 }
      );
    }

    // Find user with valid code
    const user = await User.findOne({
      phone: phone.replace(/\s/g, ''),
      phoneVerificationCode: code,
      phoneVerificationExpires: { $gt: new Date() }
    }).select('+phoneVerificationCode +phoneVerificationExpires');

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired verification code' }, 
        { status: 400 }
      );
    }

    // Update user verification status
    user.isPhoneVerified = true;
    user.phoneVerificationCode = undefined;
    user.phoneVerificationExpires = undefined;
    
    await user.save();

    // Check if both email and phone are verified, then generate tokens
    let tokens = null;
    if (user.isEmailVerified && user.isPhoneVerified) {
      const tokenPayload = {
        userId: user._id,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified
      };

      const { accessToken, refreshToken } = generateTokens(tokenPayload);
      
      // Store refresh token
      user.refreshTokens = user.refreshTokens || [];
      user.refreshTokens.push(refreshToken);
      
      // Keep only last 5 refresh tokens per user
      if (user.refreshTokens.length > 5) {
        user.refreshTokens = user.refreshTokens.slice(-5);
      }
      
      await user.save();
      
      tokens = {
        accessToken,
        refreshToken
      };
    }

    return NextResponse.json({
      success: true,
      message: 'Phone number verified successfully!',
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified
      },
      tokens: tokens, // Will be null if email not yet verified
      fullyVerified: user.isEmailVerified && user.isPhoneVerified
    });

  } catch (error) {
    console.error('Phone verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

// Resend phone verification code
export async function PATCH(request: NextRequest) {
  try {
    await connectDB();
    
    const { phone } = await request.json();
    
    if (!phone) {
      return NextResponse.json(
        { error: 'Phone number is required' }, 
        { status: 400 }
      );
    }

    // Find user
    const user = await User.findOne({ 
      phone: phone.replace(/\s/g, ''),
      isPhoneVerified: false 
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found or phone already verified' }, 
        { status: 404 }
      );
    }

    // Generate new verification code
    const newCode = generateVerificationCode();
    
    // Update user with new code
    user.phoneVerificationCode = newCode;
    user.phoneVerificationExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    
    await user.save();

    // Send new verification SMS
    const smsSent = await sendPhoneVerification(
      user.phone, 
      newCode, 
      user.fullName
    );

    return NextResponse.json({
      success: true,
      message: 'New verification code sent successfully!',
      smsSent
    });

  } catch (error) {
    console.error('Resend phone verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}
