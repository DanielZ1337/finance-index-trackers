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

        const indicators = [
            {
                id: 'cnn-sp500-momentum',
                name: 'S&P 500 Market Momentum',
                data: data.market_momentum_sp500
            },
            {
                id: 'cnn-sp125-momentum',
                name: 'S&P 125 Market Momentum',
                data: data.market_momentum_sp125
            },
            {
                id: 'cnn-stock-strength',
                name: 'Stock Price Strength',
                data: data.stock_price_strength
            },
            {
                id: 'cnn-stock-breadth',
                name: 'Stock Price Breadth',
                data: data.stock_price_breadth
            },
            {
                id: 'cnn-put-call',
                name: 'Put-Call Options',
                data: data.put_call_options
            },
            {
                id: 'cnn-vix',
                name: 'Market Volatility (VIX)',
                data: data.market_volatility_vix
            },
            {
                id: 'cnn-vix50',
                name: 'Market Volatility (VIX50)',
                data: data.market_volatility_vix_50
            },
            {
                id: 'cnn-junk-bond',
                name: 'Junk Bond Demand',
                data: data.junk_bond_demand
            },
            {
                id: 'cnn-safe-haven',
                name: 'Safe Haven Demand',
                data: data.safe_haven_demand
            }
        ];

        const results = [];

        for (const indicator of indicators) {
            if (!indicator.data || !indicator.data.timestamp) continue;

            // CNN timestamps are already in milliseconds, but some might be in seconds
            const timestamp = indicator.data.timestamp > 9999999999
                ? indicator.data.timestamp  // Already milliseconds
                : indicator.data.timestamp * 1000; // Convert from seconds

            const tsUtc = new Date(timestamp).toISOString();
            const score = Math.round(indicator.data.score);
            const label = indicator.data.rating;

            await sql`
        insert into indicator_data (indicator_id, ts_utc, value, label)
        values (${indicator.id}, ${tsUtc}, ${score}, ${label})
        on conflict (indicator_id, ts_utc) do nothing
      `;

            results.push({
                indicator_id: indicator.id,
                name: indicator.name,
                ts: tsUtc,
                score,
                label
            });
        }

        return NextResponse.json({
            stored: true,
            count: results.length,
            indicators: results
        });
    } catch (error) {
        console.error('CNN indicators collection error:', error);
        return NextResponse.json({
            error: error instanceof Error ? error.message : 'Failed to collect CNN indicators',
            stored: false
        }, { status: 500 });
    }
}
