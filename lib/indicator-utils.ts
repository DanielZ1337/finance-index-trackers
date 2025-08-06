import { sql } from '@/lib/database';
import type { Indicator } from '@/types';

/**
 * Utility functions for managing indicators
 */

export class IndicatorManager {
    /**
     * Add a new indicator to the database
     */
    static async addIndicator(indicator: Omit<Indicator, 'created_at' | 'is_active'>) {
        await sql`
      insert into indicators (id, name, description, category, source)
      values (${indicator.id}, ${indicator.name}, ${indicator.description || ''}, ${indicator.category}, ${indicator.source})
      on conflict (id) do update set
        name = excluded.name,
        description = excluded.description,
        category = excluded.category,
        source = excluded.source
    `;
    }

    /**
     * Store data for an indicator
     */
    static async storeData(
        indicatorId: string,
        timestamp: string,
        value: number,
        label?: string,
        metadata?: Record<string, any>
    ) {
        await sql`
      insert into indicator_data (indicator_id, ts_utc, value, label, metadata)
      values (${indicatorId}, ${timestamp}, ${value}, ${label || null}, ${JSON.stringify(metadata || {})})
      on conflict (indicator_id, ts_utc) do nothing
    `;
    }

    /**
     * Fetch data for an indicator with time range
     */
    static async getData(indicatorId: string, range: string = '30d', limit: number = 1000) {
        let timeCondition = '';
        switch (range) {
            case '24h':
                timeCondition = "and ts_utc > now() - interval '24 hours'";
                break;
            case '7d':
                timeCondition = "and ts_utc > now() - interval '7 days'";
                break;
            case '30d':
                timeCondition = "and ts_utc > now() - interval '30 days'";
                break;
            case '90d':
                timeCondition = "and ts_utc > now() - interval '90 days'";
                break;
            case '1y':
                timeCondition = "and ts_utc > now() - interval '1 year'";
                break;
            case 'all':
                timeCondition = '';
                break;
        }

        const result = await sql.query(`
      select ts_utc, value, label, metadata
      from indicator_data
      where indicator_id = $1 ${timeCondition}
      order by ts_utc desc
      limit $2
    `, [indicatorId, limit]);

        return result.rows;
    }

    /**
     * Get the latest value for an indicator
     */
    static async getLatestValue(indicatorId: string) {
        const result = await sql`
      select value, label, ts_utc
      from indicator_data
      where indicator_id = ${indicatorId}
      order by ts_utc desc
      limit 1
    `;

        return result.rows[0] || null;
    }
}

/**
 * Common data fetching utilities
 */
export const DataFetcher = {
    /**
     * Fetch JSON data with error handling and caching control
     */
    async fetchJson(url: string, options: RequestInit = {}) {
        const response = await fetch(url, {
            cache: 'no-store',
            ...options,
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response.json();
    },

    /**
     * Convert various timestamp formats to ISO string
     */
    normalizeTimestamp(timestamp: string | number): string {
        if (typeof timestamp === 'number') {
            // Assume Unix timestamp (seconds)
            return new Date(timestamp * 1000).toISOString();
        }

        // Try parsing as date string
        const date = new Date(timestamp);
        if (isNaN(date.getTime())) {
            throw new Error(`Invalid timestamp: ${timestamp}`);
        }

        return date.toISOString();
    },

    /**
     * Normalize score/value to number
     */
    normalizeValue(value: string | number): number {
        if (typeof value === 'number') {
            return value;
        }

        const parsed = parseFloat(value);
        if (isNaN(parsed)) {
            throw new Error(`Invalid numeric value: ${value}`);
        }

        return parsed;
    },
};

/**
 * Collection result type
 */
export interface CollectionResult {
    stored: boolean;
    ts: string;
    value: number;
    label?: string;
    error?: string;
}
