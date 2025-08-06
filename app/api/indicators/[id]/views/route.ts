import { NextRequest, NextResponse } from 'next/server';
import { IndicatorViewsService } from '@/lib/db/queries';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { createHash } from 'crypto';
import { UAParser } from 'ua-parser-js';

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id: indicatorId } = params;

        // Get session to check if user is authenticated
        const session = await auth.api.getSession({
            headers: await headers()
        });

        // Get request headers for analytics
        const userAgentString = request.headers.get('user-agent') || '';
        const parser = new UAParser(userAgentString);
        const uaResult = parser.getResult();

        // Create a structured user agent object
        const userAgent = {
            browser: `${uaResult.browser.name || 'Unknown'} ${uaResult.browser.version || ''}`.trim(),
            os: `${uaResult.os.name || 'Unknown'} ${uaResult.os.version || ''}`.trim(),
            device: uaResult.device.type || 'desktop',
            raw: userAgentString
        };

        const forwarded = request.headers.get('x-forwarded-for');
        const realIp = request.headers.get('x-real-ip');
        const ip = forwarded?.split(',')[0] || realIp || 'unknown';

        // Hash IP for privacy
        const ipHash = createHash('sha256').update(ip).digest('hex');

        // Record the view with session context
        const viewData = {
            indicatorId,
            userId: session?.user?.id || null, // null for anonymous users
            userAgent: JSON.stringify(userAgent), // Store structured user agent data
            ipHash,
            sessionId: session?.session?.id || null, // Add session ID for tracking
        };

        const result = await IndicatorViewsService.recordView(viewData);

        return NextResponse.json({
            success: true,
            viewId: result.id,
            authenticated: !!session?.user?.id,
        });

    } catch (error) {
        console.error('Failed to record view:', error);
        return NextResponse.json(
            { error: 'Failed to record view' },
            { status: 500 }
        );
    }
}

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id: indicatorId } = params;
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '50');
        const offset = parseInt(searchParams.get('offset') || '0');

        // Get views for this indicator with user information
        const views = await IndicatorViewsService.getViewsWithUsers({
            indicatorId,
            limit,
            offset,
        });

        // Transform data to include user attribution info
        const viewsWithAttribution = views.map(view => ({
            id: view.id,
            viewedAt: view.viewedAt,
            userAgent: view.userAgent,
            user: view.user ? {
                name: view.user.name,
                // Don't expose email to protect user privacy
            } : null,
            isAuthenticated: !!view.userId,
        }));

        return NextResponse.json({
            views: viewsWithAttribution,
            total: views.length,
            hasMore: views.length === limit,
        });

    } catch (error) {
        console.error('Failed to fetch views:', error);
        return NextResponse.json(
            { error: 'Failed to fetch views' },
            { status: 500 }
        );
    }
}
