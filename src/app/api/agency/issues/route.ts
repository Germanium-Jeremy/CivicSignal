import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Issue from '@/models/Issue';
import Agency from '@/models/Agency';
import { tokenManager } from '@/lib/api';
import { 
  getServiceDomainForCategory, 
  isCategoryInAgencyServiceDomains,
  getCategoriesForServiceDomain,
  AgencyServiceDomain 
} from '@/config/categoryServiceMapping';

export async function GET(request: NextRequest) {
    try {
        await connectDB();

        // Get the token from the tokenManager
        const { accessToken } = tokenManager.getTokens();
        if (!accessToken) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Decode the JWT to get user email (simple decode without verification for API usage)
        const tokenParts = accessToken.split('.');
        if (tokenParts.length !== 3) {
            return NextResponse.json(
                { success: false, error: 'Invalid token format' },
                { status: 401 }
            );
        }

        const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
        const userEmail = payload.email;

        if (!userEmail) {
            return NextResponse.json(
                { success: false, error: 'User email not found in token' },
                { status: 401 }
            );
        }

        // Find the agency for this user
        const agency = await Agency.findOne({ email: userEmail });
        if (!agency) {
            return NextResponse.json(
                { success: false, error: 'Agency not found' },
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
        const query: any = {};

        // Filter by agency's service domains
        if (agency.serviceDomains && agency.serviceDomains.length > 0) {
            // Get all category IDs that belong to the agency's service domains
            const allowedCategories: string[] = [];
            agency.serviceDomains.forEach((serviceDomain: AgencyServiceDomain) => {
                const categories = getCategoriesForServiceDomain(serviceDomain);
                allowedCategories.push(...categories);
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
            if (isCategoryInAgencyServiceDomains(category, agency.serviceDomains)) {
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
