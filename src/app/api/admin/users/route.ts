import { NextRequest, NextResponse } from 'next/server';
import User from '@/models/User';
import { requireAuth, requireRole } from '@/lib/middleware';
import connectDB from '@/lib/mongodb';

// GET /api/admin/users - Get all users with pagination and filters
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const role = searchParams.get('role') || '';

    const skip = (page - 1) * limit;

    // Build query
    const query: any = {};
    
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    if (status) {
      query.isActive = status === 'active';
    }

    if (role && role !== 'all') {
      query.role = role;
    }

    // Get users and total count
    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(query)
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: users,
      total,
      page,
      limit,
      totalPages
    });

  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

// POST /api/admin/users - Create new user
export async function POST(request: NextRequest) {
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

    const userData = await request.json();

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [
        { email: userData.email },
        { phone: userData.phone }
      ]
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email or phone already exists' },
        { status: 400 }
      );
    }

    // Create new user
    const user = new User(userData);
    await user.save();

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    return NextResponse.json({
      success: true,
      data: userResponse
    });

  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}
