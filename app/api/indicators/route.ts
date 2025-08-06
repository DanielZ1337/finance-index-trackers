import { sql } from '@/lib/database';
import { NextRequest, NextResponse } from 'next/server';
import type { IndicatorWithLatestData } from '@/types';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'view_count';
    const sortDir = searchParams.get('sortDir') || 'desc';

    let query = `
    select 
      i.*,
      latest.value as latest_value,
      latest.label as latest_label,
      latest.ts_utc as latest_ts,
      coalesce(data_counts.count, 0) as data_count,
      coalesce(view_counts.count, 0) as view_count
    from indicators i
    left join lateral (
      select value, label, ts_utc
      from indicator_data id
      where id.indicator_id = i.id
      order by ts_utc desc
      limit 1
    ) latest on true
    left join (
      select indicator_id, count(*) as count
      from indicator_data
      group by indicator_id
    ) data_counts on data_counts.indicator_id = i.id
    left join (
      select indicator_id, count(*) as count
      from indicator_views
      where viewed_at > now() - interval '30 days'
      group by indicator_id
    ) view_counts on view_counts.indicator_id = i.id
    where i.is_active = true
  `;

    const params: any[] = [];
    let paramIndex = 1;

    if (category) {
        query += ` and i.category = $${paramIndex}`;
        params.push(category);
        paramIndex++;
    }

    if (search) {
        query += ` and (i.name ilike $${paramIndex} or i.description ilike $${paramIndex})`;
        params.push(`%${search}%`);
        paramIndex++;
    }

    // Add sorting
    const validSorts = ['name', 'category', 'latest_value', 'view_count', 'latest_ts'];
    const sortField = validSorts.includes(sortBy) ? sortBy : 'view_count';
    const sortDirection = sortDir === 'asc' ? 'asc' : 'desc';

    query += ` order by ${sortField} ${sortDirection} nulls last`;

    const result = await sql.query(query, params);

    return NextResponse.json(result.rows as IndicatorWithLatestData[]);
}
