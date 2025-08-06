import { sql as vercelSql } from '@vercel/postgres';
import { Pool } from 'pg';

// Check if we're using Vercel Postgres or local PostgreSQL
const isVercelPostgres = process.env.POSTGRES_URL?.includes('neon.tech') ||
    process.env.POSTGRES_URL?.includes('vercel-storage.com');

// Create local PostgreSQL pool if not using Vercel
let localPool: Pool | null = null;
if (!isVercelPostgres && process.env.POSTGRES_URL) {
    localPool = new Pool({
        connectionString: process.env.POSTGRES_URL,
    });
}

// Database adapter interface
export interface QueryResult {
    rows: any[];
    rowCount?: number | null;
}

// Unified database interface
export const db = {
    // Template literal query (for simple queries)
    async query(strings: TemplateStringsArray, ...values: any[]): Promise<QueryResult> {
        if (isVercelPostgres) {
            const result = await vercelSql.query(strings.join('?'), values);
            return result;
        }

        if (!localPool) {
            throw new Error('No database connection configured');
        }

        // Convert template literal to parameterized query
        let query = strings[0];
        for (let i = 1; i < strings.length; i++) {
            query += `$${i}` + strings[i];
        }

        const result = await localPool.query(query, values);
        return {
            rows: result.rows,
            rowCount: result.rowCount || 0,
        };
    },

    // Raw query with parameters
    async rawQuery(query: string, params: any[] = []): Promise<QueryResult> {
        if (isVercelPostgres) {
            const result = await vercelSql.query(query, params);
            return result;
        }

        if (!localPool) {
            throw new Error('No database connection configured');
        }

        const result = await localPool.query(query, params);
        return {
            rows: result.rows,
            rowCount: result.rowCount || 0,
        };
    },
};

// For backward compatibility, create a sql template function
export const sql = (strings: TemplateStringsArray, ...values: any[]) => {
    return db.query(strings, ...values);
};

// Add query method to sql for compatibility
sql.query = db.rawQuery;

// Graceful shutdown for local pool
if (localPool) {
    process.on('SIGINT', () => {
        localPool?.end();
    });

    process.on('SIGTERM', () => {
        localPool?.end();
    });
}
