import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import Issue, { IIssueMedia } from '@/models/Issue';
import { requireAuth } from '@/lib/middleware';
import { checkSubmissionLimit } from '@/lib/utils/deviceVerification';
import { calculateSlaDeadline, getCategoryTemplateByName, validateCustomFields, validateEvidenceRules, validateLocationForPolicy } from '@/lib/services/issueTemplateService';
import { generateIssueMarkdown } from '@/lib/utils/reportGenerator';
import { sanitizeRecord, sanitizeText } from '@/lib/utils/sanitize';
import { buildTenantQuery, resolveTenantContext } from '@/lib/utils/tenant';
import { getOrSetCache, invalidateCache } from '@/lib/cache/responseCache';

const ISSUES_CACHE_TTL_MS = 30 * 1000;

function normalizePriority(priority?: string): 'High' | 'Medium' | 'Low' {
  const value = String(priority || '').toLowerCase();
  if (value === 'high' || value === 'urgent') return 'High';
  if (value === 'low') return 'Low';
  return 'Medium';
}

function normalizeSource(source?: string): 'web' | 'mobile' | 'ios' | 'android' | 'api' {
  const value = String(source || '').toLowerCase();
  if (value === 'mobile') return 'mobile';
  if (value === 'ios') return 'ios';
  if (value === 'android') return 'android';
  if (value === 'api') return 'api';
  return 'web';
}

function mapIncomingLocation(location: any) {
  if (!location) return null;

  if (typeof location.latitude === 'number' && typeof location.longitude === 'number') {
    return {
      type: 'Point' as const,
      coordinates: [location.longitude, location.latitude] as [number, number],
      address: sanitizeText(location.address || '', 300) || undefined,
      district: sanitizeText(location.district || '', 120) || undefined,
      sector: sanitizeText(location.sector || '', 120) || undefined,
    };
  }

  if (location.coordinates && Array.isArray(location.coordinates) && location.coordinates.length === 2) {
    const [longitude, latitude] = location.coordinates;
    if (typeof latitude === 'number' && typeof longitude === 'number') {
      return {
        type: 'Point' as const,
        coordinates: [longitude, latitude] as [number, number],
        address: sanitizeText(location.address || '', 300) || undefined,
        district: sanitizeText(location.district || '', 120) || undefined,
        sector: sanitizeText(location.sector || '', 120) || undefined,
      };
    }
  }

  if (location.address || location.district || location.sector) {
    return {
      type: 'Point' as const,
      coordinates: [0, 0] as [number, number],
      address: sanitizeText(location.address || '', 300) || undefined,
      district: sanitizeText(location.district || '', 120) || undefined,
      sector: sanitizeText(location.sector || '', 120) || undefined,
    };
  }

  return null;
}

function buildGeospatialSummary(issues: any[]) {
  const hotspotMap = new Map<string, { key: string; latitude: number; longitude: number; count: number; categories: Set<string> }>();

  for (const issue of issues) {
    const coords = issue.location?.coordinates;
    if (!coords || coords.length !== 2) continue;

    const [longitude, latitude] = coords;
    const cellLat = Number(latitude.toFixed(3));
    const cellLng = Number(longitude.toFixed(3));
    const key = `${cellLat},${cellLng}`;

    const existing = hotspotMap.get(key);
    if (!existing) {
      hotspotMap.set(key, {
        key,
        latitude: cellLat,
        longitude: cellLng,
        count: 1,
        categories: new Set([issue.category]),
      });
      continue;
    }

    existing.count += 1;
    existing.categories.add(issue.category);
  }

  return [...hotspotMap.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, 30)
    .map((cell) => ({
      latitude: cell.latitude,
      longitude: cell.longitude,
      count: cell.count,
      categories: [...cell.categories],
    }));
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { tenantId } = resolveTenantContext(request);
    const { searchParams } = new URL(request.url);

    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(200, Math.max(1, parseInt(searchParams.get('limit') || '100', 10)));
    const skip = (page - 1) * limit;

    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const category = searchParams.get('category');
    const district = searchParams.get('district');
    const sector = searchParams.get('sector');
    const userId = searchParams.get('userId');
    const includeGeoSummary = searchParams.get('geoSummary') === 'true';

    const latitude = searchParams.get('latitude');
    const longitude = searchParams.get('longitude');
    const radius = Math.min(25000, Math.max(100, parseInt(searchParams.get('radius') || '5000', 10)));

    const cacheKey = `issues:${tenantId}:${searchParams.toString()}`;

    const result = await getOrSetCache(cacheKey, ISSUES_CACHE_TTL_MS, async () => {
      const query: any = {
        ...buildTenantQuery(tenantId),
        isPublic: true,
      };

      if (status) query.status = status;
      if (priority) query.priority = priority;
      if (category) query.category = category;
      if (district) query['location.district'] = district;
      if (sector) query['location.sector'] = sector;

      if (userId && mongoose.Types.ObjectId.isValid(userId)) {
        query.reportedBy = userId;
        delete query.isPublic;
      }

      if (latitude && longitude) {
        query.location = {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [parseFloat(longitude), parseFloat(latitude)],
            },
            $maxDistance: radius,
          },
        };
      }

      const issues = await Issue.find(query)
        .populate('reportedBy', 'fullName email profileImage')
        .populate('assignedAgency', 'name type')
        .sort({ submittedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      const total = await Issue.countDocuments(query);

      const transformedIssues = issues.map((issue: any) => ({
        ...issue,
      }));

      return {
        issues: transformedIssues,
        total,
        geospatial: includeGeoSummary ? buildGeospatialSummary(transformedIssues) : undefined,
      };
    });

    return NextResponse.json({
      success: true,
      message: 'Issues retrieved successfully',
      data: {
        issues: result.issues,
        geospatial: result.geospatial,
        pagination: {
          page,
          limit,
          total: result.total,
          totalPages: Math.ceil(result.total / limit),
        },
      },
    });
  } catch (error) {
    console.error('Get issues error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch issues' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const auth = await requireAuth(request);
    if (!auth.success || !auth.user?.userId) {
      return NextResponse.json({ success: false, error: auth.error || 'Authentication required' }, { status: auth.status || 401 });
    }

    const { tenantId, tenantSlug } = resolveTenantContext(request);
    const body = await request.json();

    const categoryInput = sanitizeText(body.category || '', 120);
    if (!categoryInput) {
      return NextResponse.json({ success: false, error: 'Category is required' }, { status: 400 });
    }

    const categoryTemplate = await getCategoryTemplateByName(categoryInput, tenantId);
    if (!categoryTemplate) {
      return NextResponse.json({ success: false, error: 'Invalid category for this tenant' }, { status: 400 });
    }

    const rawCustomFields = (body.customFields || {}) as Record<string, unknown>;
    const fieldValidation = validateCustomFields(categoryTemplate.fields, rawCustomFields);
    if (!fieldValidation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: 'Category field validation failed',
          details: fieldValidation.errors,
        },
        { status: 400 }
      );
    }

    const rawMedia = Array.isArray(body.media) ? body.media : Array.isArray(body.photos) ? body.photos : [];
    const media: IIssueMedia[] = rawMedia
      .map((item: any) => ({
        url: sanitizeText(item.url || '', 2000),
        thumbnailUrl: sanitizeText(item.thumbnailUrl || '', 2000) || undefined,
        uploadedAt: new Date(),
        size: Number(item.size || 0),
        mimeType: sanitizeText(item.mimeType || 'image/jpeg', 100),
        mediaType: item.mediaType || (String(item.mimeType || '').startsWith('audio/') ? 'audio' : String(item.mimeType || '').startsWith('video/') ? 'video' : 'image'),
      }))
      .filter((item: IIssueMedia) => !!item.url);

    const evidenceValidation = validateEvidenceRules(categoryTemplate.evidenceRules, media);
    if (!evidenceValidation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: 'Evidence does not meet category requirements',
          details: evidenceValidation.errors,
        },
        { status: 400 }
      );
    }

    const locationInput = body.location || null;
    const locationValidation = validateLocationForPolicy(categoryTemplate.locationPolicy, locationInput);
    if (!locationValidation.valid) {
      return NextResponse.json({ success: false, error: locationValidation.error }, { status: 400 });
    }

    const finalLocation = mapIncomingLocation(locationInput);
    const hasValidCoordinates = Boolean(finalLocation && finalLocation.coordinates[0] !== 0 && finalLocation.coordinates[1] !== 0);

    const submissionCheck = await checkSubmissionLimit(auth.user.userId);
    if (!submissionCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: 'Daily submission limit reached',
          remaining: submissionCheck.remaining,
          resetAt: submissionCheck.resetAt,
        },
        { status: 429 }
      );
    }

    const description = sanitizeText(body.description || '', 5000);
    const titleFromBody = sanitizeText(body.title || '', 200);
    const snippet = description.split(/\s+/).slice(0, 8).join(' ').trim();
    const derivedTitle = `${categoryTemplate.name}${snippet ? `: ${snippet}` : ''}`;
    const title = titleFromBody || derivedTitle;

    const issue = new Issue({
      tenantId,
      tenantSlug,
      title,
      description: description || undefined,
      category: categoryTemplate.name,
      categoryTemplateId: categoryTemplate.id,
      categoryTemplateVersion: categoryTemplate.templateVersion,
      priority: normalizePriority(body.priority || categoryTemplate.priority),
      status: categoryTemplate.workflow.initialStatus,
      location: finalLocation || undefined,
      media,
      customFields: sanitizeRecord(fieldValidation.sanitizedFields),
      slaDeadline: calculateSlaDeadline(categoryTemplate.slaHours),
      reportedBy: auth.user.userId,
      reporterDevice: {
        deviceId: sanitizeText(body.deviceInfo?.deviceId || 'web-portal', 120),
        deviceModel: sanitizeText(body.deviceInfo?.deviceModel || '', 200) || undefined,
        osVersion: sanitizeText(body.deviceInfo?.osVersion || '', 80) || undefined,
        appVersion: sanitizeText(body.deviceInfo?.appVersion || '', 80) || undefined,
        registeredAt: new Date(),
      },
      submittedAt: new Date(),
      isPublic: true,
      showOnMap: Boolean(finalLocation && hasValidCoordinates),
      viewCount: 0,
      upvoteCount: 0,
      upvotedBy: [],
      source: normalizeSource(body.source || body.deviceInfo?.platform),
      activities: [
        {
          action: 'submitted',
          description: 'Issue submitted by citizen',
          performedBy: auth.user.userId,
          performedByModel: 'User',
          timestamp: new Date(),
        },
      ],
      workflowHistory: [
        {
          toStatus: categoryTemplate.workflow.initialStatus,
          changedAt: new Date(),
          changedBy: auth.user.userId,
          changedByModel: 'User',
          comment: 'Initial submission',
        },
      ],
    });

    issue.reportMarkdown = generateIssueMarkdown(issue);

    await issue.save();
    await issue.populate('reportedBy', 'fullName email profileImage');

    await invalidateCache(`issues:${tenantId}:`);

    return NextResponse.json(
      {
        success: true,
        message: 'Issue reported successfully',
        data: {
          issue: {
            _id: issue._id,
            trackingNumber: issue.trackingNumber,
            title: issue.title,
            description: issue.description,
            category: issue.category,
            categoryTemplateId: issue.categoryTemplateId,
            categoryTemplateVersion: issue.categoryTemplateVersion,
            priority: issue.priority,
            status: issue.status,
            location: issue.location,
            media: issue.media,
            customFields: issue.customFields,
            slaDeadline: issue.slaDeadline,
            reportMarkdown: issue.reportMarkdown,
            submittedAt: issue.submittedAt,
            reportedBy: issue.reportedBy,
          },
          trackingNumber: issue.trackingNumber,
          estimatedResponseTime: categoryTemplate.estimatedResponseTime,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Create issue error:', error);

    if (error?.name === 'ValidationError') {
      return NextResponse.json({ success: false, error: 'Validation error', details: error.message }, { status: 400 });
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create issue',
        message: 'An error occurred while reporting the issue. Please try again.',
      },
      { status: 500 }
    );
  }
}

