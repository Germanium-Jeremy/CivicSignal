import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Issue from '@/models/Issue';
import { verifyAuth } from '@/lib/utils/auth';
import mongoose from 'mongoose';

// GET /api/issues/[id] - Get single issue (public)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: 'Invalid id' }, { status: 400 });
    }
    const issue = await Issue.findById(id).lean();
    if (!issue) {
      return NextResponse.json({ success: false, error: 'Issue not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: { issue } });
  } catch (error) {
    console.error('GET issue error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch issue' }, { status: 500 });
  }
}

// PATCH /api/issues/[id] - Append photos or update simple fields (auth required)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const auth = verifyAuth(request);
    if (!auth.isAuthenticated || !auth.userId) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: 'Invalid id' }, { status: 400 });
    }

    const body = await request.json();
    const updates: any = {};

    // Append photos if provided
    if (Array.isArray(body.photos) && body.photos.length) {
      const newPhotos = body.photos.map((p: any) => ({
        url: p.url,
        thumbnailUrl: p.thumbnailUrl,
        uploadedAt: new Date(),
        size: p.size || 0,
        mimeType: p.mimeType || 'image/jpeg',
      }));
      updates.$push = { photos: { $each: newPhotos } };
    }

    // Allow optional priority update (if sent)
    if (typeof body.priority === 'string') {
      updates.priority = body.priority;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ success: false, error: 'No valid updates provided' }, { status: 400 });
    }

    const issue = await Issue.findByIdAndUpdate(id, updates, { new: true }).lean();
    if (!issue) {
      return NextResponse.json({ success: false, error: 'Issue not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Issue updated successfully', data: { issue } });
  } catch (error) {
    console.error('PATCH issue error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update issue' }, { status: 500 });
  }
}
