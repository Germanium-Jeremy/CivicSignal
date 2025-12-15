import { NextRequest, NextResponse } from 'next/server';
import User from '@/models/User';
import { requireAuth, requireRole } from '@/lib/middleware';
import connectDB from '@/lib/mongodb';

// GET /api/admin/users/[id] - Get single user
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    // Authentication and authorization
    const authResult = await requireAuth(request);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error || 'Authentication failed' }, { status: authResult.status || 500 });
    }

    const roleCheck = await requireRole(request, ['admin']);
    if (!roleCheck.success) {
      return NextResponse.json({ error: roleCheck.error || 'Authorization failed' }, { status: roleCheck.status || 500 });
    }

    // Await params in Next.js 15+
    const { id } = await params;

    const user = await User.findById(id).select('-password').lean();
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: user
    });

  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/users/[id] - Update user
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    // Authentication and authorization
    const authResult = await requireAuth(request);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error || 'Authentication failed' }, { status: authResult.status || 500 });
    }

    const roleCheck = await requireRole(request, ['admin']);
    if (!roleCheck.success) {
      return NextResponse.json({ error: roleCheck.error || 'Authorization failed' }, { status: roleCheck.status || 500 });
    }

    const updates = await request.json();
    
    // Don't allow password updates through this endpoint
    delete updates.password;

    // Await params in Next.js 15+
    const { id } = await params;

    const user = await User.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    ).select('-password').lean();

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: user
    });

  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/users/[id] - Delete user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    // Authentication and authorization
    const authResult = await requireAuth(request);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error || 'Authentication failed' }, { status: authResult.status || 500 });
    }

    const roleCheck = await requireRole(request, ['admin']);
    if (!roleCheck.success) {
      return NextResponse.json({ error: roleCheck.error || 'Authorization failed' }, { status: roleCheck.status || 500 });
    }

    // Await params in Next.js 15+
    const { id } = await params;

    const user = await User.findByIdAndDelete(id);
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}
