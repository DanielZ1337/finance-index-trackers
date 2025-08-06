import { sql } from '@/lib/database';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

type CryptoFearGreedResponse = {
    data: Array<{
        value: string;
        value_classification: string;
        timestamp: string;
        time_until_update: string;
    }>;
};

export async function GET() {
    try {
        const response = await fetch(
            'https://api.alternative.me/fng/?limit=1',
            { cache: 'no-store' }
        );

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const text = await response.text();
        let data: CryptoFearGreedResponse;

        try {
            data = JSON.parse(text);
        } catch (parseError) {
            console.error('Failed to parse Alternative.me response:', text.substring(0, 200));
            throw new Error('Invalid JSON response from Alternative.me API');
        }

        const latest = data.data?.[0];

        if (!latest) {
            throw new Error('No crypto fear and greed data available');
        }

        const tsUtc = new Date(parseInt(latest.timestamp) * 1000).toISOString();
        const score = parseInt(latest.value);
        const label = latest.value_classification;

        // Store in new generic indicators table
        await sql`
      insert into indicator_data (indicator_id, ts_utc, value, label)
      values ('crypto-fgi', ${tsUtc}, ${score}, ${label})
      on conflict (indicator_id, ts_utc) do nothing
    `;

        return NextResponse.json({
            stored: true,
            ts: tsUtc,
            score,
            label
        });
    } catch (error) {
        console.error('Crypto FGI collection error:', error);
        return NextResponse.json({
            error: error instanceof Error ? error.message : 'Failed to collect Crypto Fear & Greed data',
            stored: false
        }, { status: 500 });
    }
}