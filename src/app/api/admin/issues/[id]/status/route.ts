import { NextRequest, NextResponse } from 'next/server';
import Issue from '@/models/Issue';
import { requireAuth, requireRole } from '@/lib/middleware';
import connectDB from '@/lib/mongodb';

// PATCH /api/admin/issues/[id]/status - Update issue status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    // Authentication and authorization
    const authResult = await requireAuth(request);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error || 'Authentication failed' }, { status: authResult.status || 500 });
    }

    const roleCheck = await requireRole(request, ['admin']);
    if (!roleCheck.success) {
      return NextResponse.json({ error: roleCheck.error || 'Authorization failed' }, { status: roleCheck.status || 500 });
    }

    const { status } = await request.json();

    const validStatuses = ['submitted', 'acknowledged', 'pending', 'resolved', 'closed'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    const updates: any = { status };
    
    // Set resolvedAt when status is resolved or closed
    if (status === 'resolved' || status === 'closed') {
      updates.resolvedAt = new Date();
    }

    const issue = await Issue.findByIdAndUpdate(
      params.id,
      updates,
      { new: true, runValidators: true }
    ).populate('reportedBy', 'fullName email').lean();

    if (!issue) {
      return NextResponse.json(
        { error: 'Issue not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: issue
    });

  } catch (error) {
    console.error('Error updating issue status:', error);
    return NextResponse.json(
      { error: 'Failed to update issue status' },
      { status: 500 }
    );
  }
}
