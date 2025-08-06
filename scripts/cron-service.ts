import * as cron from 'node-cron';
import { config } from 'dotenv';

// Load environment variables
config();

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

interface CronJob {
    name: string;
    schedule: string;
    endpoint: string;
    description: string;
}

const cronJobs: CronJob[] = [
    {
        name: 'CNN Fear & Greed Index',
        schedule: '0 */2 * * *', // Every 2 hours
        endpoint: '/api/fgi/collect',
        description: 'Collect CNN Fear & Greed Index data'
    },
    {
        name: 'CNN Market Indicators',
        schedule: '15 */2 * * *', // Every 2 hours at 15 minutes past
        endpoint: '/api/cnn-indicators/collect',
        description: 'Collect CNN market indicators'
    },
    {
        name: 'Crypto Fear & Greed',
        schedule: '30 */2 * * *', // Every 2 hours at 30 minutes past
        endpoint: '/api/crypto-fgi/collect',
        description: 'Collect crypto fear & greed data'
    },
    {
        name: 'VIX Data',
        schedule: '45 */2 * * *', // Every 2 hours at 45 minutes past
        endpoint: '/api/vix/collect',
        description: 'Collect VIX volatility data'
    }
];

function logWithTimestamp(message: string) {
    console.log(`[${new Date().toISOString()}] ${message}`);
}

async function callEndpoint(endpoint: string): Promise<boolean> {
    try {
        const response = await fetch(`${BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Internal-Cron-Service/1.0'
            }
        });

        if (response.ok) {
            const data = await response.json();
            logWithTimestamp(`✅ ${endpoint} - Success: ${JSON.stringify(data)}`);
            return true;
        } else {
            logWithTimestamp(`❌ ${endpoint} - Failed: ${response.status} ${response.statusText}`);
            return false;
        }
    } catch (error) {
        logWithTimestamp(`❌ ${endpoint} - Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        return false;
    }
}

function startCronJobs() {
    logWithTimestamp('🚀 Starting internal cron service...');

    const activeTasks: any[] = [];

    cronJobs.forEach(job => {
        logWithTimestamp(`📅 Scheduling: ${job.name} - ${job.schedule}`);

        const task = cron.schedule(job.schedule, async () => {
            logWithTimestamp(`🔄 Running: ${job.name}`);
            await callEndpoint(job.endpoint);
        }, {
            timezone: "UTC"
        });

        activeTasks.push(task);
    });

    logWithTimestamp(`✅ All ${cronJobs.length} cron jobs scheduled successfully!`);

    return activeTasks;
}

// Start the cron service
const tasks = startCronJobs();

// Graceful shutdown
process.on('SIGINT', () => {
    logWithTimestamp('📴 Shutting down cron service...');
    tasks.forEach(task => task.destroy());
    process.exit(0);
});

process.on('SIGTERM', () => {
    logWithTimestamp('📴 Shutting down cron service...');
    tasks.forEach(task => task.destroy());
    process.exit(0);
});

// Keep the process alive
process.stdin.resume();
