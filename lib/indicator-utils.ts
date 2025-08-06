import { db, schema } from '@/lib/db';
import { eq, desc, sql, gte, and } from 'drizzle-orm';
import type { Indicator } from '@/types';

/**
 * Utility functions for managing indicators
 */

export class IndicatorManager {
    /**
     * Add a new indicator to the database using Drizzle ORM
     */
    static async addIndicator(indicator: Omit<Indicator, 'created_at' | 'is_active'>) {
        await db
            .insert(schema.indicators)
            .values({
                id: indicator.id,
                name: indicator.name,
                description: indicator.description || null,
                category: indicator.category,
                source: indicator.source,
                isActive: true,
            })
            .onConflictDoUpdate({
                target: schema.indicators.id,
                set: {
                    name: indicator.name,
                    description: indicator.description || null,
                    category: indicator.category,
                    source: indicator.source,
                }
            });
    }

    /**
     * Store data for an indicator using Drizzle ORM
     */
    static async storeData(
        indicatorId: string,
        timestamp: string,
        value: number,
        label?: string,
        metadata?: Record<string, any>
    ) {
        await db
            .insert(schema.indicatorData)
            .values({
                indicatorId,
                tsUtc: new Date(timestamp),
                value: value.toString(),
                label: label || null,
                metadata: metadata || null,
            })
            .onConflictDoNothing();
    }

    /**
     * Fetch data for an indicator with time range using Drizzle ORM
     */
    static async getData(indicatorId: string, range: string = '30d', limit: number = 1000) {
        const conditions = [eq(schema.indicatorData.indicatorId, indicatorId)];

        // Calculate date based on range
        const now = new Date();
        let cutoffDate: Date | null = null;

        switch (range) {
            case '24h':
                cutoffDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                break;
            case '7d':
                cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case '30d':
                cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                break;
            case '90d':
                cutoffDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
                break;
            case '1y':
                cutoffDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
                break;
            case 'all':
            default:
                // No date filter
                break;
        }

        if (cutoffDate) {
            conditions.push(gte(schema.indicatorData.tsUtc, cutoffDate));
        }

        const result = await db
            .select({
                ts_utc: schema.indicatorData.tsUtc,
                value: schema.indicatorData.value,
                label: schema.indicatorData.label,
                metadata: schema.indicatorData.metadata,
            })
            .from(schema.indicatorData)
            .where(cutoffDate ? and(...conditions, gte(schema.indicatorData.tsUtc, cutoffDate)) : conditions[0])
            .orderBy(desc(schema.indicatorData.tsUtc))
            .limit(limit);

        return result;
    }

    /**
     * Get the latest value for an indicator using Drizzle ORM
     */
    static async getLatestValue(indicatorId: string) {
        const result = await db
            .select({
                value: schema.indicatorData.value,
                label: schema.indicatorData.label,
                ts_utc: schema.indicatorData.tsUtc,
            })
            .from(schema.indicatorData)
            .where(eq(schema.indicatorData.indicatorId, indicatorId))
            .orderBy(desc(schema.indicatorData.tsUtc))
            .limit(1);

        return result[0] || null;
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
