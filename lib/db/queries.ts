import { db, schema } from '@/lib/db';
import { eq, desc, asc, and, or, sql, count, ilike, gte, lte, max } from 'drizzle-orm';
import {
  Indicator,
  NewIndicator,
  IndicatorData,
  NewIndicatorData,
  IndicatorView,
  NewIndicatorView,
  FgiHourly,
  NewFgiHourly
} from '@/lib/db/schema';
import type { SortField, SortDirection } from '@/types';

// Indicators queries
export class IndicatorsService {
  /**
   * Get all indicators with their latest data and view counts
   */
  static async getIndicators(params?: {
    category?: string;
    search?: string;
    sortBy?: SortField;
    sortDirection?: SortDirection;
    limit?: number;
    offset?: number;
  }) {
    const { category, search, sortBy = 'view_count', sortDirection = 'desc', limit = 100, offset = 0 } = params || {};

    // Build where conditions
    const conditions = [eq(schema.indicators.isActive, true)];

    if (category && category !== 'all') {
      conditions.push(eq(schema.indicators.category, category));
    }

    if (search) {
      const searchPattern = `%${search}%`;
      conditions.push(
        or(
          ilike(schema.indicators.name, searchPattern),
          ilike(schema.indicators.description, searchPattern) ?? sql`false`
        ) ?? sql`false`
      );
    }

    // Build and execute query
    const query = db
      .select({
        id: schema.indicators.id,
        name: schema.indicators.name,
        description: schema.indicators.description,
        category: schema.indicators.category,
        source: schema.indicators.source,
        isActive: schema.indicators.isActive,
        createdAt: schema.indicators.createdAt,
      })
      .from(schema.indicators)
      .where(and(...conditions))
      .orderBy(sortDirection === 'desc' ? desc(schema.indicators.name) : asc(schema.indicators.name))
      .limit(limit)
      .offset(offset);

    return await query;
  }

  /**
   * Get indicators with their latest data and view counts (using Drizzle ORM)
   */
  static async getIndicatorsWithDetails(params?: {
    category?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }) {
    const { category, search, limit = 100, offset = 0 } = params || {};

    // Build base query with conditions
    const conditions = [eq(schema.indicators.isActive, true)];

    if (category && category !== 'all') {
      conditions.push(eq(schema.indicators.category, category));
    }

    if (search) {
      const searchPattern = `%${search}%`;
      conditions.push(
        or(
          ilike(schema.indicators.name, searchPattern),
          ilike(schema.indicators.description, searchPattern) ?? sql`false`
        ) ?? sql`false`
      );
    }

    // Create subqueries for latest data and view counts
    const latestDataSubquery = db
      .select({
        indicatorId: schema.indicatorData.indicatorId,
        value: schema.indicatorData.value,
        label: schema.indicatorData.label,
        tsUtc: schema.indicatorData.tsUtc,
      })
      .from(schema.indicatorData)
      .orderBy(desc(schema.indicatorData.tsUtc))
      .limit(1);

    const viewCountsSubquery = db
      .select({
        indicatorId: schema.indicatorViews.indicatorId,
        viewCount: count(schema.indicatorViews.id).as('view_count'),
      })
      .from(schema.indicatorViews)
      .where(gte(schema.indicatorViews.viewedAt, sql`NOW() - INTERVAL '30 days'`))
      .groupBy(schema.indicatorViews.indicatorId);

    // Main query with joins
    const result = await db
      .select({
        id: schema.indicators.id,
        name: schema.indicators.name,
        description: schema.indicators.description,
        category: schema.indicators.category,
        source: schema.indicators.source,
        isActive: schema.indicators.isActive,
        createdAt: schema.indicators.createdAt,
        latestValue: sql<number | null>`latest_data.value`,
        latestLabel: sql<string | null>`latest_data.label`,
        latestTimestamp: sql<Date | null>`latest_data.ts_utc`,
        viewCount: sql<number>`COALESCE(view_counts.view_count, 0)`,
      })
      .from(schema.indicators)
      .leftJoin(
        sql`(
          SELECT DISTINCT ON (indicator_id) 
            indicator_id, value, label, ts_utc 
          FROM indicator_data 
          ORDER BY indicator_id, ts_utc DESC
        ) latest_data`,
        sql`${schema.indicators.id} = latest_data.indicator_id`
      )
      .leftJoin(
        sql`(
          SELECT indicator_id, COUNT(*) as view_count
          FROM indicator_views 
          WHERE viewed_at >= NOW() - INTERVAL '30 days'
          GROUP BY indicator_id
        ) view_counts`,
        sql`${schema.indicators.id} = view_counts.indicator_id`
      )
      .where(and(...conditions))
      .orderBy(sql`COALESCE(view_counts.view_count, 0) DESC`, asc(schema.indicators.name))
      .limit(limit)
      .offset(offset);

    return result.map((row: any) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      category: row.category,
      source: row.source,
      is_active: row.isActive,
      created_at: row.createdAt,
      latest_value: row.latestValue ? Number(row.latestValue) : null,
      latest_label: row.latestLabel,
      latest_ts: row.latestTimestamp,
      view_count: Number(row.viewCount),
    }));
  }

  /**
   * Get a single indicator by ID
   */
  static async getIndicatorById(id: string) {
    const result = await db
      .select()
      .from(schema.indicators)
      .where(eq(schema.indicators.id, id))
      .limit(1);

    return result[0] || null;
  }

  /**
   * Create a new indicator
   */
  static async createIndicator(data: NewIndicator) {
    const result = await db
      .insert(schema.indicators)
      .values(data)
      .returning();

    return result[0];
  }

  /**
   * Update an indicator
   */
  static async updateIndicator(id: string, data: Partial<NewIndicator>) {
    const result = await db
      .update(schema.indicators)
      .set(data)
      .where(eq(schema.indicators.id, id))
      .returning();

    return result[0] || null;
  }

  /**
   * Delete an indicator (soft delete by setting is_active to false)
   */
  static async deleteIndicator(id: string) {
    const result = await db
      .update(schema.indicators)
      .set({ isActive: false })
      .where(eq(schema.indicators.id, id))
      .returning();

    return result[0] || null;
  }

  /**
   * Get categories with counts
   */
  static async getCategories() {
    return await db
      .select({
        category: schema.indicators.category,
        count: count(schema.indicators.id)
      })
      .from(schema.indicators)
      .where(eq(schema.indicators.isActive, true))
      .groupBy(schema.indicators.category)
      .orderBy(asc(schema.indicators.category));
  }
}

// Indicator Data queries
export class IndicatorDataService {
  /**
   * Get indicator data with optional time filtering
   */
  static async getIndicatorData(
    indicatorId: string,
    params?: {
      startDate?: Date;
      endDate?: Date;
      limit?: number;
      offset?: number;
    }
  ) {
    const { startDate, endDate, limit = 100, offset = 0 } = params || {};

    // Build where conditions
    const conditions = [eq(schema.indicatorData.indicatorId, indicatorId)];

    if (startDate) {
      conditions.push(gte(schema.indicatorData.tsUtc, startDate));
    }

    if (endDate) {
      conditions.push(lte(schema.indicatorData.tsUtc, endDate));
    }

    return await db
      .select()
      .from(schema.indicatorData)
      .where(and(...conditions))
      .orderBy(desc(schema.indicatorData.tsUtc))
      .limit(limit)
      .offset(offset);
  }

  /**
   * Get latest data point for an indicator
   */
  static async getLatestIndicatorData(indicatorId: string) {
    const result = await db
      .select()
      .from(schema.indicatorData)
      .where(eq(schema.indicatorData.indicatorId, indicatorId))
      .orderBy(desc(schema.indicatorData.tsUtc))
      .limit(1);

    return result[0] || null;
  }

  /**
   * Insert indicator data
   */
  static async insertIndicatorData(data: NewIndicatorData) {
    try {
      const result = await db
        .insert(schema.indicatorData)
        .values(data)
        .returning();

      return result[0];
    } catch (error) {
      // Handle unique constraint violation gracefully
      if (error instanceof Error && error.message.includes('duplicate key')) {
        console.log(`Data point already exists for ${data.indicatorId} at ${data.tsUtc}`);
        return null;
      }
      throw error;
    }
  }

  /**
   * Batch insert indicator data
   */
  static async insertBatchIndicatorData(data: NewIndicatorData[]) {
    if (data.length === 0) return [];

    try {
      return await db
        .insert(schema.indicatorData)
        .values(data)
        .returning();
    } catch (error) {
      // Handle batch insert with potential duplicates
      console.warn('Batch insert failed, trying individual inserts:', error);
      const results = [];
      for (const item of data) {
        const result = await this.insertIndicatorData(item);
        if (result) results.push(result);
      }
      return results;
    }
  }
}

// Indicator Views/Analytics queries
export class IndicatorViewsService {
  /**
   * Record a view for an indicator
   */
  static async recordView(data: NewIndicatorView) {
    const result = await db
      .insert(schema.indicatorViews)
      .values(data)
      .returning();

    return result[0];
  }

  /**
   * Get view counts by indicator
   */
  static async getViewCounts(limit = 10) {
    return await db
      .select({
        indicatorId: schema.indicatorViews.indicatorId,
        viewCount: count(schema.indicatorViews.id),
        indicator: {
          name: schema.indicators.name,
          category: schema.indicators.category,
        }
      })
      .from(schema.indicatorViews)
      .innerJoin(schema.indicators, eq(schema.indicatorViews.indicatorId, schema.indicators.id))
      .groupBy(schema.indicatorViews.indicatorId, schema.indicators.name, schema.indicators.category)
      .orderBy(desc(count(schema.indicatorViews.id)))
      .limit(limit);
  }

  /**
   * Get views with user information (for authenticated views)
   */
  static async getViewsWithUsers(params?: {
    indicatorId?: string;
    limit?: number;
    offset?: number;
  }) {
    const { indicatorId, limit = 50, offset = 0 } = params || {};

    const conditions = [];
    if (indicatorId) {
      conditions.push(eq(schema.indicatorViews.indicatorId, indicatorId));
    }

    return await db
      .select({
        id: schema.indicatorViews.id,
        indicatorId: schema.indicatorViews.indicatorId,
        userId: schema.indicatorViews.userId,
        viewedAt: schema.indicatorViews.viewedAt,
        userAgent: schema.indicatorViews.userAgent,
        indicator: {
          name: schema.indicators.name,
          category: schema.indicators.category,
        },
        user: {
          id: schema.user.id,
          name: schema.user.name,
          email: schema.user.email,
        }
      })
      .from(schema.indicatorViews)
      .innerJoin(schema.indicators, eq(schema.indicatorViews.indicatorId, schema.indicators.id))
      .leftJoin(schema.user, eq(schema.indicatorViews.userId, schema.user.id))
      .where(and(...conditions))
      .orderBy(desc(schema.indicatorViews.viewedAt))
      .limit(limit)
      .offset(offset);
  }

  /**
   * Get view counts by user (for authenticated views only)
   */
  static async getViewCountsByUser(limit = 10) {
    return await db
      .select({
        userId: schema.indicatorViews.userId,
        viewCount: count(schema.indicatorViews.id),
        user: {
          name: schema.user.name,
          email: schema.user.email,
        }
      })
      .from(schema.indicatorViews)
      .innerJoin(schema.user, eq(schema.indicatorViews.userId, schema.user.id))
      .where(sql`${schema.indicatorViews.userId} IS NOT NULL`)
      .groupBy(schema.indicatorViews.userId, schema.user.name, schema.user.email)
      .orderBy(desc(count(schema.indicatorViews.id)))
      .limit(limit);
  }

  /**
   * Get daily view trends using Drizzle ORM
   */
  static async getDailyViewTrends(days = 30) {
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - days);

    return await db
      .select({
        date: sql<string>`DATE(${schema.indicatorViews.viewedAt})`,
        viewCount: count(schema.indicatorViews.id)
      })
      .from(schema.indicatorViews)
      .where(gte(schema.indicatorViews.viewedAt, daysAgo))
      .groupBy(sql`DATE(${schema.indicatorViews.viewedAt})`)
      .orderBy(sql`DATE(${schema.indicatorViews.viewedAt})`);
  }
}

// Legacy FGI queries (for backward compatibility)
export class FgiService {
  /**
   * Insert FGI hourly data with upsert
   */
  static async insertFgiData(data: NewFgiHourly) {
    try {
      const result = await db
        .insert(schema.fgiHourly)
        .values(data)
        .onConflictDoUpdate({
          target: schema.fgiHourly.tsUtc,
          set: {
            score: data.score,
            label: data.label,
          },
        })
        .returning();

      return result[0];
    } catch (error) {
      console.error('Failed to insert/update FGI data:', error);
      throw error;
    }
  }

  /**
   * Get latest FGI data
   */
  static async getLatestFgi() {
    const result = await db
      .select()
      .from(schema.fgiHourly)
      .orderBy(desc(schema.fgiHourly.tsUtc))
      .limit(1);

    return result[0] || null;
  }

  /**
   * Get FGI historical data
   */
  static async getFgiHistory(limit = 100) {
    return await db
      .select()
      .from(schema.fgiHourly)
      .orderBy(desc(schema.fgiHourly.tsUtc))
      .limit(limit);
  }
}
