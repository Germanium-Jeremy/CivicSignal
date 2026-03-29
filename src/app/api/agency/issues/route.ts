import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Issue from '@/models/Issue';
import Agency from '@/models/Agency';
import User from '@/models/User';
import { verifyAccessToken } from '@/lib/utils/auth';
import { buildTenantQuery, resolveTenantContext } from '@/lib/utils/tenant';
import { getOrSetCache } from '@/lib/cache/responseCache';

const AGENCY_ISSUES_CACHE_TTL_MS = 20 * 1000;

export async function GET(request: NextRequest) {
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
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10', 10)));
    const priority = searchParams.get('priority');
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    const cacheKey = `agency-issues:${tenantId}:${agency._id}:${searchParams.toString()}`;

    const data = await getOrSetCache(cacheKey, AGENCY_ISSUES_CACHE_TTL_MS, async () => {
      const query: any = {
        ...buildTenantQuery(tenantId),
      };

      if (agency.serviceDomains && agency.serviceDomains.length > 0) {
        query.category = { $in: agency.serviceDomains };
      }

      if (status) query.status = status;
      if (priority) query.priority = priority;

      if (category) {
        if (agency.serviceDomains.includes(category)) {
          query.category = category;
        } else {
          return {
            issues: [],
            total: 0,
          };
        }
      }

      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { trackingNumber: { $regex: search, $options: 'i' } },
        ];
      }

      const skip = (page - 1) * limit;
      const total = await Issue.countDocuments(query);
      const issues = await Issue.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean();

      return {
        issues: issues.map((issue) => ({
          ...issue,
          _id: issue._id.toString(),
          photos: issue.media || [],
        })),
        total,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        issues: data.issues,
        pagination: {
          page,
          limit,
          total: data.total,
          pages: Math.ceil(data.total / limit),
        },
      },
    });
  } catch (error) {
    console.error('Error fetching agency issues:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
