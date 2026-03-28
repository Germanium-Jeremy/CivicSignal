import { NextRequest, NextResponse } from 'next/server';
import Issue from '@/models/Issue';
import { requireAuth, requireRole } from '@/lib/middleware';
import connectDB from '@/lib/mongodb';
import { getCategoryTemplateByName, isWorkflowTransitionAllowed } from '@/lib/services/issueTemplateService';
import { buildTenantQuery, resolveTenantContext } from '@/lib/utils/tenant';
import { generateIssueMarkdown } from '@/lib/utils/reportGenerator';
import { invalidateCache } from '@/lib/cache/responseCache';

// PATCH /api/admin/issues/[id]/status - Update issue status with workflow enforcement
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

    const { tenantId } = resolveTenantContext(request);
    const { id } = await params;
    const { status, comment } = await request.json();

    const validStatuses = ['submitted', 'acknowledged', 'pending', 'resolved', 'closed'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const issue = await Issue.findOne({ _id: id, ...buildTenantQuery(tenantId) });
    if (!issue) {
      return NextResponse.json({ error: 'Issue not found' }, { status: 404 });
    }

    const template = await getCategoryTemplateByName(issue.category, tenantId);
    if (template && !isWorkflowTransitionAllowed(template.workflow, issue.status, status)) {
      return NextResponse.json(
        {
          error: 'Workflow transition not allowed',
          details: {
            from: issue.status,
            to: status,
            allowedTransitions: template.workflow.transitions[issue.status] || [],
          },
        },
        { status: 400 }
      );
    }

    const previousStatus = issue.status;
    issue.status = status;

    const now = new Date();
    if (status === 'acknowledged') issue.acknowledgedAt = now;
    if (status === 'resolved') issue.resolvedAt = now;
    if (status === 'closed') issue.closedAt = now;

    issue.workflowHistory.push({
      fromStatus: previousStatus,
      toStatus: status,
      changedAt: now,
      changedBy: authResult.user!.userId,
      changedByModel: 'User',
      comment: comment?.trim() || undefined,
    } as any);

    issue.activities.push({
      action: 'status_changed',
      description: `Status changed from ${previousStatus} to ${status}${comment ? `: ${comment}` : ''}`,
      performedBy: authResult.user!.userId,
      performedByModel: 'User',
      timestamp: now,
      metadata: { role: 'admin' },
    } as any);

    issue.reportMarkdown = generateIssueMarkdown(issue);
    await issue.save();

    await invalidateCache(`issues:${tenantId}:`);

    const updated = await Issue.findById(issue._id)
      .populate('reportedBy', 'fullName email profileImage')
      .populate('assignedAgency', 'name type')
      .lean();

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating issue status:', error);
    return NextResponse.json({ error: 'Failed to update issue status' }, { status: 500 });
  }
}

