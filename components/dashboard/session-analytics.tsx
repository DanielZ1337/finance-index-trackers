'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Monitor,
    Smartphone,
    Activity,
    Clock,
    Eye,
    BarChart3,
    RefreshCw,
    Calendar
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useSessionAnalytics, useSessionAnalyticsActions } from '@/hooks/use-session-analytics';

export default function SessionAnalytics() {
    const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('24h');
    const { data: analytics, isLoading, error } = useSessionAnalytics(timeRange);
    const { refreshAnalytics } = useSessionAnalyticsActions();

    const getDeviceIcon = (deviceType: string) => {
        switch (deviceType.toLowerCase()) {
            case 'mobile':
                return <Smartphone className="h-4 w-4" />;
            case 'tablet':
                return <Smartphone className="h-4 w-4" />;
            default:
                return <Monitor className="h-4 w-4" />;
        }
    };

    const getCategoryColor = (category: string) => {
        switch (category?.toLowerCase()) {
            case 'fear_greed':
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
            case 'market':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
            case 'economic':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
        }
    };

    const formatDuration = (minutes: number) => {
        if (minutes < 60) {
            return `${Math.round(minutes)}m`;
        }
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = Math.round(minutes % 60);
        return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
    };

    if (error) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Session Analytics
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        Failed to load session analytics. Please try again.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Session Analytics</h2>
                    <p className="text-muted-foreground">
                        Track your indicator viewing patterns across sessions and devices
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Tabs value={timeRange} onValueChange={(value) => setTimeRange(value as typeof timeRange)}>
                        <TabsList>
                            <TabsTrigger value="24h">24h</TabsTrigger>
                            <TabsTrigger value="7d">7d</TabsTrigger>
                            <TabsTrigger value="30d">30d</TabsTrigger>
                        </TabsList>
                    </Tabs>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={refreshAnalytics}
                        disabled={isLoading}
                    >
                        <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                    </Button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Sessions</p>
                                <p className="text-2xl font-bold">
                                    {isLoading ? '...' : analytics?.summary.totalSessions || 0}
                                </p>
                            </div>
                            <Activity className="h-8 w-8 text-muted-foreground" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Views</p>
                                <p className="text-2xl font-bold">
                                    {isLoading ? '...' : analytics?.summary.totalViews || 0}
                                </p>
                            </div>
                            <Eye className="h-8 w-8 text-muted-foreground" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Avg Duration</p>
                                <p className="text-2xl font-bold">
                                    {isLoading ? '...' : formatDuration(analytics?.summary.avgDuration || 0)}
                                </p>
                            </div>
                            <Clock className="h-8 w-8 text-muted-foreground" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Views/Session</p>
                                <p className="text-2xl font-bold">
                                    {isLoading ? '...' : Math.round(analytics?.summary.avgViewsPerSession || 0)}
                                </p>
                            </div>
                            <BarChart3 className="h-8 w-8 text-muted-foreground" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Session Activities */}
            <Card>
                <CardHeader>
                    <CardTitle>Session Activity</CardTitle>
                    <CardDescription>
                        Recent sessions with indicator viewing activity
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="space-y-4">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="animate-pulse">
                                    <div className="h-20 bg-muted rounded-lg"></div>
                                </div>
                            ))}
                        </div>
                    ) : analytics?.activities.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <Calendar className="h-8 w-8 mx-auto mb-2" />
                            <p>No session activity in the selected time range</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {analytics?.activities.map((activity) => (
                                <div
                                    key={activity.sessionId}
                                    className="border rounded-lg p-4 space-y-3"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            {getDeviceIcon(activity.device.type)}
                                            <div>
                                                <p className="font-medium">
                                                    {activity.device.browser} on {activity.device.os}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {activity.viewCount} views • {formatDuration(activity.duration)} • {' '}
                                                    {formatDistanceToNow(new Date(activity.lastActive), { addSuffix: true })}
                                                </p>
                                            </div>
                                        </div>
                                        <Badge variant="secondary">
                                            {activity.device.type}
                                        </Badge>
                                    </div>

                                    {activity.indicators.length > 0 && (
                                        <div className="space-y-2">
                                            <p className="text-sm font-medium">Indicators viewed:</p>
                                            <div className="flex flex-wrap gap-2">
                                                {activity.indicators.map((indicator) => (
                                                    <Badge
                                                        key={indicator.id}
                                                        variant="outline"
                                                        className={getCategoryColor(indicator.category)}
                                                    >
                                                        {indicator.name}
                                                        {indicator.viewCount > 1 && (
                                                            <span className="ml-1 text-xs">×{indicator.viewCount}</span>
                                                        )}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
