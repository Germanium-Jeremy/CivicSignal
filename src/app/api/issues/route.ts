import { NextRequest, NextResponse } from 'next/server';
import Issue, { IIssuePhoto } from '@/models/Issue';
import { verifyAuth } from '@/lib/utils/auth';
import { verifyDevice, checkSubmissionLimit, registerDevice } from '@/lib/utils/deviceVerification';
import { isValidCategory, getCategoryById, ISSUE_CATEGORIES } from '@/config/issueCategories';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';

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

    // Validate required fields (location is now optional)
    const {
      title,
      description,
      category,
      location, // optional: { latitude, longitude, address?, district?, sector? }
      photos, // Array of photo URLs (already uploaded)
      deviceInfo, // { deviceId, deviceModel?, osVersion?, appVersion? }
    } = body;

    if (!category || !deviceInfo) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
          details: {
            title: false,
            category: !category,
            location: false,
            deviceInfo: !deviceInfo,
          },
        },
        { status: 400 }
      );
    }

    // Helper to get client IP (X-Forwarded-For aware)
    const getClientIp = () => {
      const xff = request.headers.get('x-forwarded-for');
      if (xff) return xff.split(',')[0].trim();
      // Next.js may not expose request.ip; leave undefined when not available
      return undefined as string | undefined;
    };

    // If no location provided, try to resolve by IP
    let finalLocation: any = null;
    if (location && typeof location.latitude === 'number' && typeof location.longitude === 'number') {
      finalLocation = {
        type: 'Point',
        coordinates: [location.longitude, location.latitude],
        address: location.address,
        district: location.district,
        sector: location.sector,
      };
    } else {
      try {
        const ip = getClientIp();
        if (ip) {
          // Use a public IP geolocation service (no key). Suitable for dev; consider configuring a paid provider for prod.
          const geoRes = await fetch(`https://ipapi.co/${ip}/json/`, { cache: 'no-store' });
          if (geoRes.ok) {
            const geo = await geoRes.json();
            if (geo && typeof geo.latitude === 'number' && typeof geo.longitude === 'number') {
              finalLocation = {
                type: 'Point',
                coordinates: [geo.longitude, geo.latitude],
                address: geo.city || undefined,
                district: geo.region || undefined,
                sector: geo.country_name || undefined,
              };
            }
          }
        }
      } catch (e) {
        console.warn('IP geolocation failed:', e);
      }
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
    // const deviceVerification = await verifyDevice(userId, deviceInfo);
    
    // if (!deviceVerification.isVerified) {
    //   // Register device if it's a new device (trust score above minimum threshold)
    //   if (deviceVerification.trustScore >= 30) {
    //     await registerDevice(userId, deviceInfo);
    //   } else {
    //     return NextResponse.json(
    //       {
    //         success: false,
    //         error: 'Device verification failed',
    //         message: 'This device is not registered with your account. Please use the device you registered with or contact support.',
    //         trustScore: deviceVerification.trustScore,
    //       },
    //       { status: 403 }
    //     );
    //   }
    // }

    // Check submission limit to prevent spam
    if (!userId) return
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
    const normalizePriority = (p?: string) => {
      const v = String(p || '').toLowerCase();
      if (v === 'high') return 'High';
      if (v === 'medium' || v === 'normal' || v === '') return 'Medium';
      if (v === 'low') return 'Low';
      return 'Medium';
    };
    const suggestedPriority = normalizePriority(body.priority || categoryDetails?.priority);

    // Derive a title when not provided: `${CategoryName}: snippet`
    const snippet = (description || '').split(/\s+/).slice(0, 6).join(' ').trim();
    const derivedTitle = `${categoryDetails?.name || category}${snippet ? ': ' + snippet : ''}`.trim();
    const finalTitle = (typeof title === 'string' && title.trim().length > 0) ? title.trim() : derivedTitle;

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
      title: finalTitle,
      description: description?.trim() || undefined,
      category,
      priority: suggestedPriority,
      status: 'submitted',
      ...(finalLocation ? { location: finalLocation } : {}),
      photos: issuePhotos,
      reportedBy: userId,
      reporterDevice: {
        deviceId: deviceInfo.deviceId,
        deviceModel: deviceInfo.deviceModel,
        osVersion: deviceInfo.osVersion,
        appVersion: deviceInfo.appVersion,
        registeredAt: new Date(),
      },
      // isVerifiedReporter: deviceVerification.trustScore >= 70,
      submittedAt: new Date(),
      isPublic: true,
      showOnMap: !!finalLocation,
      viewCount: 0,
      upvoteCount: 0,
      upvotedBy: [],
      activities: [
        {
          action: 'submitted',
          description: 'Issue submitted by citizen',
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
