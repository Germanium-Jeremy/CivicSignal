import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Agency from '@/models/Agency';
import { verifyAdminAuth } from '@/lib/utils/adminAuth';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Verify admin authentication
    const authResult = verifyAdminAuth(request);
    if (!authResult.isAuthorized) {
      return authResult.error;
    }

    await connectDB();

    // Await params in Next.js 15+
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const { notes } = body;

    // Find and update agency
    const agency = await Agency.findById(id);
    
    if (!agency) {
      return NextResponse.json(
        { error: 'Agency not found' },
        { status: 404 }
      );
    }

    // Update verification status
    agency.verificationStatus = 'approved';
    agency.isVerified = true;
    agency.verifiedAt = new Date();
    
    // Only set verifiedBy if it's a real user ObjectId (not 'admin' string)
    if (authResult.userId && authResult.userId !== 'admin') {
      agency.verifiedBy = authResult.userId as any;
    }
    
    if (notes) {
      agency.verificationNotes = notes;
    } else {
      // Add default note for admin verification
      agency.verificationNotes = 'Verified by system administrator';
    }

    await agency.save();

    // TODO: Send notification to agency officer about approval

    return NextResponse.json({
      success: true,
      message: 'Agency approved successfully',
      agency: {
        _id: agency._id,
        name: agency.name,
        verificationStatus: agency.verificationStatus,
        isVerified: agency.isVerified
      }
    });

  } catch (error) {
    console.error('Approve agency error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
