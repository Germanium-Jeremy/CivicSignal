import { NextRequest, NextResponse } from 'next/server';

// Mock database - replace with real database later
let issues = [
  {
    id: 'ISS-001',
    title: 'Broken streetlight on Main Street',
    status: 'reported',
    priority: 'medium',
    location: 'Kigali',
    coordinates: { lat: -1.92935, lng: 30.03485 },
    reportedAt: '2024-01-20T10:30:00Z',
    category: 'Infrastructure',
    description: 'The streetlight has been flickering and completely went out last night.',
    reportedBy: 'citizen@example.com',
    agencyId: 1
  },
  {
    id: 'ISS-002',
    title: 'Water leak in residential area',
    status: 'acknowledged',
    priority: 'high',
    location: 'Kigali',
    coordinates: { lat: -1.90095, lng: 30.33885 },
    reportedAt: '2024-01-18T09:20:00Z',
    category: 'Utilities',
    description: 'Water main leak causing flooding in the street.',
    reportedBy: 'citizen2@example.com',
    agencyId: 1
  }
];

// GET /api/issues - Get all issues
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const category = searchParams.get('category');

    let filteredIssues = issues;

    // Filter by status
    if (status) {
      filteredIssues = filteredIssues.filter(issue => issue.status === status);
    }

    // Filter by priority
    if (priority) {
      filteredIssues = filteredIssues.filter(issue => issue.priority === priority);
    }

    // Filter by category
    if (category) {
      filteredIssues = filteredIssues.filter(issue => issue.category === category);
    }

    return NextResponse.json({
      success: true,
      data: filteredIssues,
      total: filteredIssues.length
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch issues' }, 
      { status: 500 }
    );
  }
}

// POST /api/issues - Create new issue
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const newIssue = {
      id: `ISS-${String(issues.length + 1).padStart(3, '0')}`,
      ...body,
      status: 'reported',
      reportedAt: new Date().toISOString(),
    };

    issues.push(newIssue);

    return NextResponse.json({
      success: true,
      message: 'Issue created successfully',
      data: newIssue
    }, { status: 201 });

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create issue' }, 
      { status: 500 }
    );
  }
}
