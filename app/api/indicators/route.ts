import { getIndicators } from '@/lib/server-data';
import { NextRequest, NextResponse } from 'next/server';
import type { IndicatorWithLatestData, SortField, SortDirection } from '@/types';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category') || undefined;
        const search = searchParams.get('search') || undefined;
        const sortBy = (searchParams.get('sortBy') || 'view_count') as SortField;
        const sortDirection = (searchParams.get('sortDir') || 'desc') as SortDirection;

        // Use the comprehensive query with latest data and view counts
        const indicators = await getIndicators();

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

        // Apply sorting
        filteredIndicators.sort((a, b) => {
            let aVal, bVal;
            switch (sortBy) {
                case 'view_count':
                    aVal = a.view_count || 0;
                    bVal = b.view_count || 0;
                    break;
                case 'name':
                    aVal = a.name;
                    bVal = b.name;
                    break;
                case 'latest_value':
                    aVal = a.latest_value || 0;
                    bVal = b.latest_value || 0;
                    break;
                case 'latest_ts':
                    aVal = a.latest_ts ? new Date(a.latest_ts) : new Date(0);
                    bVal = b.latest_ts ? new Date(b.latest_ts) : new Date(0);
                    break;
                default:
                    aVal = a.view_count || 0;
                    bVal = b.view_count || 0;
            }

            if (sortDirection === 'desc') {
                return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
            } else {
                return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
            }
        });

        return NextResponse.json(filteredIndicators);
    } catch (error) {
        console.error('Error fetching indicators:', error);
        return NextResponse.json(
            { error: 'Failed to fetch indicators' },
            { status: 500 }
        );
    }
}
