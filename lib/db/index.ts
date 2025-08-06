import { drizzle } from 'drizzle-orm/vercel-postgres';
import { drizzle as localDrizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { sql as vercelSql } from '@vercel/postgres';
import * as schema from './schema';

// Check if we're using Vercel Postgres or local PostgreSQL
const isVercelPostgres = process.env.POSTGRES_URL?.includes('neon.tech') ||
    process.env.POSTGRES_URL?.includes('vercel-storage.com');

// Create the appropriate database instance
export const db = isVercelPostgres
    ? drizzle(vercelSql, { schema })
    : localDrizzle(new Pool({
        connectionString: process.env.POSTGRES_URL
    }), { schema });

// Export schema for use in queries
export { schema };
