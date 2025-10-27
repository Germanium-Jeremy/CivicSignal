import { NextRequest, NextResponse } from 'next/server';

// Mock database - in real app, this would be shared or in a database
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
  }
];

// GET /api/issues/[id] - Get single issue
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const issue = issues.find(i => i.id === id);
    
    if (!issue) {
      return NextResponse.json(
        { error: 'Issue not found' }, 
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: issue
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch issue' }, 
      { status: 500 }
    );
  }
}

// PATCH /api/issues/[id] - Update issue
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const issueIndex = issues.findIndex(i => i.id === id);
    
    if (issueIndex === -1) {
      return NextResponse.json(
        { error: 'Issue not found' }, 
        { status: 404 }
      );
    }

    // Update issue
    issues[issueIndex] = {
      ...issues[issueIndex],
      ...body,
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      message: 'Issue updated successfully',
      data: issues[issueIndex]
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update issue' }, 
      { status: 500 }
    );
  }
}
