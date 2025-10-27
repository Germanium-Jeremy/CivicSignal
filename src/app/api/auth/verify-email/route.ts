import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { generateVerificationCode } from '@/lib/utils/auth';
import { sendEmail } from '@/lib/services/notification';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const { email, code } = await request.json();
    
    if (!email || !code) {
      return NextResponse.json(
        { error: 'Email and verification code are required' }, 
        { status: 400 }
      );
    }

    // Validate code format (6 digits)
    if (!/^\d{6}$/.test(code)) {
      return NextResponse.json(
        { error: 'Invalid verification code format' }, 
        { status: 400 }
      );
    }

    // Find user with valid code
    const user = await User.findOne({
      email: email.toLowerCase(),
      emailVerificationCode: code,
      emailVerificationExpires: { $gt: new Date() }
    }).select('+emailVerificationCode +emailVerificationExpires');

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired verification code' }, 
        { status: 400 }
      );
    }

    // Update user verification status
    user.isEmailVerified = true;
    user.emailVerificationCode = undefined;
    user.emailVerificationExpires = undefined;
    
    await user.save();

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully!',
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified
      }
    });

  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

// GET method - return info about verification requirements
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter is required' }, 
        { status: 400 }
      );
    }

    await connectDB();
    
    // Find user and check verification status
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' }, 
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      isEmailVerified: user.isEmailVerified,
      isPhoneVerified: user.isPhoneVerified,
      email: user.email,
      phone: user.phone
    });

  } catch (error) {
    console.error('Email verification status error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

// PATCH method - resend email verification code
export async function PATCH(request: NextRequest) {
  try {
    await connectDB();
    
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' }, 
        { status: 400 }
      );
    }

    // Find user
    const user = await User.findOne({ 
      email: email.toLowerCase(),
      isEmailVerified: false 
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found or email already verified' }, 
        { status: 404 }
      );
    }

    // Generate new verification code
    const newCode = generateVerificationCode();
    
    // Update user with new code
    user.emailVerificationCode = newCode;
    user.emailVerificationExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    
    await user.save();

    // Send new verification email
    const emailSent = await sendEmail(user.email, 'email-verification', {
      fullName: user.fullName,
      verificationCode: newCode
    });

    return NextResponse.json({
      success: true,
      message: 'New verification code sent successfully!',
      emailSent
    });

  } catch (error) {
    console.error('Resend email verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}
