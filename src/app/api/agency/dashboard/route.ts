import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Agency from '@/models/Agency';
import User from '@/models/User';
import { verifyAccessToken } from '@/lib/utils/auth';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Get token from Authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    
    // Verify token and get user ID
    const decoded = verifyAccessToken(token);
    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid access token' },
        { status: 401 }
      );
    }

    const userId = decoded.userId;

    // Get user details
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user is an agency officer
    if (user.role !== 'agency_officer') {
      return NextResponse.json(
        { error: 'Access denied. Agency officer role required.' },
        { status: 403 }
      );
    }

    // Find agency where user is primary officer
    const agency = await Agency.findOne({ primaryOfficer: userId });
    
    if (!agency) {
      return NextResponse.json(
        { error: 'No agency found for this user' },
        { status: 404 }
      );
    }

    // TODO: Get real issue statistics from Issue model when created
    // For now, return placeholder values
    const issueStats = {
      reported: { count: 0, change: 0, trend: 'up' },
      acknowledged: { count: 0, change: 0, trend: 'up' },
      pending: { count: 0, change: 0, trend: 'up' },
      resolved: { count: 0, change: 0, trend: 'up' }
    };

    // TODO: Get real recent issues from Issue model
    const recentIssues: String[] = [];

    return NextResponse.json({
      success: true,
      agency: {
        id: agency._id,
        name: agency.name,
        type: agency.type,
        registrationNumber: agency.registrationNumber,
        logo: '/images/pin.png', // Default logo for now
        isVerified: agency.isVerified,
        verificationStatus: agency.verificationStatus,
        address: agency.address,
        district: agency.district,
        sector: agency.sector,
        serviceDomains: agency.serviceDomains,
        createdAt: agency.createdAt
      },
      stats: issueStats,
      recentIssues: recentIssues,
      user: {
        fullName: user.fullName,
        email: user.email,
        phone: user.phone
      },
      notifications: 0 // TODO: Implement notifications
    });

  } catch (error) {
    console.error('Get agency dashboard error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
