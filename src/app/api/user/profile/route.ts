import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { requireAuth } from '@/lib/middleware';

export async function GET(request: NextRequest) {
     try {
          await connectDB();
          
          const auth = await requireAuth(request);
          if (!auth.success || !auth.user?.userId) {
               return NextResponse.json({ error: auth.error || 'Authentication required' }, { status: auth.status || 401 });
          }
          const userId = auth.user.userId;

          // Find user
          const user = await User.findById(userId);
          if (!user) {
               return NextResponse.json({ error: 'User not found' }, { status: 404 });
          }

          // Check if user is active
          if (!user.isActive) {
               return NextResponse.json({ error: 'Account is deactivated' }, { status: 403 });
          }

          return NextResponse.json({
               success: true,
               user: {
                    id: user._id,
                    fullName: user.fullName,
                    email: user.email,
                    phone: user.phone,
                    profileImage: user.profileImage,
                    role: user.role,
                    isEmailVerified: user.isEmailVerified,
                    isPhoneVerified: user.isPhoneVerified,
                    isActive: user.isActive,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt
               }
          });

     } catch (error) {
          console.error('Get profile error:', error);
          return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
     }
}

// Update user profile
export async function PATCH(request: NextRequest) {
     try {
          await connectDB();
          
          const auth = await requireAuth(request);
          if (!auth.success || !auth.user?.userId) {
               return NextResponse.json({ error: auth.error || 'Authentication required' }, { status: auth.status || 401 });
          }
          const userId = auth.user.userId;

          const updateData = await request.json();
          
          // Fields that can be updated
          const allowedFields = ['fullName', 'phone', 'profileImage'];
          const updates: any = {};
          
          allowedFields.forEach(field => {
               if (updateData[field] !== undefined) {
                    updates[field] = updateData[field];
               }
          });

          if (Object.keys(updates).length === 0) {
               return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
          }

          // Update user
          const user = await User.findByIdAndUpdate(userId, { $set: updates }, { new: true, runValidators: true });

          if (!user) {
               return NextResponse.json({ error: 'User not found' }, { status: 404 });
          }

          return NextResponse.json({
               success: true,
               message: 'Profile updated successfully',
               user: {
                    id: user._id,
                    fullName: user.fullName,
                    email: user.email,
                    phone: user.phone,
                    profileImage: user.profileImage,
                    role: user.role,
                    isEmailVerified: user.isEmailVerified,
                    isPhoneVerified: user.isPhoneVerified,
                    isActive: user.isActive,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt
               }
          });

     } catch (error: any) {
          console.error('Update profile error:', error);
          
          // Handle Mongoose validation errors
          if (error.name === 'ValidationError') {
               const messages = Object.values(error.errors).map((err: any) => err.message);
               return NextResponse.json({ error: messages.join(', ') }, { status: 400 });
          }
          
          return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
     }
}
