import { useQuery, useQueryClient } from '@tanstack/react-query';
import type {
    IndicatorWithLatestData,
    Indicator,
    IndicatorData,
    SortField,
    SortDirection,
} from '@/types';

// Query key factories
export const indicatorKeys = {
    all: ['indicators'] as const,
    lists: () => [...indicatorKeys.all, 'list'] as const,
    list: (filters: IndicatorFilters) => [...indicatorKeys.lists(), filters] as const,
    details: () => [...indicatorKeys.all, 'detail'] as const,
    detail: (id: string, range: string) => [...indicatorKeys.details(), id, range] as const,
};

export const analyticsKeys = {
    all: ['analytics'] as const,
    overview: () => [...analyticsKeys.all, 'overview'] as const,
};

// Types
export interface IndicatorFilters {
    category?: string;
    search?: string;
    sortBy?: SortField;
    sortDir?: SortDirection;
}

export interface IndicatorDetailResponse {
    indicator: Indicator;
    data: IndicatorData[];
}

// Hooks
export function useIndicators(filters: IndicatorFilters = {}) {
    return useQuery({
        queryKey: indicatorKeys.list(filters),
        queryFn: async (): Promise<IndicatorWithLatestData[]> => {
            const params = new URLSearchParams();

            if (filters.category && filters.category !== 'all') {
                params.set('category', filters.category);
            }
            if (filters.search) {
                params.set('search', filters.search);
            }
            if (filters.sortBy) {
                params.set('sortBy', filters.sortBy);
            }
            if (filters.sortDir) {
                params.set('sortDir', filters.sortDir);
            }

            const response = await fetch(`/api/indicators?${params}`);
            if (!response.ok) {
                throw new Error('Failed to fetch indicators');
            }

            return response.json();
        },
        staleTime: 1000 * 60 * 2, // 2 minutes
    });
}

export function useIndicatorDetail(id: string | null, range = '30d') {
    return useQuery({
        queryKey: indicatorKeys.detail(id!, range),
        queryFn: async (): Promise<IndicatorDetailResponse> => {
            const response = await fetch(`/api/indicators/${id}?range=${range}`);
            if (!response.ok) {
                throw new Error('Failed to fetch indicator details');
            }

            return response.json();
        },
        enabled: !!id, // Only run when id is provided
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}

export function useAnalytics() {
    return useQuery({
        queryKey: analyticsKeys.overview(),
        queryFn: async () => {
            const response = await fetch('/api/analytics');
            if (!response.ok) {
                throw new Error('Failed to fetch analytics');
            }

            return response.json();
        },
        staleTime: 1000 * 60 * 10, // 10 minutes
    });
}

// Prefetch hook for preloading data
export function useIndicatorPrefetch() {
    const queryClient = useQueryClient();

    const prefetchIndicatorDetail = (id: string, range = '30d') => {
        queryClient.prefetchQuery({
            queryKey: indicatorKeys.detail(id, range),
            queryFn: async (): Promise<IndicatorDetailResponse> => {
                const response = await fetch(`/api/indicators/${id}?range=${range}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch indicator details');
                }
                return response.json();
            },
            staleTime: 1000 * 60 * 5,
        });
    };

    return { prefetchIndicatorDetail };
}
