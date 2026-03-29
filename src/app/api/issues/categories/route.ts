import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { getCategoryTemplates } from '@/lib/services/issueTemplateService';
import { resolveTenantContext } from '@/lib/utils/tenant';
import { getOrSetCache } from '@/lib/cache/responseCache';

const CATEGORY_CACHE_TTL_MS = 5 * 60 * 1000;

/**
 * GET /api/issues/categories
 * Get all available issue categories
 * Public endpoint - no authentication required
 */
export async function GET(request: NextRequest) {
     try {
          await connectDB();
          const { tenantId } = resolveTenantContext(request);
          const cacheKey = `categories:${tenantId}`;
          const categories = await getOrSetCache(cacheKey, CATEGORY_CACHE_TTL_MS, () => getCategoryTemplates(tenantId));

          return NextResponse.json({
               success: true,
               message: 'Issue categories retrieved successfully',
               data: { categories, total: categories.length }
          });
     } catch (error) {
          console.error('Get categories error:', error);
          return NextResponse.json(
               { success: false, error: 'Failed to retrieve issue categories' },
               { status: 500 }
          );
     }
}
