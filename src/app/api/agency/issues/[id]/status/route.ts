import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Issue from '@/models/Issue';
import Agency from '@/models/Agency';
import User from '@/models/User';
import { verifyAccessToken } from '@/lib/utils/auth';
import { getCategoryTemplateByName, isWorkflowTransitionAllowed } from '@/lib/services/issueTemplateService';
import { buildTenantQuery, resolveTenantContext } from '@/lib/utils/tenant';
import { generateIssueMarkdown } from '@/lib/utils/reportGenerator';
import { invalidateCache } from '@/lib/cache/responseCache';

// PATCH /api/agency/issues/[id]/status - Update issue status with workflow enforcement
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();

    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid access token' }, { status: 401 });
    }

    const userId = decoded.userId;
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.role !== 'agency_officer') {
      return NextResponse.json({ error: 'Access denied. Agency officer role required.' }, { status: 403 });
    }

    const agency = await Agency.findOne({ primaryOfficer: userId });
    if (!agency) {
      return NextResponse.json({ error: 'No agency found for this user' }, { status: 404 });
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

    if (!agency.serviceDomains.includes(issue.category)) {
      return NextResponse.json({ error: 'This issue is not within your agency service domain' }, { status: 403 });
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
      changedBy: userId as any,
      changedByModel: 'Agency',
      comment: comment?.trim() || undefined,
    });

    issue.activities.push({
      action: 'status_changed',
      description: `Status changed to ${status}${comment ? `: ${comment}` : ''}`,
      performedBy: userId as any,
      performedByModel: 'Agency',
      timestamp: now,
      metadata: { agencyId: agency._id },
    });

    issue.reportMarkdown = generateIssueMarkdown(issue);
    await issue.save();

    await invalidateCache(`issues:${tenantId}:`);

    const updatedIssue = await Issue.findById(issue._id)
      .populate('reportedBy', 'fullName email profileImage')
      .populate('assignedAgency', 'name type')
      .lean();

    return NextResponse.json({ success: true, data: updatedIssue });
  } catch (error) {
    console.error('Error updating issue status:', error);
    return NextResponse.json({ error: 'Failed to update issue status' }, { status: 500 });
  }
}

