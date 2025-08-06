import { pgTable, text, smallint, timestamp, serial, decimal, jsonb, boolean, varchar, index, unique } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Fear & Greed Index table (legacy table for CNN FGI)
export const fgiHourly = pgTable('fgi_hourly', {
  tsUtc: timestamp('ts_utc', { withTimezone: true }).primaryKey(),
  score: smallint('score').notNull(),
  label: text('label').notNull(),
});

// Generic indicators table for extensibility
export const indicators = pgTable('indicators', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  category: text('category').notNull(),
  source: text('source').notNull(),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// Generic indicator data
export const indicatorData = pgTable('indicator_data', {
  id: serial('id').primaryKey(),
  indicatorId: text('indicator_id').notNull().references(() => indicators.id),
  tsUtc: timestamp('ts_utc', { withTimezone: true }).notNull(),
  value: decimal('value').notNull(),
  label: text('label'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => {
  return {
    // Unique constraint on indicator_id and ts_utc
    uniqueIndicatorTime: unique('indicator_data_unique_constraint').on(table.indicatorId, table.tsUtc),
    // Index for faster queries by indicator
    indicatorIdx: index('indicator_data_indicator_idx').on(table.indicatorId),
    // Index for time-based queries
    timeIdx: index('indicator_data_time_idx').on(table.tsUtc),
  };
});

// Analytics tracking for popular indicators
export const indicatorViews = pgTable('indicator_views', {
  id: serial('id').primaryKey(),
  indicatorId: text('indicator_id').notNull().references(() => indicators.id),
  viewedAt: timestamp('viewed_at', { withTimezone: true }).defaultNow(),
  userAgent: text('user_agent'),
  ipHash: text('ip_hash'),
}, (table) => {
  return {
    // Index for analytics queries
    indicatorViewsIdx: index('indicator_views_indicator_idx').on(table.indicatorId),
    timeIdx: index('indicator_views_time_idx').on(table.viewedAt),
  };
});

// Relations
export const indicatorsRelations = relations(indicators, ({ many }) => ({
  data: many(indicatorData),
  views: many(indicatorViews),
}));

export const indicatorDataRelations = relations(indicatorData, ({ one }) => ({
  indicator: one(indicators, {
    fields: [indicatorData.indicatorId],
    references: [indicators.id],
  }),
}));

export const indicatorViewsRelations = relations(indicatorViews, ({ one }) => ({
  indicator: one(indicators, {
    fields: [indicatorViews.indicatorId],
    references: [indicators.id],
  }),
}));

// Type exports for use in your application
export type Indicator = typeof indicators.$inferSelect;
export type NewIndicator = typeof indicators.$inferInsert;
export type IndicatorData = typeof indicatorData.$inferSelect;
export type NewIndicatorData = typeof indicatorData.$inferInsert;
export type IndicatorView = typeof indicatorViews.$inferSelect;
export type NewIndicatorView = typeof indicatorViews.$inferInsert;
export type FgiHourly = typeof fgiHourly.$inferSelect;
export type NewFgiHourly = typeof fgiHourly.$inferInsert;
