'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Bar, BarChart, XAxis, CartesianGrid, Line, LineChart, Pie, PieChart, Cell } from 'recharts';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { TrendingUp, Eye, Activity, Database } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';

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
                        <CardDescription>
                            Top performing indicators by view count
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer
                            config={{
                                views: {
                                    label: "Views",
                                    color: "var(--chart-1)",
                                },
                            } satisfies ChartConfig}
                            className="h-[300px]"
                        >
                            <BarChart
                                accessibilityLayer
                                data={topIndicators.slice(0, 8)}
                                margin={{
                                    top: 20,
                                    right: 20,
                                    bottom: 60,
                                    left: 20,
                                }}
                            >
                                <CartesianGrid vertical={false} />
                                <XAxis
                                    dataKey="name"
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={8}
                                    angle={-45}
                                    textAnchor="end"
                                    height={80}
                                    tick={{ fontSize: 11 }}
                                />
                                <ChartTooltip
                                    content={
                                        <ChartTooltipContent
                                            className="w-[200px]"
                                            nameKey="views"
                                            labelFormatter={(value) => `${value}`}
                                            formatter={(value) => [
                                                Number(value).toLocaleString(),
                                                "Views"
                                            ]}
                                        />
                                    }
                                />
                                <Bar
                                    dataKey="view_count"
                                    fill="var(--color-views)"
                                    radius={[4, 4, 0, 0]}
                                />
                            </BarChart>
                        </ChartContainer>
                    </CardContent>
                </Card>

                {/* Daily View Trends */}
                <Card>
                    <CardHeader>
                        <CardTitle>Daily View Trends</CardTitle>
                        <CardDescription>
                            Views over the last 7 days
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer
                            config={{
                                views: {
                                    label: "Views",
                                    color: "var(--chart-2)",
                                },
                            } satisfies ChartConfig}
                            className="h-[300px]"
                        >
                            <LineChart
                                accessibilityLayer
                                data={dailyTrendsChart}
                                margin={{
                                    left: 12,
                                    right: 12,
                                }}
                            >
                                <CartesianGrid vertical={false} />
                                <XAxis
                                    dataKey="date"
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={8}
                                    tick={{ fontSize: 11 }}
                                />
                                <ChartTooltip
                                    content={
                                        <ChartTooltipContent
                                            className="w-[150px]"
                                            nameKey="views"
                                            labelFormatter={(value) => `${value}`}
                                            formatter={(value) => [
                                                Number(value).toLocaleString(),
                                                "Views"
                                            ]}
                                        />
                                    }
                                />
                                <Line
                                    dataKey="views"
                                    type="monotone"
                                    stroke="var(--color-views)"
                                    strokeWidth={2}
                                    dot={false}
                                />
                            </LineChart>
                        </ChartContainer>
                    </CardContent>
                </Card>

                {/* Category Breakdown */}
                <Card>
                    <CardHeader>
                        <CardTitle>Category Distribution</CardTitle>
                        <CardDescription>
                            Views breakdown by indicator category
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer
                            config={{
                                views: {
                                    label: "Views",
                                },
                                sentiment: {
                                    label: "Sentiment",
                                    color: "var(--chart-1)",
                                },
                                crypto: {
                                    label: "Crypto",
                                    color: "var(--chart-2)",
                                },
                                volatility: {
                                    label: "Volatility",
                                    color: "var(--chart-3)",
                                },
                                valuation: {
                                    label: "Valuation",
                                    color: "var(--chart-4)",
                                },
                                other: {
                                    label: "Other",
                                    color: "var(--chart-5)",
                                },
                            } satisfies ChartConfig}
                            className="mx-auto aspect-square max-h-[300px]"
                        >
                            <PieChart>
                                <ChartTooltip
                                    content={<ChartTooltipContent hideLabel />}
                                />
                                <Pie
                                    data={categoryChart}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    label={({ name, percent }) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
                                >
                                    {categoryChart.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <ChartLegend
                                    content={<ChartLegendContent />}
                                />
                            </PieChart>
                        </ChartContainer>
                    </CardContent>
                </Card>

                {/* Data Freshness */}
                <Card>
                    <CardHeader>
                        <CardTitle>Data Freshness</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-[300px]">
                            <div className="space-y-2 pr-4">
                                {dataFreshness.slice(0, 10).map((indicator) => (
                                    <div key={indicator.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50 border">
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
                        </ScrollArea>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
