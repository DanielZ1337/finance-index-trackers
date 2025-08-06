#!/usr/bin/env bun

console.log('🚀 Testing Finance Index Collectors...\n');

const baseUrl = process.env.BASE_URL || 'http://localhost:3000';

const collectors = [
    { name: 'CNN Fear & Greed Index', path: '/api/fgi/collect' },
    { name: 'CNN All Indicators', path: '/api/cnn-indicators/collect' },
    { name: 'Crypto Fear & Greed Index', path: '/api/crypto-fgi/collect' },
    { name: 'VIX Volatility Index', path: '/api/vix/collect' },
];

async function testCollector(collector: { name: string; path: string }) {
    try {
        console.log(`📊 Testing ${collector.name}...`);
        const response = await fetch(`${baseUrl}${collector.path}`);
        const data = await response.json();

        if (response.ok && data.stored) {
            console.log(`✅ ${collector.name}: Success`);
            if (data.count) {
                console.log(`   Indicators collected: ${data.count}`);
            } else {
                console.log(`   Value: ${data.value || data.score}`);
                console.log(`   Label: ${data.label}`);
                console.log(`   Timestamp: ${data.ts}`);
            }
        } else {
            console.log(`❌ ${collector.name}: Failed`);
            console.log(`   Error: ${data.error || 'Unknown error'}`);
        }
    } catch (error) {
        console.log(`❌ ${collector.name}: Network error`);
        console.log(`   ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    console.log('');
}

async function runTests() {
    for (const collector of collectors) {
        await testCollector(collector);
        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('🏁 Testing complete!');
    console.log('💡 Visit http://localhost:3000 to see the collected data in the dashboard.');
}

runTests().catch(console.error);
