import { config } from 'dotenv';

// Load environment variables
config();

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || process.env.BASE_URL || 'http://localhost:3000';

interface CollectorEndpoint {
    name: string;
    endpoint: string;
    description: string;
}

const collectors: CollectorEndpoint[] = [
    {
        name: 'CNN Fear & Greed Index',
        endpoint: '/api/fgi/collect',
        description: 'Collect CNN Fear & Greed Index data'
    },
    {
        name: 'CNN Market Indicators',
        endpoint: '/api/cnn-indicators/collect',
        description: 'Collect CNN market indicators'
    },
    {
        name: 'Crypto Fear & Greed',
        endpoint: '/api/crypto-fgi/collect',
        description: 'Collect crypto fear & greed data'
    },
    {
        name: 'VIX Data',
        endpoint: '/api/vix/collect',
        description: 'Collect VIX volatility data'
    }
];

function logWithTimestamp(message: string) {
    console.log(`[${new Date().toISOString()}] ${message}`);
}

async function callEndpoint(endpoint: string): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
        logWithTimestamp(`🔄 Calling: ${BASE_URL}${endpoint}`);

        const response = await fetch(`${BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'GitHub-Actions-Data-Collection/1.0'
            }
        });

        if (response.ok) {
            const data = await response.json();
            logWithTimestamp(`✅ Success: ${endpoint}`);
            return { success: true, data };
        } else {
            const error = `HTTP ${response.status}: ${response.statusText}`;
            logWithTimestamp(`❌ Failed: ${endpoint} - ${error}`);
            return { success: false, error };
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logWithTimestamp(`❌ Error: ${endpoint} - ${errorMessage}`);
        return { success: false, error: errorMessage };
    }
}

async function runAllCollectors() {
    const startTime = Date.now();
    logWithTimestamp('🚀 Starting data collection run...');
    logWithTimestamp(`🌐 Base URL: ${BASE_URL}`);

    const results: Array<{
        name: string;
        endpoint: string;
        success: boolean;
        data?: any;
        error?: string;
        duration: number;
    }> = [];

    // Run all collectors sequentially with delays
    for (const collector of collectors) {
        const collectorStart = Date.now();
        logWithTimestamp(`📊 Running: ${collector.name}`);

        const result = await callEndpoint(collector.endpoint);
        const collectorDuration = Date.now() - collectorStart;

        results.push({
            name: collector.name,
            endpoint: collector.endpoint,
            success: result.success,
            data: result.data,
            error: result.error,
            duration: collectorDuration
        });

        // Add delay between collectors to avoid overwhelming the server
        if (collector !== collectors[collectors.length - 1]) { // Don't delay after the last one
            logWithTimestamp('⏱️  Waiting 10 seconds...');
            await new Promise(resolve => setTimeout(resolve, 10000));
        }
    }

    const totalDuration = Date.now() - startTime;
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    logWithTimestamp('📊 SUMMARY:');
    logWithTimestamp(`   Total collectors: ${collectors.length}`);
    logWithTimestamp(`   Successful: ${successful}`);
    logWithTimestamp(`   Failed: ${failed}`);
    logWithTimestamp(`   Total duration: ${totalDuration}ms`);

    if (failed > 0) {
        logWithTimestamp('❌ FAILED COLLECTORS:');
        results.filter(r => !r.success).forEach(r => {
            logWithTimestamp(`   - ${r.name}: ${r.error}`);
        });
    }

    // Exit with error code if any collectors failed
    if (failed > 0) {
        process.exit(1);
    }

    logWithTimestamp('✅ All data collection completed successfully!');
    process.exit(0);
}

// Run the collectors
runAllCollectors().catch(error => {
    logWithTimestamp(`💥 Fatal error: ${error.message}`);
    process.exit(1);
});
