import { NextRequest, NextResponse } from 'next/server';
import Issue from '@/models/Issue';
import { generateIssueMarkdown } from '@/lib/utils/reportGenerator';
import { requireAuth } from '@/lib/middleware';
import connectDB from '@/lib/mongodb';
import { buildTenantQuery, resolveTenantContext } from '@/lib/utils/tenant';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const { id } = await params;
        const { tenantId } = resolveTenantContext(request);
        
        // Basic auth check (can be expanded to admin-only)
        const auth = await requireAuth(request);
        if (!auth.success) {
            return NextResponse.json({ success: false, error: auth.error || 'Unauthorized' }, { status: auth.status || 401 });
        }

        const issue = await Issue.findOne({ _id: id, ...buildTenantQuery(tenantId) }).lean();
        
        if (!issue) {
            return NextResponse.json({ success: false, error: 'Issue not found' }, { status: 404 });
        }

        const markdown = generateIssueMarkdown(issue);

        return new NextResponse(markdown, {
            headers: {
                'Content-Type': 'text/markdown',
                'Content-Disposition': `attachment; filename="report-${issue.trackingNumber || id}.md"`,
            },
        });
    } catch (error: any) {
        console.error('Error generating report:', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}
