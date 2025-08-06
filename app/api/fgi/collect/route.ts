import { sql } from '@/lib/database';
import { NextResponse } from 'next/server';
import { CNNFearGreedResponse } from '@/lib/cnn-types';

export const runtime = 'nodejs';

export async function GET() {
    try {
        const response = await fetch(
            'https://production.dataviz.cnn.io/index/fearandgreed/graphdata',
            {
                cache: 'no-store',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                    'Accept': 'application/json, text/plain, */*',
                    'Accept-Language': 'en-US,en;q=0.9',
                    'Referer': 'https://www.cnn.com/'
                }
            }
        );

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const text = await response.text();
        let data: CNNFearGreedResponse;

        try {
            data = JSON.parse(text);
        } catch (parseError) {
            console.error('Failed to parse CNN response:', text.substring(0, 200));
            throw new Error('Invalid JSON response from CNN API');
        }

        const fgiData = data.fear_and_greed;

        if (!fgiData) {
            throw new Error('No fear and greed data available');
        }

        const tsUtc = new Date(fgiData.timestamp).toISOString();
        const score = Math.round(fgiData.score);
        const label = fgiData.rating;

        // Store in legacy table for backward compatibility
        await sql`
      insert into fgi_hourly (ts_utc, score, label)
      values (${tsUtc}, ${score}, ${label})
      on conflict do nothing
    `;

        // Store in new generic indicators table
        await sql`
      insert into indicator_data (indicator_id, ts_utc, value, label)
      values ('cnn-fgi', ${tsUtc}, ${score}, ${label})
      on conflict (indicator_id, ts_utc) do nothing
    `;

        return NextResponse.json({
            stored: true,
            ts: tsUtc,
            score,
            label
        });
    } catch (error) {
        console.error('CNN FGI collection error:', error);
        return NextResponse.json({
            error: error instanceof Error ? error.message : 'Failed to collect CNN Fear & Greed data',
            stored: false
        }, { status: 500 });
    }
}