import { IndicatorsService, IndicatorViewsService } from '@/lib/db/queries';
import { db, schema } from '@/lib/db';
import { count, desc, sql, eq, gte, max, countDistinct } from 'drizzle-orm';
import type { IndicatorWithLatestData } from '@/types';

// Server component for SSR of indicators
export async function getIndicators(): Promise<IndicatorWithLatestData[]> {
    try {
        // Use the enhanced Drizzle ORM query with proper joins
        const result = await db
            .select({
                id: schema.indicators.id,
                name: schema.indicators.name,
                description: schema.indicators.description,
                category: schema.indicators.category,
                source: schema.indicators.source,
                is_active: schema.indicators.isActive,
                created_at: schema.indicators.createdAt,
                latest_value: sql<number | null>`latest_data.value`,
                latest_label: sql<string | null>`latest_data.label`,
                latest_ts: sql<Date | null>`latest_data.ts_utc`,
                view_count: sql<number>`COALESCE(view_counts.view_count, 0)`,
                data_count: sql<number>`COALESCE(data_counts.data_count, 0)`,
            })
            .from(schema.indicators)
            .leftJoin(
                sql`(
                    SELECT DISTINCT ON (indicator_id) 
                        indicator_id, value, label, ts_utc 
                    FROM indicator_data 
                    ORDER BY indicator_id, ts_utc DESC
                ) latest_data`,
                sql`latest_data.indicator_id = ${schema.indicators.id}`
            )
            .leftJoin(
                sql`(
                    SELECT indicator_id, COUNT(*) as view_count
                    FROM indicator_views 
                    GROUP BY indicator_id
                ) view_counts`,
                sql`view_counts.indicator_id = ${schema.indicators.id}`
            )
            .leftJoin(
                sql`(
                    SELECT indicator_id, COUNT(*) as data_count
                    FROM indicator_data 
                    GROUP BY indicator_id
                ) data_counts`,
                sql`data_counts.indicator_id = ${schema.indicators.id}`
            )
            .where(eq(schema.indicators.isActive, true))
            .orderBy(sql`COALESCE(view_counts.view_count, 0) DESC`, schema.indicators.name)
            .limit(100);

        console.log('Raw database result:', JSON.stringify(result, null, 2));

        return result.map((row): IndicatorWithLatestData => ({
            id: row.id,
            name: row.name,
            description: row.description || undefined,
            category: row.category as any,
            source: row.source,
            is_active: row.is_active ?? true,
            created_at: row.created_at ? (row.created_at.toISOString?.() || new Date(row.created_at).toISOString()) : new Date().toISOString(),
            latest_value: row.latest_value ? Number(row.latest_value) : undefined,
            latest_label: row.latest_label || undefined,
            latest_ts: row.latest_ts ? (row.latest_ts.toISOString?.() || new Date(row.latest_ts).toISOString()) : undefined,
            view_count: Number(row.view_count) || 0,
            data_count: Number(row.data_count) || 0,
        }));
    } catch (error) {
        console.error('Failed to fetch indicators:', error);
        return [];
    }
}

export async function getAnalytics() {
    try {
        const [topIndicators, dailyViews, totalViewsResult, categoryBreakdown, dataFreshness, lastViewedTimes] = await Promise.all([
            // Top indicators using Drizzle with subquery
            IndicatorViewsService.getViewCounts(8),

            // Daily view trends using Drizzle
            IndicatorViewsService.getDailyViewTrends(7),

            // Total views count
            db
                .select({ total: count(schema.indicatorViews.id) })
                .from(schema.indicatorViews),

            // Category breakdown with view counts (using Drizzle)
            db
                .select({
                    category: schema.indicators.category,
                    indicator_count: countDistinct(schema.indicators.id),
                    total_views: count(schema.indicatorViews.id),
                })
                .from(schema.indicators)
                .leftJoin(
                    schema.indicatorViews,
                    eq(schema.indicators.id, schema.indicatorViews.indicatorId)
                )
                .where(
                    eq(schema.indicators.isActive, true)
                )
                .groupBy(schema.indicators.category)
                .orderBy(desc(count(schema.indicatorViews.id))),

            // Data freshness check (using Drizzle)
            db
                .select({
                    id: schema.indicators.id,
                    name: schema.indicators.name,
                    last_update: max(schema.indicatorData.tsUtc),
                    data_points: count(schema.indicatorData.id),
                })
                .from(schema.indicators)
                .leftJoin(
                    schema.indicatorData,
                    eq(schema.indicators.id, schema.indicatorData.indicatorId)
                )
                .where(eq(schema.indicators.isActive, true))
                .groupBy(schema.indicators.id, schema.indicators.name)
                .orderBy(desc(max(schema.indicatorData.tsUtc)))
                .limit(15),

            // Last viewed times for top indicators
            db
                .select({
                    indicator_id: schema.indicatorViews.indicatorId,
                    last_viewed: max(schema.indicatorViews.viewedAt),
                })
                .from(schema.indicatorViews)
                .groupBy(schema.indicatorViews.indicatorId)
        ]);

        // Create a map of indicator_id to last_viewed
        const lastViewedMap = new Map(
            lastViewedTimes.map(item => [item.indicator_id, item.last_viewed])
        );

        return {
            topIndicators: topIndicators.map((item) => ({
                id: item.indicatorId,
                name: item.indicator.name,
                category: item.indicator.category,
                view_count: item.viewCount,
                last_viewed: lastViewedMap.get(item.indicatorId)?.toISOString() || null,
            })),
            dailyTrends: dailyViews.map((item) => ({
                date: item.date,
                views: item.viewCount,
            })),
            categoryBreakdown: categoryBreakdown.map((row) => ({
                category: row.category,
                indicator_count: Number(row.indicator_count),
                total_views: Number(row.total_views),
            })),
            dataFreshness: dataFreshness.map((row) => ({
                id: row.id,
                name: row.name,
                last_update: row.last_update,
                data_points: Number(row.data_points),
            })),
            totalViews: Number(totalViewsResult[0]?.total || 0),
        };
    } catch (error) {
        console.error('Failed to fetch analytics:', error);
        return {
            topIndicators: [],
            dailyTrends: [],
            categoryBreakdown: [],
            dataFreshness: [],
            totalViews: 0,
        };
    }
}
