import { useMutation } from '@tanstack/react-query';
import { useSession } from '@/lib/auth-client';
import { useEffect, useCallback, useRef } from 'react';

interface RecordViewResponse {
    success: boolean;
    viewId: number;
    authenticated: boolean;
}

interface ViewData {
    id: string;
    viewedAt: string;
    userAgent?: string;
    user?: {
        name: string;
    } | null;
    isAuthenticated: boolean;
}

interface GetViewsResponse {
    views: ViewData[];
    total: number;
    hasMore: boolean;
}

/**
 * Hook to record a view for an indicator
 */
export function useRecordView() {
    const recordView = async (indicatorId: string): Promise<RecordViewResponse> => {
        const response = await fetch(`/api/indicators/${indicatorId}/views`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to record view: ${response.statusText}`);
        }

        return response.json();
    };

    return useMutation({
        mutationFn: recordView,
        onError: (error) => {
            console.error('Failed to record view:', error);
        },
    });
}

/**
 * Hook to get views for an indicator with user attribution
 */
export function useIndicatorViews(indicatorId: string, limit = 50, offset = 0) {
    const getViews = async (): Promise<GetViewsResponse> => {
        const response = await fetch(
            `/api/indicators/${indicatorId}/views?limit=${limit}&offset=${offset}`
        );

        if (!response.ok) {
            throw new Error(`Failed to fetch views: ${response.statusText}`);
        }

        return response.json();
    };

    return {
        getViews,
    };
}

/**
 * Hook that automatically records a view when component mounts
 * Only records once per session to avoid spam
 */
export function useAutoRecordView(indicatorId: string) {
    const { data: session } = useSession();
    const recordViewMutation = useRecordView();
    const hasRecordedRef = useRef(false);

    const recordView = useCallback(async () => {
        if (hasRecordedRef.current) return;

        // Only record view if we haven't already recorded it in this session
        const viewedKey = `viewed_${indicatorId}`;
        const hasViewed = sessionStorage.getItem(viewedKey);

        if (!hasViewed) {
            hasRecordedRef.current = true;
            try {
                const result = await recordViewMutation.mutateAsync(indicatorId);
                // Mark as viewed in session storage
                sessionStorage.setItem(viewedKey, 'true');
                console.log('View recorded:', {
                    indicatorId,
                    authenticated: result.authenticated,
                    viewId: result.viewId,
                });
            } catch (error) {
                console.error('Failed to record view:', error);
                hasRecordedRef.current = false; // Reset on error to allow retry
            }
        }
    }, [indicatorId, recordViewMutation]);

    useEffect(() => {
        recordView();
    }, [recordView]);

    return {
        isRecording: recordViewMutation.isPending,
        error: recordViewMutation.error,
    };
}
