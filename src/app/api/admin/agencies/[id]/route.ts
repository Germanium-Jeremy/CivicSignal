import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Agency from '@/models/Agency';
import { verifyAdminAuth } from '@/lib/utils/adminAuth';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin authentication
    const authResult = verifyAdminAuth(request);
    if (!authResult.isAuthorized) {
      return authResult.error;
    }

    await connectDB();

    // Await params in Next.js 15+
    const { id } = await params;

    // Find and delete agency
    const agency = await Agency.findByIdAndDelete(id);
    
    if (!agency) {
      return NextResponse.json(
        { error: 'Agency not found' },
        { status: 404 }
      );
    }

    // TODO: Consider what to do with agency officers (change their role back to citizen?)
    // TODO: Handle cascading deletes (issues, reports related to this agency)

    return NextResponse.json({
      success: true,
      message: 'Agency deleted successfully',
      deletedAgency: {
        _id: agency._id,
        name: agency.name
      }
    });

  } catch (error) {
    console.error('Delete agency error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin authentication
    const authResult = verifyAdminAuth(request);
    if (!authResult.isAuthorized) {
      return authResult.error;
    }

    await connectDB();

    // Await params in Next.js 15+
    const { id } = await params;

    // Find agency with primary officer details
    const agency = await Agency.findById(id)
      .populate('primaryOfficer', 'fullName email phone');
    
    if (!agency) {
      return NextResponse.json(
        { error: 'Agency not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      agency: {
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
        verifiedBy: agency.verifiedBy,
        verifiedAt: agency.verifiedAt,
        createdAt: agency.createdAt,
        updatedAt: agency.updatedAt
      }
    });

  } catch (error) {
    console.error('Get agency error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
