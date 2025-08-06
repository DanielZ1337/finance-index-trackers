import { sql } from '@/lib/database';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '30d';
    const { id } = await params;

    // Track view
    const userAgent = request.headers.get('user-agent') || '';
    const forwardedFor = request.headers.get('x-forwarded-for') || '';
    const ipHash = forwardedFor ? Buffer.from(forwardedFor).toString('base64').slice(0, 10) : '';

    await sql`
    insert into indicator_views (indicator_id, user_agent, ip_hash)
    values (${id}, ${userAgent}, ${ipHash})
  `;

    // Get time range condition
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

    // Get indicator details and data
    const [indicatorResult, dataResult] = await Promise.all([
        sql`
      select * from indicators 
      where id = ${id} and is_active = true
    `,
        sql.query(`
      select ts_utc, value, label, metadata
      from indicator_data
      where indicator_id = $1 ${timeCondition}
      order by ts_utc desc
      limit 1000
    `, [id])
    ]);

    if (indicatorResult.rows.length === 0) {
        return NextResponse.json({ error: 'Indicator not found' }, { status: 404 });
    }

    return NextResponse.json({
        indicator: indicatorResult.rows[0],
        data: dataResult.rows
    });
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const body = await request.json();
    const { value, label, metadata } = body;

    if (!value) {
        return NextResponse.json({ error: 'Value is required' }, { status: 400 });
    }

    const timestamp = new Date().toISOString();

    await sql`
    insert into indicator_data (indicator_id, ts_utc, value, label, metadata)
    values (${id}, ${timestamp}, ${value}, ${label || null}, ${JSON.stringify(metadata || {})})
    on conflict (indicator_id, ts_utc) do nothing
  `;

    return NextResponse.json({
        success: true,
        timestamp,
        indicator_id: id,
        value,
        label
    });
}
