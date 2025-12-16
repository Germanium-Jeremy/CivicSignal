import { NextRequest, NextResponse } from 'next/server';
import { CATEGORIES, getCategoryByName, getAllCategoryIds } from '@/config/categories';

/**
 * GET /api/issues/categories
 * Get all available issue categories
 * Public endpoint - no authentication required
 */
export async function GET(request: NextRequest) {
  try {
    // Return all categories
    return NextResponse.json({
      success: true,
      message: 'Issue categories retrieved successfully',
      data: {
        categories: CATEGORIES,
        total: CATEGORIES.length
      }
    });
  } catch (error) {
    console.error('Get categories error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve issue categories'
      },
      { status: 500 }
    );
  }
}
