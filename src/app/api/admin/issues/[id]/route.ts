import { NextRequest, NextResponse } from 'next/server';
import Issue from '@/models/Issue';
import { requireAuth, requireRole } from '@/lib/middleware';
import connectDB from '@/lib/mongodb';

// GET /api/admin/issues/[id] - Get single issue
export async function GET(
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

    const issue = await Issue.findById(params.id)
      .select('_id title description category status priority location photos assignedTo trackingNumber')
      .lean();
    
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
    console.error('Error fetching issue:', error);
    return NextResponse.json(
      { error: 'Failed to fetch issue' },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/issues/[id] - Update issue
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

    const updates = await request.json();
    
    const issue = await Issue.findByIdAndUpdate(
      params.id,
      updates,
      { new: true, runValidators: true }
    ).select('_id title description category status priority location photos assignedTo trackingNumber')
    .lean();

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
    console.error('Error updating issue:', error);
    return NextResponse.json(
      { error: 'Failed to update issue' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/issues/[id] - Delete issue
export async function DELETE(
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

    const issue = await Issue.findByIdAndDelete(params.id);
    
    if (!issue) {
      return NextResponse.json(
        { error: 'Issue not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Issue deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting issue:', error);
    return NextResponse.json(
      { error: 'Failed to delete issue' },
      { status: 500 }
    );
  }
}