'use client';

import { AnalyticsOverview } from '@/components/dashboard/analytics-overview';
import { Loader2 } from 'lucide-react';

interface AnalyticsTabProps {
    analytics: any;
    loadingAnalytics: boolean;
}

export function AnalyticsTab({ analytics, loadingAnalytics }: AnalyticsTabProps) {
    if (loadingAnalytics) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2 text-lg">Loading analytics...</span>
            </div>
        );
    }

    if (!analytics) {
        return (
            <div className="text-center py-12">
                <p className="text-lg text-muted-foreground">
                    Failed to load analytics data.
                </p>
            </div>
        );
    }

    return <AnalyticsOverview analytics={analytics} />;
}
