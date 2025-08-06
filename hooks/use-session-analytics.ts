import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

interface SessionActivity {
    sessionId: string;
    device: {
        type: string;
        browser: string;
        os: string;
    };
    viewCount: number;
    indicators: Array<{
        id: string;
        name: string;
        category: string;
        viewedAt: string;
        viewCount: number;
    }>;
    lastActive: string;
    duration: number; // in minutes
}

interface SessionAnalyticsData {
    activities: SessionActivity[];
    summary: {
        totalSessions: number;
        totalViews: number;
        avgDuration: number;
        avgViewsPerSession: number;
    };
}

export function useSessionAnalytics(range: '24h' | '7d' | '30d' = '24h') {
    return useQuery({
        queryKey: ['session-analytics', range],
        queryFn: async (): Promise<SessionAnalyticsData> => {
            const response = await fetch(`/api/analytics/sessions?range=${range}`);
            if (!response.ok) {
                throw new Error('Failed to fetch session analytics');
            }
            return response.json();
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 10, // 10 minutes
        refetchOnWindowFocus: false,
    });
}

export function useSessionAnalyticsActions() {
    const queryClient = useQueryClient();

    const refreshAnalytics = useCallback(() => {
        queryClient.invalidateQueries({
            queryKey: ['session-analytics'],
        });
    }, [queryClient]);

    return {
        refreshAnalytics,
    };
}
