#!/usr/bin/env bun

/**
 * Seed script to populate the database with initial indicators
 * Run with: bun run seed
 */

import { IndicatorsService } from '@/lib/db/queries';

const initialIndicators = [
    {
        id: 'cnn-fgi',
        name: 'CNN Fear & Greed Index',
        description: 'Market sentiment indicator from CNN',
        category: 'sentiment',
        source: 'CNN',
    },
    {
        id: 'crypto-fgi',
        name: 'Crypto Fear & Greed Index',
        description: 'Cryptocurrency market sentiment',
        category: 'crypto',
        source: 'Alternative.me',
    },
    {
        id: 'warren-buffett',
        name: 'Warren Buffett Indicator',
        description: 'Market cap to GDP ratio',
        category: 'valuation',
        source: 'FRED',
    },
    {
        id: 'vix',
        name: 'VIX Volatility Index',
        description: 'Market volatility and fear gauge',
        category: 'volatility',
        source: 'CBOE',
    },
    {
        id: 'cnn-sp500-momentum',
        name: 'S&P 500 Market Momentum',
        description: 'S&P 500 momentum indicator from CNN',
        category: 'momentum',
        source: 'CNN',
    },
    {
        id: 'cnn-sp125-momentum',
        name: 'S&P 125 Market Momentum',
        description: 'S&P 125 momentum indicator from CNN',
        category: 'momentum',
        source: 'CNN',
    },
    {
        id: 'cnn-stock-strength',
        name: 'Stock Price Strength',
        description: 'Stock price strength indicator from CNN',
        category: 'strength',
        source: 'CNN',
    },
    {
        id: 'cnn-stock-breadth',
        name: 'Stock Price Breadth',
        description: 'Stock price breadth indicator from CNN',
        category: 'breadth',
        source: 'CNN',
    },
    {
        id: 'cnn-put-call',
        name: 'Put-Call Options',
        description: 'Put-call options ratio from CNN',
        category: 'options',
        source: 'CNN',
    },
    {
        id: 'cnn-vix',
        name: 'Market Volatility (VIX)',
        description: 'VIX volatility indicator from CNN',
        category: 'volatility',
        source: 'CNN',
    },
    {
        id: 'cnn-vix50',
        name: 'Market Volatility (VIX50)',
        description: 'VIX50 volatility indicator from CNN',
        category: 'volatility',
        source: 'CNN',
    },
    {
        id: 'cnn-junk-bond',
        name: 'Junk Bond Demand',
        description: 'Junk bond demand indicator from CNN',
        category: 'bonds',
        source: 'CNN',
    },
    {
        id: 'cnn-safe-haven',
        name: 'Safe Haven Demand',
        description: 'Safe haven demand indicator from CNN',
        category: 'safe-haven',
        source: 'CNN',
    },
];

async function main() {
    console.log('🌱 Seeding database with initial indicators...');

    try {
        let seeded = 0;
        let skipped = 0;

        for (const indicator of initialIndicators) {
            try {
                const existing = await IndicatorsService.getIndicatorById(indicator.id);
                if (existing) {
                    console.log(`⏭️  Skipping ${indicator.name} (already exists)`);
                    skipped++;
                    continue;
                }

                await IndicatorsService.createIndicator(indicator);
                console.log(`✅ Created indicator: ${indicator.name}`);
                seeded++;
            } catch (error) {
                console.error(`❌ Failed to create ${indicator.name}:`, error);
            }
        }

        console.log(`\n🎉 Seeding completed!`);
        console.log(`   • ${seeded} indicators created`);
        console.log(`   • ${skipped} indicators skipped (already existed)`);
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
}

main();
