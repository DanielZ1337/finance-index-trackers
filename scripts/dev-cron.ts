#!/usr/bin/env bun

import cron from 'node-cron';
import { readFile } from 'fs/promises';
import { join } from 'path';
import type { CollectorsConfigFile, CollectorConfig, CollectionResult } from '../config/types';

console.log('🚀 Starting local cron scheduler...');
console.log('⏰ Collectors will run every hour at minute 0');
console.log('🛑 Press Ctrl+C to stop\n');

const baseUrl = process.env.BASE_URL || 'http://localhost:3000';

// Load collector configuration
async function loadConfig(): Promise<CollectorsConfigFile> {
    try {
        const configPath = join(process.cwd(), 'config', 'collectors.json');
        const configContent = await readFile(configPath, 'utf-8');
        return JSON.parse(configContent);
    } catch (error) {
        console.error('Failed to load collector config:', error);
        // Fallback config
        return {
            collectors: [
                {
                    id: 'cnn-fgi',
                    name: 'CNN Fear & Greed Index',
                    description: 'Market sentiment indicator from CNN',
                    endpoint: '/api/fgi/collect',
                    enabled: true,
                    category: 'sentiment',
                    source: 'CNN',
                    frequency: 'hourly'
                },
                {
                    id: 'crypto-fgi',
                    name: 'Crypto Fear & Greed Index',
                    description: 'Cryptocurrency market sentiment',
                    endpoint: '/api/crypto-fgi/collect',
                    enabled: true,
                    category: 'crypto',
                    source: 'Alternative.me',
                    frequency: 'hourly'
                },
                {
                    id: 'vix',
                    name: 'VIX Volatility Index',
                    description: 'Market volatility and fear gauge',
                    endpoint: '/api/vix/collect',
                    enabled: true,
                    category: 'volatility',
                    source: 'CBOE',
                    frequency: 'hourly'
                },
                {
                    id: 'cnn-indicators',
                    name: 'CNN Market Indicators',
                    description: 'Multiple CNN market indicators',
                    endpoint: '/api/cnn-indicators/collect',
                    enabled: true,
                    category: 'multi',
                    source: 'CNN',
                    frequency: 'hourly'
                }
            ],
            settings: {
                defaultFrequency: 'hourly',
                requestDelay: 1000,
                timeout: 30000,
                retries: 2
            }
        };
    }
}

// Initialize configuration
const config = await loadConfig();
const enabledCollectors = config.collectors.filter(c => c.enabled && c.frequency === 'hourly');

console.log(`📋 Loaded ${enabledCollectors.length} enabled collectors:`);
enabledCollectors.forEach(collector => {
    console.log(`   • ${collector.name} (${collector.endpoint}) [${collector.source}]`);
});
console.log('');

async function runCollector(collector: CollectorConfig): Promise<CollectionResult> {
    console.log(`🔄 Running ${collector.name}...`);

    try {
        const start = Date.now();
        const response = await fetch(`${baseUrl}${collector.endpoint}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            signal: AbortSignal.timeout(config.settings.timeout)
        });

        const duration = Date.now() - start;
        const result = await response.json() as any;

        if (!response.ok) {
            return {
                success: false,
                collectorId: collector.id,
                name: collector.name,
                timestamp: new Date().toISOString(),
                error: `HTTP ${response.status}: ${result?.error || 'Unknown error'}`,
                duration
            };
        }

        console.log(`✅ ${collector.name} completed in ${duration}ms`);
        return {
            success: true,
            collectorId: collector.id,
            name: collector.name,
            timestamp: new Date().toISOString(),
            duration,
            // Include data from the API response
            ...result
        };

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.log(`❌ ${collector.name} failed: ${errorMessage}`);

        return {
            success: false,
            collectorId: collector.id,
            name: collector.name,
            timestamp: new Date().toISOString(),
            error: errorMessage,
            duration: 0
        };
    }
}

async function runAllCollectors(): Promise<void> {
    console.log(`🚀 Starting collection run at ${new Date().toLocaleString()}`);
    console.log('─'.repeat(50));

    const results: CollectionResult[] = [];

    for (const collector of enabledCollectors) {
        const result = await runCollector(collector);
        results.push(result);

        // Add delay between collectors to avoid overwhelming services
        if (config.settings.requestDelay > 0 && collector !== enabledCollectors[enabledCollectors.length - 1]) {
            await new Promise(resolve => setTimeout(resolve, config.settings.requestDelay));
        }
    }

    // Summary
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    const totalTime = results.reduce((sum, r) => sum + (r.duration || 0), 0);

    console.log('─'.repeat(50));
    console.log(`📊 Collection Summary:`);
    console.log(`   ✅ Successful: ${successful}`);
    console.log(`   ❌ Failed: ${failed}`);
    console.log(`   ⏱️  Total time: ${totalTime}ms`);

    if (failed > 0) {
        console.log(`\n❌ Failed collectors:`);
        results
            .filter(r => !r.success)
            .forEach(r => {
                console.log(`   • ${r.name}: ${r.error}`);
            });
    }

    console.log(`\n⏰ Next run at ${new Date(Date.now() + 60 * 60 * 1000).toLocaleString()}`);
    console.log('');
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
