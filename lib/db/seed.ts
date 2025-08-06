import { db, schema } from '@/lib/db';

const indicators = [
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

export async function seedIndicators() {
    console.log('🌱 Seeding indicators...');

    try {
        for (const indicator of indicators) {
            await db
                .insert(schema.indicators)
                .values(indicator)
                .onConflictDoNothing(); // Don't insert if already exists
        }

        console.log(`✅ Successfully seeded ${indicators.length} indicators`);
    } catch (error) {
        console.error('❌ Error seeding indicators:', error);
        throw error;
    }
}

if (require.main === module) {
    seedIndicators()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error(error);
            process.exit(1);
        });
}
