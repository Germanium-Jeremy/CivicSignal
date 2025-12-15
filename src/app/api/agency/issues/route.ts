import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Issue from '@/models/Issue';
import Agency from '@/models/Agency';
import User from '@/models/User';
import { verifyAccessToken } from '@/lib/utils/auth';
import { 
  getCategoriesByServiceDomain,
  getCategoryById,
  ServiceDomain 
} from '@/config/categories';

export async function GET(request: NextRequest) {
    try {
        await connectDB();

        // Get token from Authorization header (same as dashboard API)
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        const token = authHeader.split(' ')[1];
        
        // Verify token and get user ID (same as dashboard API)
        const decoded = verifyAccessToken(token);
        if (!decoded) {
            return NextResponse.json(
                { error: 'Invalid access token' },
                { status: 401 }
            );
        }

        const userId = decoded.userId;

        // Get user details
        const user = await User.findById(userId);
        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Check if user is an agency officer
        if (user.role !== 'agency_officer') {
            return NextResponse.json(
                { error: 'Access denied. Agency officer role required.' },
                { status: 403 }
            );
        }

        // Find agency where user is primary officer (same as dashboard API)
        const agency = await Agency.findOne({ primaryOfficer: userId });
        if (!agency) {
            return NextResponse.json(
                { error: 'No agency found for this user' },
                { status: 404 }
            );
        }

        // Get query parameters
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const priority = searchParams.get('priority');
        const category = searchParams.get('category');
        const search = searchParams.get('search');

        // Build the query
        const query: any = {}
        
        // Filter by agency's service domains
        if (agency.serviceDomains && agency.serviceDomains.length > 0) {
            // Get all category IDs that belong to the agency's service domains
            const allowedCategories: string[] = [];
            agency.serviceDomains.forEach((serviceDomain: ServiceDomain) => {
                const categories = getCategoriesByServiceDomain(serviceDomain);
                console.log("Service domain: ", serviceDomain, " Categories: ", categories.map(c => c.id));
                allowedCategories.push(...categories.map(c => c.id));
            });
            
            // Only show issues that belong to the agency's service domains
            if (allowedCategories.length > 0) {
                query.category = { $in: allowedCategories };
            } else {
                // If no categories match the service domains, return empty result
                return NextResponse.json({
                    success: true,
                    data: {
                        issues: [],
                        pagination: {
                            page,
                            limit,
                            total: 0,
                            pages: 0
                        }
                    }
                });
            }
        }

        // Add status filter if provided
        if (status) {
            query.status = status;
        }

        // Add priority filter if provided
        if (priority) {
            query.priority = priority;
        }

        // Add category filter if provided (must be within agency's service domains)
        if (category) {
            // Check if this category belongs to the agency's service domains
            const categoryInfo = getCategoryById(category);
            if (categoryInfo && agency.serviceDomains.includes(categoryInfo.serviceDomain)) {
                query.category = category;
            } else {
                // If category doesn't belong to agency's service domains, return empty result
                return NextResponse.json({
                    success: true,
                    data: {
                        issues: [],
                        pagination: {
                            page,
                            limit,
                            total: 0,
                            pages: 0
                        }
                    }
                });
            }
        }

        // Add search filter if provided
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { trackingNumber: { $regex: search, $options: 'i' } }
            ];
        }

        // Calculate pagination
        const skip = (page - 1) * limit;

        // Get total count for pagination
        const total = await Issue.countDocuments(query);

        // Get issues with pagination
        const issues = await Issue.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        // Format the response
        const formattedIssues = issues.map(issue => ({
            ...issue,
            _id: issue._id.toString(),
            createdAt: issue.createdAt,
            updatedAt: issue.updatedAt,
            submittedAt: issue.submittedAt,
        }));

        return NextResponse.json({
            success: true,
            data: {
                issues: formattedIssues,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            }
        });

    } catch (error) {
        console.error('Error fetching agency issues:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
