'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { TrendingUp, Eye, Activity, Database } from 'lucide-react';

interface AnalyticsOverviewProps {
    analytics: {
        topIndicators: Array<{
            id: string;
            name: string;
            view_count: number;
            last_viewed: string;
        }>;
        dailyTrends: Array<{
            date: string;
            views: number;
        }>;
        categoryBreakdown: Array<{
            category: string;
            indicator_count: number;
            total_views: number;
        }>;
        dataFreshness: Array<{
            id: string;
            name: string;
            last_update: string | null;
            data_points: number;
        }>;
    };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export function AnalyticsOverview({ analytics }: AnalyticsOverviewProps) {
    const { topIndicators, dailyTrends, categoryBreakdown, dataFreshness } = analytics;

    const totalViews = topIndicators.reduce((sum, indicator) => sum + Number(indicator.view_count), 0);
    const totalIndicators = categoryBreakdown.reduce((sum, category) => sum + Number(category.indicator_count), 0);
    const totalDataPoints = dataFreshness.reduce((sum, indicator) => sum + Number(indicator.data_points), 0);

    // Prepare chart data
    const dailyTrendsChart = dailyTrends.map(day => ({
        date: new Date(day.date).toLocaleDateString(),
        views: Number(day.views)
    }));

    const categoryChart = categoryBreakdown.map((category, index) => ({
        name: category.category,
        value: Number(category.total_views),
        count: Number(category.indicator_count),
        color: COLORS[index % COLORS.length]
    }));

    return (
        <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                        <Eye className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalViews.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">Last 30 days</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Indicators</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalIndicators}</div>
                        <p className="text-xs text-muted-foreground">Across all categories</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Data Points</CardTitle>
                        <Database className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalDataPoints.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">Historical records</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg Views/Day</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {dailyTrends.length > 0
                                ? Math.round(dailyTrends.reduce((sum, day) => sum + Number(day.views), 0) / dailyTrends.length)
                                : 0
                            }
                        </div>
                        <p className="text-xs text-muted-foreground">Last 7 days</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Most Popular Indicators */}
                <Card>
                    <CardHeader>
                        <CardTitle>Most Popular Indicators</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={topIndicators.slice(0, 8)}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="name"
                                    tick={{ fontSize: 11 }}
                                    angle={-45}
                                    textAnchor="end"
                                    height={80}
                                />
                                <YAxis tick={{ fontSize: 11 }} />
                                <Tooltip />
                                <Bar dataKey="view_count" fill="#2563eb" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Daily View Trends */}
                <Card>
                    <CardHeader>
                        <CardTitle>Daily View Trends</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={dailyTrendsChart}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                                <YAxis tick={{ fontSize: 11 }} />
                                <Tooltip />
                                <Line
                                    type="monotone"
                                    dataKey="views"
                                    stroke="#2563eb"
                                    strokeWidth={2}
                                    dot={{ fill: '#2563eb' }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Category Breakdown */}
                <Card>
                    <CardHeader>
                        <CardTitle>Category Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={categoryChart}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {categoryChart.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value, name) => [Number(value).toLocaleString() + ' views', name]} />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Data Freshness */}
                <Card>
                    <CardHeader>
                        <CardTitle>Data Freshness</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2 max-h-[300px] overflow-auto">
                            {dataFreshness.slice(0, 10).map((indicator) => (
                                <div key={indicator.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{indicator.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {indicator.data_points} data points
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        {indicator.last_update ? (
                                            <p className="text-xs text-muted-foreground">
                                                {new Date(indicator.last_update).toLocaleDateString()}
                                            </p>
                                        ) : (
                                            <p className="text-xs text-red-500">No data</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
