import { getAnalytics } from '@/lib/server-data';
import { AnalyticsClient } from '@/components/dashboard/analytics-client';

export async function AnalyticsServer() {
    try {
        const analytics = await getAnalytics();
        console.log('Server analytics data:', analytics);

        return <AnalyticsClient initialAnalytics={analytics} />;
    } catch (error) {
        console.error('Error in AnalyticsServer:', error);

        // Fallback data if server fetch fails
        const fallbackAnalytics = {
            topIndicators: [],
            dailyViews: [],
            totalViews: 0,
        };

        return <AnalyticsClient initialAnalytics={fallbackAnalytics} />;
    }
}
