import { IndicatorViewsService, IndicatorsService, IndicatorDataService } from '@/lib/db/queries';
import { db, schema } from '@/lib/db';
import { eq, desc, sql, count, max, countDistinct, gte, or, isNull } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { subDays } from 'date-fns';

export async function GET() {
  try {
    // Get top indicators by views (last 30 days)
    const thirtyDaysAgo = subDays(new Date(), 30);
    const sevenDaysAgo = subDays(new Date(), 7);

    const topIndicators = await db
      .select({
        id: schema.indicators.id,
        name: schema.indicators.name,
        view_count: count(schema.indicatorViews.id),
        last_viewed: max(schema.indicatorViews.viewedAt),
      })
      .from(schema.indicators)
      .leftJoin(schema.indicatorViews, eq(schema.indicators.id, schema.indicatorViews.indicatorId))
      .where(
        or(
          gte(schema.indicatorViews.viewedAt, thirtyDaysAgo),
          isNull(schema.indicatorViews.viewedAt)
        )
      )
      .groupBy(schema.indicators.id, schema.indicators.name)
      .orderBy(desc(count(schema.indicatorViews.id)))
      .limit(10);

    // Get daily view trends (last 7 days)
    const dailyTrends = await db
      .select({
        date: sql<string>`date_trunc('day', ${schema.indicatorViews.viewedAt})`,
        views: count(schema.indicatorViews.id),
      })
      .from(schema.indicatorViews)
      .where(gte(schema.indicatorViews.viewedAt, sevenDaysAgo))
      .groupBy(sql`date_trunc('day', ${schema.indicatorViews.viewedAt})`)
      .orderBy(desc(sql`date_trunc('day', ${schema.indicatorViews.viewedAt})`));

    // Get category breakdown
    const categoryBreakdown = await db
      .select({
        category: schema.indicators.category,
        indicator_count: countDistinct(schema.indicators.id),
        total_views: count(schema.indicatorViews.id),
      })
      .from(schema.indicators)
      .leftJoin(schema.indicatorViews, eq(schema.indicators.id, schema.indicatorViews.indicatorId))
      .where(
        eq(schema.indicators.isActive, true)
      )
      .groupBy(schema.indicators.category)
      .orderBy(desc(count(schema.indicatorViews.id)));

    // Get data freshness stats
    const dataFreshness = await db
      .select({
        id: schema.indicators.id,
        name: schema.indicators.name,
        last_update: max(schema.indicatorData.tsUtc),
        data_points: count(schema.indicatorData.id),
      })
      .from(schema.indicators)
      .leftJoin(schema.indicatorData, eq(schema.indicators.id, schema.indicatorData.indicatorId))
      .where(eq(schema.indicators.isActive, true))
      .groupBy(schema.indicators.id, schema.indicators.name)
      .orderBy(desc(max(schema.indicatorData.tsUtc)));

    return NextResponse.json({
      topIndicators,
      dailyTrends,
      categoryBreakdown,
      dataFreshness,
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
