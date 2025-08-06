'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, TrendingUp, TrendingDown, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { IndicatorWithLatestData } from '@/types';

interface IndicatorCardProps {
    indicator: IndicatorWithLatestData;
    onViewDetails: (indicator: IndicatorWithLatestData) => void;
}

const categoryColors = {
    sentiment: 'bg-blue-100 text-blue-800',
    crypto: 'bg-orange-100 text-orange-800',
    valuation: 'bg-green-100 text-green-800',
    volatility: 'bg-red-100 text-red-800',
    other: 'bg-gray-100 text-gray-800',
};

const getCategoryIcon = (category: string) => {
    switch (category) {
        case 'sentiment':
            return '📊';
        case 'crypto':
            return '₿';
        case 'valuation':
            return '💰';
        case 'volatility':
            return '📈';
        default:
            return '📋';
    }
};

const getValueTrend = (value: number, category: string) => {
    // This is a simplified trend indicator - you can make this more sophisticated
    if (category === 'sentiment' || category === 'crypto') {
        return value > 50 ? <TrendingUp className="h-4 w-4 text-green-500" /> : <TrendingDown className="h-4 w-4 text-red-500" />;
    }
    return <TrendingUp className="h-4 w-4 text-blue-500" />;
};

export function IndicatorCard({ indicator, onViewDetails }: IndicatorCardProps) {
    const {
        name,
        description,
        category,
        source,
        latest_value,
        latest_label,
        latest_ts,
        view_count = 0,
        data_count = 0,
    } = indicator;

    return (
        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => onViewDetails(indicator)}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center space-x-2">
                    <span className="text-lg">{getCategoryIcon(category)}</span>
                    <CardTitle className="text-sm font-medium line-clamp-1">{name}</CardTitle>
                </div>
                <Badge className={categoryColors[category as keyof typeof categoryColors] || categoryColors.other}>
                    {category}
                </Badge>
            </CardHeader>

            <CardContent>
                <div className="space-y-3">
                    {description && (
                        <p className="text-xs text-muted-foreground line-clamp-2">{description}</p>
                    )}

                    {latest_value !== undefined && (
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                {getValueTrend(latest_value, category)}
                                <span className="text-2xl font-bold">{latest_value}</span>
                                {latest_label && (
                                    <Badge variant="outline" className="text-xs">
                                        {latest_label}
                                    </Badge>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center space-x-1">
                            <Eye className="h-3 w-3" />
                            <span>{view_count} views</span>
                        </div>
                        <div className="flex items-center space-x-1">
                            <span>📈 {data_count} data points</span>
                        </div>
                    </div>

                    {latest_ts && (
                        <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>Updated {formatDistanceToNow(new Date(latest_ts), { addSuffix: true })}</span>
                        </div>
                    )}

                    <div className="flex items-center justify-between pt-2">
                        <span className="text-xs text-muted-foreground">Source: {source}</span>
                        <Button size="sm" variant="ghost" className="h-6 px-2 text-xs">
                            View Details →
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
