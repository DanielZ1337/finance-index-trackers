export interface Indicator {
    id: string;
    name: string;
    description?: string;
    category: 'sentiment' | 'crypto' | 'valuation' | 'volatility' | 'other';
    source: string;
    is_active: boolean;
    created_at: string;
}

export interface IndicatorData {
    id: number;
    indicator_id: string;
    ts_utc: string;
    value: number;
    label?: string;
    metadata?: Record<string, any>;
    created_at: string;
}

export interface IndicatorWithLatestData extends Indicator {
    latest_value?: number;
    latest_label?: string;
    latest_ts?: string;
    data_count?: number;
    view_count?: number;
}

export interface IndicatorAnalytics {
    indicator_id: string;
    view_count: number;
    last_viewed: string;
    daily_views: { date: string; count: number }[];
}

export interface ChartDataPoint {
    timestamp: string;
    value: number;
    label?: string;
    formattedDate: string;
}

export type TimeRange = '24h' | '7d' | '30d' | '90d' | '1y' | 'all';

export type SortField = 'name' | 'category' | 'latest_value' | 'view_count' | 'latest_ts';
export type SortDirection = 'asc' | 'desc';
