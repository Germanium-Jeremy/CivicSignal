import { NextRequest, NextResponse } from 'next/server';
import Issue from '@/models/Issue';
import { requireAuth, requireRole } from '@/lib/middleware';
import connectDB from '@/lib/mongodb';

// GET /api/admin/issues - Get all issues with pagination and filters
export async function GET(request: NextRequest) {
  try {
    await connectDB(); // Use the same connection as regular issues API
    
    // Authentication and authorization
    const authResult = await requireAuth(request);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error || 'Authentication failed' }, { status: authResult.status || 500 });
    }

    const roleCheck = await requireRole(request, ['admin']);
    if (!roleCheck.success) {
      return NextResponse.json({ error: roleCheck.error || 'Authorization failed' }, { status: roleCheck.status || 500 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const category = searchParams.get('category');

    const skip = (page - 1) * limit;

    // Build query
    const query: any = {};
    
    if (status && status !== 'undefined' && status.trim() !== '') {
      query.status = status;
    }

    if (priority && priority !== 'undefined' && priority.trim() !== '') {
      query.priority = priority;
    }

    if (category && category !== 'undefined' && category.trim() !== '') {
      query.category = category;
    }
    
    // Execute query (same approach as working issues API)
    const issues = await Issue.find(query)
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Issue.countDocuments(query);

    console.log('Admin API Results:', { 
      issuesFound: issues.length, 
      total, 
      firstIssue: issues[0] ? { 
        id: issues[0]._id, 
        title: issues[0].title, 
        status: issues[0].status 
      } : null ,
      issues: issues
    });

    // Transform data to match React Native structure
    const transformedIssues = issues.map(issue => ({
      ...issue,
      date: issue.submittedAt ? new Date(issue.submittedAt).toISOString() : (issue.createdAt ? new Date(issue.createdAt).toISOString() : new Date().toISOString())
    }));

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      message: 'Issues retrieved successfully',
      data: {
        issues: transformedIssues,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });

  } catch (error) {
    console.error('Error fetching issues:', error);
    return NextResponse.json(
      { error: 'Failed to fetch issues' },
      { status: 500 }
    );
  }
}
