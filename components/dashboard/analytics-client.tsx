'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAnalytics } from '@/hooks/use-indicators';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, parseISO } from 'date-fns';
import { TrendingUp, Eye, Activity } from 'lucide-react';

interface AnalyticsData {
    topIndicators: Array<{
        id: string;
        name: string;
        category: string;
        view_count: number;
    }>;
    dailyViews: Array<{
        date: string;
        views: number;
    }>;
    totalViews: number;
}

interface AnalyticsClientProps {
    initialAnalytics: AnalyticsData;
}

export function AnalyticsClient({ initialAnalytics }: AnalyticsClientProps) {
    const {
        data: analytics = initialAnalytics,
        isLoading
    } = useAnalytics();

    // Ensure analytics data exists and has default values
    const safeAnalytics = {
        topIndicators: analytics?.topIndicators || [],
        dailyViews: analytics?.dailyViews || [],
        totalViews: analytics?.totalViews || 0,
    };

    const chartData = safeAnalytics.dailyViews.map((item: any) => ({
        date: format(new Date(item.date), 'MMM dd'),
        views: item.views,
    }));

    if (isLoading && !analytics) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-2">Loading analytics...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                        <Eye className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{safeAnalytics.totalViews.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">
                            All time views across all indicators
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Daily Average</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {Math.round(
                                safeAnalytics.dailyViews.reduce((sum: number, day: any) => sum + day.views, 0) /
                                Math.max(safeAnalytics.dailyViews.length, 1)
                            ).toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Average views per day (last 7 days)
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Indicators</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{safeAnalytics.topIndicators.length}</div>
                        <p className="text-xs text-muted-foreground">
                            Indicators with recent activity
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Top Indicators */}
            <Card>
                <CardHeader>
                    <CardTitle>Most Viewed Indicators (Last 7 Days)</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {safeAnalytics.topIndicators.map((indicator: any, index: number) => (
                            <div
                                key={indicator.id}
                                className="flex items-center justify-between p-4 border rounded-lg"
                            >
                                <div className="flex items-center space-x-3">
                                    <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full">
                                        <span className="text-sm font-bold text-primary">{index + 1}</span>
                                    </div>
                                    <div>
                                        <h3 className="font-medium">{indicator.name}</h3>
                                        <Badge variant="secondary" className="text-xs">
                                            {indicator.category}
                                        </Badge>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Eye className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-medium">{indicator.view_count}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {safeAnalytics.topIndicators.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                            No view data available yet
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Views Chart */}
            <Card>
                <CardHeader>
                    <CardTitle>Daily Views Trend</CardTitle>
                </CardHeader>
                <CardContent>
                    {chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Bar
                                    dataKey="views"
                                    fill="hsl(var(--primary))"
                                    radius={[4, 4, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="text-center py-8 text-muted-foreground">
                            No view data available yet
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
