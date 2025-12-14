import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Agency from '@/models/Agency';
import User from '@/models/User';
import Issue from '@/models/Issue';
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

    // Get real issue statistics from Issue model
    const issueStats = await Issue.aggregate([
      {
        $match: {
          // Filter by agency's service domains if needed
          // For now, get all issues
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Convert aggregation results to expected format
    const statsMap = {
      submitted: { count: 0, change: 0, trend: 'up' },
      acknowledged: { count: 0, change: 0, trend: 'up' },
      pending: { count: 0, change: 0, trend: 'up' },
      resolved: { count: 0, change: 0, trend: 'up' }
    };

    issueStats.forEach(stat => {
      const status = stat._id as string;
      if (status === 'submitted' || status === 'acknowledged' || status === 'pending' || status === 'resolved') {
        statsMap[status].count = stat.count;
      }
    });

    // Get recent issues (last 5)
    const recentIssues = await Issue.find()
      .sort({ submittedAt: -1 })
      .limit(5)
      .select('title status priority category submittedAt trackingNumber')
      .lean();

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
      stats: {
        reported: statsMap.submitted,
        acknowledged: statsMap.acknowledged,
        pending: statsMap.pending,
        resolved: statsMap.resolved
      },
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
