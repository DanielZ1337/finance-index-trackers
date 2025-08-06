#!/usr/bin/env bun

/**
 * Migration script to apply Drizzle migrations to the database
 * Run with: bun run migrate
 */

import { migrate } from 'drizzle-orm/vercel-postgres/migrator';
import { drizzle } from 'drizzle-orm/vercel-postgres';
import { drizzle as localDrizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { sql as vercelSql } from '@vercel/postgres';

async function main() {
    console.log('🚀 Starting database migration...');

    try {
        // Check if we're using Vercel Postgres or local PostgreSQL
        const isVercelPostgres = process.env.POSTGRES_URL?.includes('neon.tech') ||
            process.env.POSTGRES_URL?.includes('vercel-storage.com');

        const db = isVercelPostgres
            ? drizzle(vercelSql)
            : localDrizzle(new Pool({
                connectionString: process.env.POSTGRES_URL
            }));

        console.log(`📊 Using ${isVercelPostgres ? 'Vercel Postgres' : 'Local PostgreSQL'}`);

        await migrate(db, {
            migrationsFolder: './lib/db/migrations'
        });

        console.log('✅ Database migration completed successfully!');
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

main();
