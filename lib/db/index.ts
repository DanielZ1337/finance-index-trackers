import { drizzle } from "drizzle-orm/neon-http";
import { drizzle as localDrizzle } from "drizzle-orm/node-postgres";
import { neon } from "@neondatabase/serverless";
import { Pool } from "pg";
import { config } from "dotenv";
import * as schema from './schema';

config({ path: ".env.local" }); // Load .env.local
config(); // Fallback to .env

// Check if we're in development mode or using a local database
const isDevelopment = process.env.NODE_ENV === "development";
const isNeonDatabase = process.env.POSTGRES_URL?.includes("neon.tech") ||
    process.env.POSTGRES_URL?.includes("neon.database");

// Use appropriate adapter based on environment
export const db = isDevelopment && !isNeonDatabase
    ? localDrizzle(new Pool({ connectionString: process.env.POSTGRES_URL }), { schema })
    : drizzle({ client: neon(process.env.POSTGRES_URL!), schema });

// Export schema for use in queries
export { schema };
