import { IndicatorsService, IndicatorDataService, IndicatorViewsService } from '@/lib/db/queries';
import { NextRequest, NextResponse } from 'next/server';
import { subDays, subHours, subYears } from 'date-fns';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { createHash } from 'crypto';
import { UAParser } from 'ua-parser-js';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { searchParams } = new URL(request.url);
        const range = searchParams.get('range') || '30d';
        const { id } = await params;

        // Track view with user attribution (if authenticated)
        const session = await auth.api.getSession({
            headers: await headers()
        });

        // Parse user agent for better analytics
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

        // Get IP for privacy-preserving hash
        const forwardedFor = request.headers.get('x-forwarded-for') || '';
        const realIp = request.headers.get('x-real-ip') || '';
        const clientIp = forwardedFor?.split(',')[0] || realIp || '';

        // Create privacy-preserving IP hash
        const ipHash = clientIp ? createHash('sha256').update(clientIp).digest('hex').slice(0, 16) : '';

        await IndicatorViewsService.recordView({
            indicatorId: id,
            userAgent: JSON.stringify(userAgent), // Store structured user agent data
            ipHash,
            userId: session?.user?.id || null, // Associate with user if authenticated
        });        // Calculate time range
        let startDate: Date | undefined;
        const now = new Date();

        switch (range) {
            case '24h':
                startDate = subHours(now, 24);
                break;
            case '7d':
                startDate = subDays(now, 7);
                break;
            case '30d':
                startDate = subDays(now, 30);
                break;
            case '90d':
                startDate = subDays(now, 90);
                break;
            case '1y':
                startDate = subYears(now, 1);
                break;
            case 'all':
                startDate = undefined;
                break;
        }

        // Get indicator details and data
        const [indicator, data] = await Promise.all([
            IndicatorsService.getIndicatorById(id),
            IndicatorDataService.getIndicatorData(id, {
                startDate,
                limit: 1000,
            })
        ]);

        if (!indicator || !indicator.isActive) {
            return NextResponse.json({ error: 'Indicator not found' }, { status: 404 });
        }

        // Convert Drizzle results to expected format
        const formattedIndicator = {
            id: indicator.id,
            name: indicator.name,
            description: indicator.description,
            category: indicator.category,
            source: indicator.source,
            is_active: indicator.isActive,
            created_at: indicator.createdAt,
        };

        const formattedData = data.map(item => ({
            ts_utc: item.tsUtc,
            value: item.value,
            label: item.label,
            metadata: item.metadata,
        }));

        return NextResponse.json({
            indicator: formattedIndicator,
            data: formattedData
        });
    } catch (error) {
        console.error('Error fetching indicator details:', error);
        return NextResponse.json(
            { error: 'Failed to fetch indicator details' },
            { status: 500 }
        );
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { value, label, metadata } = body;

        if (!value) {
            return NextResponse.json({ error: 'Value is required' }, { status: 400 });
        }

        const timestamp = new Date();

        const result = await IndicatorDataService.insertIndicatorData({
            indicatorId: id,
            tsUtc: timestamp,
            value: value.toString(),
            label: label || null,
            metadata: metadata || null,
        });

        return NextResponse.json({
            success: true,
            timestamp,
            indicator_id: id,
            value,
            label,
            inserted: !!result,
        });
    } catch (error) {
        console.error('Error inserting indicator data:', error);
        return NextResponse.json(
            { error: 'Failed to insert indicator data' },
            { status: 500 }
        );
    }
}
