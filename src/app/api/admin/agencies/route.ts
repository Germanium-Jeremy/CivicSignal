import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Agency from '@/models/Agency';
import User from '@/models/User';
import { verifyAdminAuth } from '@/lib/utils/adminAuth';

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const authResult = verifyAdminAuth(request);
    if (!authResult.isAuthorized) {
      return authResult.error;
    }

    await connectDB();

    // Get all agencies with primary officer details
    const agencies = await Agency.find()
      .populate('primaryOfficer', 'fullName email phone')
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      agencies: agencies.map(agency => ({
        _id: agency._id,
        name: agency.name,
        type: agency.type,
        registrationNumber: agency.registrationNumber,
        website: agency.website,
        address: agency.address,
        district: agency.district,
        sector: agency.sector,
        description: agency.description,
        serviceDomains: agency.serviceDomains,
        primaryOfficer: {
          fullName: (agency.primaryOfficer as any)?.fullName || 'N/A',
          email: (agency.primaryOfficer as any)?.email || 'N/A',
          phone: (agency.primaryOfficer as any)?.phone || 'N/A'
        },
        verificationStatus: agency.verificationStatus,
        isVerified: agency.isVerified,
        verificationNotes: agency.verificationNotes,
        createdAt: agency.createdAt,
        updatedAt: agency.updatedAt
      }))
    });

  } catch (error) {
    console.error('Get agencies error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
