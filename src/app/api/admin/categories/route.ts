import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { requireAuth, requireRole } from '@/lib/middleware';
import IssueCategoryTemplate from '@/models/IssueCategoryTemplate';
import { CATEGORIES } from '@/config/categories';
import { resolveTenantContext } from '@/lib/utils/tenant';
import { invalidateCache } from '@/lib/cache/responseCache';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const authResult = await requireAuth(request);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error || 'Authentication failed' }, { status: authResult.status || 401 });
    }

    const roleResult = await requireRole(request, ['admin']);
    if (!roleResult.success) {
      return NextResponse.json({ error: roleResult.error || 'Authorization failed' }, { status: roleResult.status || 403 });
    }

    const { tenantId, tenantSlug } = resolveTenantContext(request);
    const templates = await IssueCategoryTemplate.find({ tenantId, isActive: true }).sort({ name: 1 }).lean();

    return NextResponse.json({
      success: true,
      data: {
        tenantId,
        tenantSlug,
        categories: templates.length ? templates : CATEGORIES,
      },
    });
  } catch (error) {
    console.error('Admin category GET error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch category templates' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectDB();

    const authResult = await requireAuth(request);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error || 'Authentication failed' }, { status: authResult.status || 401 });
    }

    const roleResult = await requireRole(request, ['admin']);
    if (!roleResult.success) {
      return NextResponse.json({ error: roleResult.error || 'Authorization failed' }, { status: roleResult.status || 403 });
    }

    const { tenantId, tenantSlug } = resolveTenantContext(request);
    const body = await request.json();
    const categories = Array.isArray(body?.categories) ? body.categories : [];

    if (!categories.length) {
      return NextResponse.json({ success: false, error: 'No categories provided' }, { status: 400 });
    }

    const operations = categories.map((category: any) => ({
      updateOne: {
        filter: {
          tenantId,
          slug: category.slug || category.id,
        },
        update: {
          $set: {
            tenantId,
            tenantSlug,
            id: category.id || category.slug,
            slug: category.slug || category.id,
            templateVersion: category.templateVersion || 1,
            name: category.name,
            description: category.description || '',
            icon: category.icon || 'ðŸ“„',
            color: category.color || '#6B7280',
            priority: category.priority || 'medium',
            estimatedResponseTime: category.estimatedResponseTime || '2 days',
            slaHours: category.slaHours || 48,
            locationPolicy: category.locationPolicy || 'optional',
            requiredMedia: category.requiredMedia || [],
            evidenceRules: category.evidenceRules || [],
            fields: category.fields || [],
            workflow: category.workflow || {
              initialStatus: 'submitted',
              transitions: {
                submitted: ['acknowledged', 'pending'],
                acknowledged: ['pending', 'resolved'],
                pending: ['acknowledged', 'resolved'],
                resolved: ['closed', 'pending'],
                closed: [],
              },
              terminalStatuses: ['closed'],
            },
            isActive: category.isActive !== false,
          },
        },
        upsert: true,
      },
    }));

    if (operations.length) {
      await IssueCategoryTemplate.bulkWrite(operations);
    }

    await invalidateCache(`categories:${tenantId}`);

    return NextResponse.json({
      success: true,
      message: 'Category templates updated successfully',
      data: { updated: operations.length },
    });
  } catch (error) {
    console.error('Admin category PUT error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update category templates' }, { status: 500 });
  }
}


