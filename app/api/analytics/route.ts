import { sql } from '@/lib/database';
import { NextResponse } from 'next/server';

export async function GET() {
    // Get top indicators by views (last 30 days)
    const topIndicators = await sql`
    select 
      i.id,
      i.name,
      count(iv.id) as view_count,
      max(iv.viewed_at) as last_viewed
    from indicators i
    left join indicator_views iv on iv.indicator_id = i.id
    where iv.viewed_at > now() - interval '30 days'
    group by i.id, i.name
    order by view_count desc
    limit 10
  `;

    // Get daily view trends (last 7 days)
    const dailyTrends = await sql`
    select 
      date_trunc('day', viewed_at) as date,
      count(*) as views
    from indicator_views
    where viewed_at > now() - interval '7 days'
    group by date_trunc('day', viewed_at)
    order by date desc
  `;

    // Get category breakdown
    const categoryBreakdown = await sql`
    select 
      i.category,
      count(distinct i.id) as indicator_count,
      count(iv.id) as total_views
    from indicators i
    left join indicator_views iv on iv.indicator_id = i.id
    where i.is_active = true
      and (iv.viewed_at > now() - interval '30 days' or iv.viewed_at is null)
    group by i.category
    order by total_views desc
  `;

    // Get data freshness stats
    const dataFreshness = await sql`
    select 
      i.id,
      i.name,
      max(id_data.ts_utc) as last_update,
      count(id_data.id) as data_points
    from indicators i
    left join indicator_data id_data on id_data.indicator_id = i.id
    where i.is_active = true
    group by i.id, i.name
    order by last_update desc nulls last
  `;

    return NextResponse.json({
        topIndicators: topIndicators.rows,
        dailyTrends: dailyTrends.rows,
        categoryBreakdown: categoryBreakdown.rows,
        dataFreshness: dataFreshness.rows
    });
}
