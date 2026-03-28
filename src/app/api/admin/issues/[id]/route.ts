import { NextRequest, NextResponse } from 'next/server';
import Issue from '@/models/Issue';
import { requireAuth, requireRole } from '@/lib/middleware';
import connectDB from '@/lib/mongodb';
import { buildTenantQuery, resolveTenantContext } from '@/lib/utils/tenant';
import { generateIssueMarkdown } from '@/lib/utils/reportGenerator';
import { invalidateCache } from '@/lib/cache/responseCache';

// GET /api/admin/issues/[id] - Get single issue
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();

    const authResult = await requireAuth(request);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error || 'Authentication failed' }, { status: authResult.status || 500 });
    }

    const roleCheck = await requireRole(request, ['admin']);
    if (!roleCheck.success) {
      return NextResponse.json({ error: roleCheck.error || 'Authorization failed' }, { status: roleCheck.status || 500 });
    }

    const { tenantId } = resolveTenantContext(request);
    const { id } = await params;

    const issue = await Issue.findOne({ _id: id, ...buildTenantQuery(tenantId) })
      .populate('reportedBy', 'fullName email profileImage')
      .populate('assignedAgency', 'name type')
      .lean();

    if (!issue) {
      return NextResponse.json({ error: 'Issue not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: { ...issue, photos: issue.media || [] } });
  } catch (error) {
    console.error('Error fetching issue:', error);
    return NextResponse.json({ error: 'Failed to fetch issue' }, { status: 500 });
  }
}

// PATCH /api/admin/issues/[id] - Update issue
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();

    const authResult = await requireAuth(request);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error || 'Authentication failed' }, { status: authResult.status || 500 });
    }

    const roleCheck = await requireRole(request, ['admin']);
    if (!roleCheck.success) {
      return NextResponse.json({ error: roleCheck.error || 'Authorization failed' }, { status: roleCheck.status || 500 });
    }

    const updates = await request.json();
    const { tenantId } = resolveTenantContext(request);
    const { id } = await params;

    const issue = await Issue.findOneAndUpdate(
      { _id: id, ...buildTenantQuery(tenantId) },
      updates,
      { new: true, runValidators: true }
    );

    if (!issue) {
      return NextResponse.json({ error: 'Issue not found' }, { status: 404 });
    }

    issue.reportMarkdown = generateIssueMarkdown(issue);
    await issue.save();

    await invalidateCache(`issues:${tenantId}:`);

    return NextResponse.json({ success: true, data: { ...issue.toObject(), photos: issue.media || [] } });
  } catch (error) {
    console.error('Error updating issue:', error);
    return NextResponse.json({ error: 'Failed to update issue' }, { status: 500 });
  }
}

// DELETE /api/admin/issues/[id] - Delete issue
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();

    const authResult = await requireAuth(request);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error || 'Authentication failed' }, { status: authResult.status || 500 });
    }

    const roleCheck = await requireRole(request, ['admin']);
    if (!roleCheck.success) {
      return NextResponse.json({ error: roleCheck.error || 'Authorization failed' }, { status: roleCheck.status || 500 });
    }

    const { tenantId } = resolveTenantContext(request);
    const { id } = await params;

    const issue = await Issue.findOneAndDelete({ _id: id, ...buildTenantQuery(tenantId) });

    if (!issue) {
      return NextResponse.json({ error: 'Issue not found' }, { status: 404 });
    }

    await invalidateCache(`issues:${tenantId}:`);

    return NextResponse.json({ success: true, message: 'Issue deleted successfully' });
  } catch (error) {
    console.error('Error deleting issue:', error);
    return NextResponse.json({ error: 'Failed to delete issue' }, { status: 500 });
  }
}

