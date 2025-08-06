'use client';

import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, parseISO } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, TrendingUp, BarChart3, Eye } from 'lucide-react';
import type { Indicator, IndicatorData, TimeRange } from '@/types';

interface IndicatorDetailViewProps {
    indicator: Indicator;
    data: IndicatorData[];
    onClose: () => void;
}

const timeRanges: { value: TimeRange; label: string }[] = [
    { value: '24h', label: '24H' },
    { value: '7d', label: '7D' },
    { value: '30d', label: '30D' },
    { value: '90d', label: '90D' },
    { value: '1y', label: '1Y' },
    { value: 'all', label: 'All' },
];

const categoryColors = {
    sentiment: 'bg-blue-100 text-blue-800',
    crypto: 'bg-orange-100 text-orange-800',
    valuation: 'bg-green-100 text-green-800',
    volatility: 'bg-red-100 text-red-800',
    other: 'bg-gray-100 text-gray-800',
};

export function IndicatorDetailView({ indicator, data, onClose }: IndicatorDetailViewProps) {
    const [selectedRange, setSelectedRange] = useState<TimeRange>('30d');

    const chartData = data
        .slice()
        .reverse()
        .map((point) => ({
            timestamp: point.ts_utc,
            value: Number(point.value),
            label: point.label,
            formattedDate: format(parseISO(point.ts_utc), 'MMM dd HH:mm'),
            fullDate: format(parseISO(point.ts_utc), 'PPP p'),
        }));

    const latestValue = data[0];
    const previousValue = data[1];
    const change = latestValue && previousValue
        ? Number(latestValue.value) - Number(previousValue.value)
        : null;
    const changePercent = latestValue && previousValue && Number(previousValue.value) !== 0
        ? ((Number(latestValue.value) - Number(previousValue.value)) / Number(previousValue.value)) * 100
        : null;

    const stats = {
        min: Math.min(...data.map(d => Number(d.value))),
        max: Math.max(...data.map(d => Number(d.value))),
        avg: data.reduce((sum, d) => sum + Number(d.value), 0) / data.length,
    };

    return (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50">
            <div className="fixed inset-4 bg-background rounded-lg shadow-lg overflow-hidden">
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="border-b p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div>
                                    <div className="flex items-center space-x-2 mb-2">
                                        <h1 className="text-2xl font-bold">{indicator.name}</h1>
                                        <Badge className={categoryColors[indicator.category as keyof typeof categoryColors] || categoryColors.other}>
                                            {indicator.category}
                                        </Badge>
                                    </div>
                                    <p className="text-muted-foreground">{indicator.description}</p>
                                    <p className="text-sm text-muted-foreground">Source: {indicator.source}</p>
                                </div>
                            </div>
                            <Button variant="ghost" onClick={onClose}>
                                ✕
                            </Button>
                        </div>

                        {/* Current Value */}
                        {latestValue && (
                            <div className="mt-4 flex items-center space-x-6">
                                <div>
                                    <div className="flex items-center space-x-2">
                                        <span className="text-3xl font-bold">{Number(latestValue.value).toLocaleString()}</span>
                                        {latestValue.label && (
                                            <Badge variant="outline">{latestValue.label}</Badge>
                                        )}
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        {format(parseISO(latestValue.ts_utc), 'PPP p')}
                                    </p>
                                </div>

                                {change !== null && (
                                    <div className="flex items-center space-x-2">
                                        <div className={`flex items-center space-x-1 ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            <TrendingUp className={`h-4 w-4 ${change < 0 ? 'rotate-180' : ''}`} />
                                            <span className="font-medium">
                                                {change >= 0 ? '+' : ''}{change.toFixed(2)}
                                            </span>
                                            {changePercent !== null && (
                                                <span className="text-sm">
                                                    ({changePercent >= 0 ? '+' : ''}{changePercent.toFixed(1)}%)
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-auto">
                        <Tabs defaultValue="chart" className="h-full">
                            <div className="border-b px-6">
                                <TabsList>
                                    <TabsTrigger value="chart">Chart</TabsTrigger>
                                    <TabsTrigger value="data">Data Table</TabsTrigger>
                                    <TabsTrigger value="stats">Statistics</TabsTrigger>
                                </TabsList>
                            </div>

                            <TabsContent value="chart" className="p-6">
                                {/* Time Range Selector */}
                                <div className="mb-4 flex space-x-2">
                                    {timeRanges.map((range) => (
                                        <Button
                                            key={range.value}
                                            variant={selectedRange === range.value ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => setSelectedRange(range.value)}
                                        >
                                            {range.label}
                                        </Button>
                                    ))}
                                </div>

                                {/* Chart */}
                                <Card>
                                    <CardContent className="p-6">
                                        <ResponsiveContainer width="100%" height={400}>
                                            <LineChart data={chartData}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis
                                                    dataKey="formattedDate"
                                                    tick={{ fontSize: 12 }}
                                                    tickFormatter={(value, index) => {
                                                        // Show fewer ticks on smaller screens
                                                        if (chartData.length > 20 && index % Math.ceil(chartData.length / 10) !== 0) {
                                                            return '';
                                                        }
                                                        return value;
                                                    }}
                                                />
                                                <YAxis tick={{ fontSize: 12 }} />
                                                <Tooltip
                                                    formatter={(value, name) => [Number(value).toLocaleString(), 'Value']}
                                                    labelFormatter={(label, payload) => {
                                                        if (payload && payload[0]) {
                                                            return payload[0].payload.fullDate;
                                                        }
                                                        return label;
                                                    }}
                                                />
                                                <Line
                                                    type="monotone"
                                                    dataKey="value"
                                                    stroke="#2563eb"
                                                    strokeWidth={2}
                                                    dot={{ fill: '#2563eb', strokeWidth: 2, r: 3 }}
                                                    activeDot={{ r: 5 }}
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="data" className="p-6">
                                <Card>
                                    <CardContent className="p-0">
                                        <div className="max-h-96 overflow-auto">
                                            <table className="w-full text-sm">
                                                <thead className="bg-muted sticky top-0">
                                                    <tr>
                                                        <th className="text-left p-3">Timestamp</th>
                                                        <th className="text-left p-3">Value</th>
                                                        <th className="text-left p-3">Label</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {data.map((point, index) => (
                                                        <tr key={point.id} className="border-b">
                                                            <td className="p-3">
                                                                {format(parseISO(point.ts_utc), 'PPP p')}
                                                            </td>
                                                            <td className="p-3 font-mono">
                                                                {Number(point.value).toLocaleString()}
                                                            </td>
                                                            <td className="p-3">
                                                                {point.label && (
                                                                    <Badge variant="outline">{point.label}</Badge>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="stats" className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <Card>
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-sm font-medium">Minimum</CardTitle>
                                            <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold">{stats.min.toLocaleString()}</div>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-sm font-medium">Average</CardTitle>
                                            <BarChart3 className="h-4 w-4 text-blue-500" />
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold">{stats.avg.toFixed(2)}</div>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-sm font-medium">Maximum</CardTitle>
                                            <TrendingUp className="h-4 w-4 text-green-500" />
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold">{stats.max.toLocaleString()}</div>
                                        </CardContent>
                                    </Card>
                                </div>

                                <Card className="mt-4">
                                    <CardHeader>
                                        <CardTitle className="text-lg">Data Overview</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            <p><strong>Total Data Points:</strong> {data.length}</p>
                                            <p><strong>Date Range:</strong> {
                                                data.length > 0 ?
                                                    `${format(parseISO(data[data.length - 1].ts_utc), 'PPP')} - ${format(parseISO(data[0].ts_utc), 'PPP')}` :
                                                    'No data'
                                            }</p>
                                            <p><strong>Volatility:</strong> {(stats.max - stats.min).toFixed(2)} ({(((stats.max - stats.min) / stats.avg) * 100).toFixed(1)}% of average)</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </div>
        </div>
    );
}
