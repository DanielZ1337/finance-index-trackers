#!/usr/bin/env bun

import cron from 'node-cron';

console.log('🚀 Starting local cron scheduler...');
console.log('⏰ Collectors will run every hour at minute 0');
console.log('🛑 Press Ctrl+C to stop\n');

const baseUrl = process.env.BASE_URL || 'http://localhost:3000';

const collectors = [
    { name: 'CNN Fear & Greed Index', path: '/api/fgi/collect' },
    { name: 'Crypto Fear & Greed Index', path: '/api/crypto-fgi/collect' },
    { name: 'VIX Volatility Index', path: '/api/vix/collect' },
];

async function runCollector(collector: { name: string; path: string }) {
    try {
        console.log(`📊 [${new Date().toISOString()}] Running ${collector.name}...`);
        const response = await fetch(`${baseUrl}${collector.path}`);
        const data = await response.json();

        if (response.ok && data.stored) {
            console.log(`✅ ${collector.name}: Success (Value: ${data.value || data.score})`);
        } else {
            console.log(`❌ ${collector.name}: Failed - ${data.error || 'Unknown error'}`);
        }
    } catch (error) {
        console.log(`❌ ${collector.name}: Network error - ${error instanceof Error ? error.message : 'Unknown'}`);
    }
}

async function runAllCollectors() {
    console.log(`\n🔄 [${new Date().toISOString()}] Starting hourly collection cycle...\n`);

    for (const collector of collectors) {
        await runCollector(collector);
        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log(`\n✅ Collection cycle complete. Next run in 1 hour.\n`);
}

// Run immediately on start
runAllCollectors();

// Schedule to run every hour at minute 0 (same as vercel.json)
cron.schedule('0 * * * *', runAllCollectors);

// For testing, you can also run every minute with:
// cron.schedule('* * * * *', runAllCollectors);

// Keep the process running
process.on('SIGINT', () => {
    console.log('\n👋 Stopping cron scheduler...');
    process.exit(0);
});
