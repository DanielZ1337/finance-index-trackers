'use client';

import { AnalyticsOverview } from '@/components/dashboard/analytics-overview';
import SessionAnalytics from '@/components/dashboard/session-analytics';
import { Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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

    return (
        <Tabs defaultValue="overview" className="space-y-6">
            <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="sessions">Session Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
                <AnalyticsOverview analytics={analytics} />
            </TabsContent>

            <TabsContent value="sessions">
                <SessionAnalytics />
            </TabsContent>
        </Tabs>
    );
}
