import { getIndicators } from '@/lib/server-data';
import { NextRequest, NextResponse } from 'next/server';
import type { IndicatorWithLatestData, SortField, SortDirection } from '@/types';

// Cache the indicators data for 60 seconds to avoid repeated DB queries
let cachedIndicators: IndicatorWithLatestData[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 60 * 1000; // 60 seconds

async function getCachedIndicators(): Promise<IndicatorWithLatestData[]> {
    const now = Date.now();

    // Return cached data if it's still fresh
    if (cachedIndicators && (now - cacheTimestamp) < CACHE_DURATION) {
        return cachedIndicators;
    }

    // Fetch fresh data
    console.log('Fetching fresh indicators data from database');
    cachedIndicators = await getIndicators();
    cacheTimestamp = now;

    return cachedIndicators;
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category') || undefined;
        const search = searchParams.get('search') || undefined;
        const sortBy = (searchParams.get('sortBy') || 'view_count') as SortField;
        const sortDirection = (searchParams.get('sortDir') || 'desc') as SortDirection;

        // Use cached indicators data to reduce database load
        const indicators = await getCachedIndicators();

        // TODO: Apply client-side filters for category and search if needed
        let filteredIndicators = indicators;

        if (category) {
            filteredIndicators = filteredIndicators.filter(ind => ind.category === category);
        }

        if (search) {
            const searchLower = search.toLowerCase();
            filteredIndicators = filteredIndicators.filter(ind =>
                ind.name.toLowerCase().includes(searchLower) ||
                ind.description?.toLowerCase().includes(searchLower)
            );
        }

        // Apply sorting with optimized comparison
        const getSortValue = (indicator: IndicatorWithLatestData, field: SortField) => {
            switch (field) {
                case 'view_count':
                    return indicator.view_count || 0;
                case 'name':
                    return indicator.name.toLowerCase();
                case 'latest_value':
                    return indicator.latest_value || 0;
                case 'latest_ts':
                    return indicator.latest_ts ? new Date(indicator.latest_ts).getTime() : 0;
                default:
                    return indicator.view_count || 0;
            }
        };

        filteredIndicators.sort((a, b) => {
            const aVal = getSortValue(a, sortBy);
            const bVal = getSortValue(b, sortBy);

            let comparison = 0;
            if (typeof aVal === 'string' && typeof bVal === 'string') {
                comparison = aVal.localeCompare(bVal);
            } else {
                comparison = (aVal as number) - (bVal as number);
            }

            return sortDirection === 'desc' ? -comparison : comparison;
        });

        return NextResponse.json(filteredIndicators, {
            headers: {
                'Cache-Control': 'public, max-age=30, s-maxage=60',
                'CDN-Cache-Control': 'public, max-age=60',
            }
        });
    } catch (error) {
        console.error('Error fetching indicators:', error);
        return NextResponse.json(
            { error: 'Failed to fetch indicators' },
            { status: 500 }
        );
    }
}
