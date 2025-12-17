import { NextRequest, NextResponse } from 'next/server';
import Issue from '@/models/Issue';
import Agency from '@/models/Agency';
import User from '@/models/User';
import { verifyAccessToken } from '@/lib/utils/auth';
import { getCategoryByName } from '@/config/categories';
import connectDB from '@/lib/mongodb';

// PATCH /api/agency/issues/[id]/status - Update issue status
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    
    // Authentication and authorization (same as other agency APIs)
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

    // Await params in Next.js 15+
    const { id } = await params;

    const { status, comment } = await request.json();

    const validStatuses = ['submitted', 'acknowledged', 'pending', 'resolved'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    // Find the issue
    const issue = await Issue.findById(id);
    if (!issue) {
      return NextResponse.json(
        { error: 'Issue not found' },
        { status: 404 }
      );
    }

    // Check if issue belongs to agency's service domains
    const categoryInfo = getCategoryByName(issue.category);
    if (!categoryInfo || !agency.serviceDomains.includes(issue.category)) {
      return NextResponse.json(
        { error: 'This issue is not within your agency\'s service domain' },
        { status: 403 }
      );
    }

    const updates: any = { status };
    
    // Set resolvedAt when status is resolved
    if (status === 'resolved') {
      updates.resolvedAt = new Date();
    }

    // Add status change comment if provided
    if (comment && comment.trim()) {
      updates.statusHistory = updates.statusHistory || [];
      updates.statusHistory.push({
        status,
        comment: comment.trim(),
        changedAt: new Date(),
        changedBy: agency.name // Use agency name instead of admin ID
      });
    }

    const updatedIssue = await Issue.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    ).populate('reportedBy', 'fullName email').lean();

    return NextResponse.json({
      success: true,
      data: updatedIssue
    });

  } catch (error) {
    console.error('Error updating issue status:', error);
    return NextResponse.json(
      { error: 'Failed to update issue status' },
      { status: 500 }
    );
  }
}
