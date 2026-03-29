import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import Issue from '@/models/Issue';
import { requireAuth } from '@/lib/middleware';
import { resolveTenantContext, buildTenantQuery } from '@/lib/utils/tenant';
import { generateIssueMarkdown } from '@/lib/utils/reportGenerator';
import { sanitizeText } from '@/lib/utils/sanitize';
import { getCategoryTemplateByName, validateEvidenceRules } from '@/lib/services/issueTemplateService';
import { invalidateCache } from '@/lib/cache/responseCache';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { tenantId } = resolveTenantContext(request);
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: 'Invalid id' }, { status: 400 });
    }

    const issue = await Issue.findOne({ _id: id, ...buildTenantQuery(tenantId) })
      .populate('reportedBy', 'fullName email profileImage')
      .populate('assignedAgency', 'name type')
      .lean();

    if (!issue) {
      return NextResponse.json({ success: false, error: 'Issue not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: { issue: { ...issue, photos: issue.media || [] } } });
  } catch (error) {
    console.error('GET issue error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch issue' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();

    const auth = await requireAuth(request);
    if (!auth.success || !auth.user?.userId) {
      return NextResponse.json({ success: false, error: auth.error || 'Authentication required' }, { status: auth.status || 401 });
    }

    const { tenantId } = resolveTenantContext(request);
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: 'Invalid id' }, { status: 400 });
    }

    const issue = await Issue.findOne({ _id: id, ...buildTenantQuery(tenantId) });
    if (!issue) {
      return NextResponse.json({ success: false, error: 'Issue not found' }, { status: 404 });
    }

    const isOwner = String(issue.reportedBy) === String(auth.user.userId);
    const isPrivileged = auth.user.role === 'admin' || auth.user.role === 'agency_officer';
    if (!isOwner && !isPrivileged) {
      return NextResponse.json({ success: false, error: 'Not allowed to update this issue' }, { status: 403 });
    }

    const body = await request.json();

    const incomingMedia = Array.isArray(body.media) ? body.media : Array.isArray(body.photos) ? body.photos : [];
    if (incomingMedia.length) {
      const normalizedMedia = incomingMedia
        .map((item: any) => ({
          url: sanitizeText(item.url || '', 2000),
          thumbnailUrl: sanitizeText(item.thumbnailUrl || '', 2000) || undefined,
          uploadedAt: new Date(),
          size: Number(item.size || 0),
          mimeType: sanitizeText(item.mimeType || 'image/jpeg', 100),
          mediaType: item.mediaType || (String(item.mimeType || '').startsWith('audio/') ? 'audio' : String(item.mimeType || '').startsWith('video/') ? 'video' : 'image'),
        }))
        .filter((item: any) => !!item.url);

      const template = await getCategoryTemplateByName(issue.category, tenantId);
      if (template) {
        const evidenceCheck = validateEvidenceRules(template.evidenceRules, [...issue.media, ...normalizedMedia]);
        if (!evidenceCheck.valid) {
          return NextResponse.json(
            {
              success: false,
              error: 'Evidence rules violated',
              details: evidenceCheck.errors,
            },
            { status: 400 }
          );
        }
      }

      issue.media = [...issue.media, ...normalizedMedia];
      issue.addActivity('submitted', `Reporter added ${normalizedMedia.length} evidence file(s)`, auth.user.userId as any, 'User');
    }

    if (typeof body.priority === 'string' && ['High', 'Medium', 'Low'].includes(body.priority)) {
      issue.priority = body.priority;
    }

    if (typeof body.description === 'string' && isOwner) {
      issue.description = sanitizeText(body.description, 5000);
    }

    issue.reportMarkdown = generateIssueMarkdown(issue);
    await issue.save();

    await invalidateCache(`issues:${tenantId}:`);

    return NextResponse.json({
      success: true,
      message: 'Issue updated successfully',
      data: {
        issue: {
          ...issue.toObject(),
          photos: issue.media,
        },
      },
    });
  } catch (error) {
    console.error('PATCH issue error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update issue' }, { status: 500 });
  }
}

