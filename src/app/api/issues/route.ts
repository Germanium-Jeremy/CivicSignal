import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import Issue, { IIssuePhoto } from '@/models/Issue';
import { verifyAuth } from '@/lib/utils/auth';
import { verifyDevice, checkSubmissionLimit, registerDevice } from '@/lib/utils/deviceVerification';
import { isValidCategory, getCategoryById, ISSUE_CATEGORIES } from '@/config/issueCategories';
import mongoose from 'mongoose';

/**
 * GET /api/issues
 * Get all issues with filtering and pagination
 * Public endpoint - can be accessed without authentication for viewing public issues
 * Authentication optional but allows for personalized results
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    
    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Filters
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const category = searchParams.get('category');
    const district = searchParams.get('district');
    const sector = searchParams.get('sector');
    const userId = searchParams.get('userId'); // Get user's own issues
    
    // Geolocation filters
    const latitude = searchParams.get('latitude');
    const longitude = searchParams.get('longitude');
    const radius = parseInt(searchParams.get('radius') || '5000'); // Default 5km

    // Build query
    const query: any = {
      isPublic: true,
      showOnMap: true,
    };

    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (category) query.category = category;
    if (district) query['location.district'] = district;
    if (sector) query['location.sector'] = sector;
    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      query.reportedBy = userId;
      delete query.isPublic; // Allow user to see their own issues regardless of visibility
    }

    // Geolocation query
    if (latitude && longitude) {
      query.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)],
          },
          $maxDistance: radius,
        },
      };
    }

    // Execute query
    const issues = await Issue.find(query)
      .populate('reportedBy', 'fullName email')
      .populate('assignedAgency', 'name type')
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Issue.countDocuments(query);

    return NextResponse.json({
      success: true,
      message: 'Issues retrieved successfully',
      data: {
        issues,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('Get issues error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch issues',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/issues
 * Create a new issue report
 * Requires authentication
 * Validates device and enforces submission limits
 */
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Verify authentication
    const authResult = verifyAuth(request);
    if (!authResult.isAuthenticated) {
      return authResult.error || NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const userId = authResult.userId;
    const body = await request.json();

    // Validate required fields
    const {
      title,
      description,
      category,
      location, // { latitude, longitude, address?, district?, sector? }
      photos, // Array of photo URLs (already uploaded)
      deviceInfo, // { deviceId, deviceModel?, osVersion?, appVersion? }
    } = body;

    if (!title || !category || !location || !deviceInfo) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
          details: {
            title: !title,
            category: !category,
            location: !location,
            deviceInfo: !deviceInfo,
          },
        },
        { status: 400 }
      );
    }

    // Validate location coordinates
    if (!location.latitude || !location.longitude) {
      return NextResponse.json(
        {
          success: false,
          error: 'Location coordinates are required',
        },
        { status: 400 }
      );
    }

    // Validate category
    if (!isValidCategory(category)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid category',
          availableCategories: ISSUE_CATEGORIES.map(c => c.id),
        },
        { status: 400 }
      );
    }

    // Verify device to prevent scam reports
    const deviceVerification = await verifyDevice(userId, deviceInfo);
    
    if (!deviceVerification.isVerified) {
      // Register device if it's a new device (trust score above minimum threshold)
      if (deviceVerification.trustScore >= 30) {
        await registerDevice(userId, deviceInfo);
      } else {
        return NextResponse.json(
          {
            success: false,
            error: 'Device verification failed',
            message: 'This device is not registered with your account. Please use the device you registered with or contact support.',
            trustScore: deviceVerification.trustScore,
          },
          { status: 403 }
        );
      }
    }

    // Check submission limit to prevent spam
    const submissionCheck = await checkSubmissionLimit(userId);
    if (!submissionCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: 'Daily submission limit reached',
          message: `You have reached the maximum number of issue reports for today. Please try again after ${submissionCheck.resetAt.toLocaleTimeString()}.`,
          remaining: submissionCheck.remaining,
          resetAt: submissionCheck.resetAt,
        },
        { status: 429 }
      );
    }

    // Get category details for priority suggestion
    const categoryDetails = getCategoryById(category);
    const suggestedPriority = body.priority || categoryDetails?.priority || 'medium';

    // Prepare photos array
    const issuePhotos: IIssuePhoto[] = (photos || []).map((photo: any) => ({
      url: photo.url,
      thumbnailUrl: photo.thumbnailUrl,
      uploadedAt: new Date(),
      size: photo.size || 0,
      mimeType: photo.mimeType || 'image/jpeg',
    }));

    // Create issue document
    const issue = new Issue({
      title: title.trim(),
      description: description?.trim() || undefined,
      category,
      priority: suggestedPriority,
      status: 'submitted',
      location: {
        type: 'Point',
        coordinates: [location.longitude, location.latitude],
        address: location.address,
        district: location.district,
        sector: location.sector,
      },
      photos: issuePhotos,
      reportedBy: userId,
      reporterDevice: {
        deviceId: deviceInfo.deviceId,
        deviceModel: deviceInfo.deviceModel,
        osVersion: deviceInfo.osVersion,
        appVersion: deviceInfo.appVersion,
        registeredAt: new Date(),
      },
      isVerifiedReporter: deviceVerification.trustScore >= 70,
      submittedAt: new Date(),
      isPublic: true,
      showOnMap: true,
      viewCount: 0,
      upvoteCount: 0,
      upvotedBy: [],
      activities: [
        {
          action: 'created',
          description: 'Issue reported by citizen',
          performedBy: userId as any,
          performedByModel: 'User',
          timestamp: new Date(),
        },
      ],
    });

    // Save issue
    await issue.save();

    // Populate reporter information for response
    await issue.populate('reportedBy', 'fullName email');

    return NextResponse.json(
      {
        success: true,
        message: 'Issue reported successfully',
        data: {
          issue: {
            _id: issue._id,
            trackingNumber: issue.trackingNumber,
            title: issue.title,
            description: issue.description,
            category: issue.category,
            priority: issue.priority,
            status: issue.status,
            location: issue.location,
            photos: issue.photos,
            submittedAt: issue.submittedAt,
            reportedBy: issue.reportedBy,
          },
          trackingNumber: issue.trackingNumber,
          estimatedResponseTime: categoryDetails?.estimatedResponseTime || '3-7 days',
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create issue error:', error);
    
    // Handle validation errors
    if (error instanceof Error && error.name === 'ValidationError') {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation error',
          details: error.message,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create issue',
        message: 'An error occurred while reporting the issue. Please try again.',
      },
      { status: 500 }
    );
  }
}
