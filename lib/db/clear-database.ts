
import { db } from './index'
import { sql } from 'drizzle-orm'

export async function clearDatabase() {
    console.log('🗑️ Clearing database completely...')

    try {
        // Drop all tables with CASCADE to handle foreign key constraints
        await db.execute(sql`DROP TABLE IF EXISTS "indicator_views" CASCADE`);
        await db.execute(sql`DROP TABLE IF EXISTS "indicator_data" CASCADE`);
        await db.execute(sql`DROP TABLE IF EXISTS "indicators" CASCADE`);
        await db.execute(sql`DROP TABLE IF EXISTS "fgi_hourly" CASCADE`);
        await db.execute(sql`DROP TABLE IF EXISTS "verification" CASCADE`);
        await db.execute(sql`DROP TABLE IF EXISTS "account" CASCADE`);
        await db.execute(sql`DROP TABLE IF EXISTS "session" CASCADE`);
        await db.execute(sql`DROP TABLE IF EXISTS "user" CASCADE`);
        await db.execute(sql`DROP TABLE IF EXISTS "__drizzle_migrations" CASCADE`);

        console.log('✅ All tables dropped')

        // Now recreate all tables by pushing the schema
        console.log('🔨 Recreating tables...')

        // Create the user table first (no dependencies)
        await db.execute(sql`
            CREATE TABLE "user" (
                "id" text PRIMARY KEY NOT NULL,
                "name" text NOT NULL,
                "email" text NOT NULL UNIQUE,
                "emailVerified" boolean DEFAULT false NOT NULL,
                "image" text,
                "createdAt" timestamp DEFAULT now() NOT NULL,
                "updatedAt" timestamp DEFAULT now() NOT NULL
            )
        `);

        // Create session table (depends on user)
        await db.execute(sql`
            CREATE TABLE "session" (
                "id" text PRIMARY KEY NOT NULL,
                "expiresAt" timestamp NOT NULL,
                "token" text NOT NULL UNIQUE,
                "ipAddress" text,
                "userAgent" text,
                "userId" text NOT NULL REFERENCES "user"("id"),
                "createdAt" timestamp DEFAULT now() NOT NULL,
                "updatedAt" timestamp DEFAULT now() NOT NULL
            )
        `);

        // Create account table (depends on user)
        await db.execute(sql`
            CREATE TABLE "account" (
                "id" text PRIMARY KEY NOT NULL,
                "accountId" text NOT NULL,
                "providerId" text NOT NULL,
                "userId" text NOT NULL REFERENCES "user"("id"),
                "accessToken" text,
                "refreshToken" text,
                "idToken" text,
                "expiresAt" timestamp,
                "password" text,
                "scope" text,
                "createdAt" timestamp DEFAULT now() NOT NULL,
                "updatedAt" timestamp DEFAULT now() NOT NULL
            )
        `);

        // Create verification table (no dependencies)
        await db.execute(sql`
            CREATE TABLE "verification" (
                "id" text PRIMARY KEY NOT NULL,
                "identifier" text NOT NULL,
                "value" text NOT NULL,
                "expiresAt" timestamp NOT NULL,
                "createdAt" timestamp DEFAULT now() NOT NULL,
                "updatedAt" timestamp DEFAULT now() NOT NULL
            )
        `);

        // Create indicators table (no dependencies)
        await db.execute(sql`
            CREATE TABLE "indicators" (
                "id" text PRIMARY KEY NOT NULL,
                "name" text NOT NULL,
                "description" text,
                "category" text NOT NULL,
                "source" text NOT NULL,
                "is_active" boolean DEFAULT true,
                "created_at" timestamp with time zone DEFAULT now()
            )
        `);

        // Create indicator_data table (depends on indicators)
        await db.execute(sql`
            CREATE TABLE "indicator_data" (
                "id" serial PRIMARY KEY NOT NULL,
                "indicator_id" text NOT NULL REFERENCES "indicators"("id"),
                "ts_utc" timestamp with time zone NOT NULL,
                "value" decimal NOT NULL,
                "label" text,
                "metadata" jsonb,
                "created_at" timestamp with time zone DEFAULT now()
            )
        `);

        // Create unique constraint and indexes for indicator_data
        await db.execute(sql`
            ALTER TABLE "indicator_data" 
            ADD CONSTRAINT "indicator_data_unique_constraint" 
            UNIQUE("indicator_id", "ts_utc")
        `);

        await db.execute(sql`CREATE INDEX "indicator_data_indicator_idx" ON "indicator_data" ("indicator_id")`);
        await db.execute(sql`CREATE INDEX "indicator_data_time_idx" ON "indicator_data" ("ts_utc")`);

        // Create indicator_views table (depends on indicators)
        await db.execute(sql`
            CREATE TABLE "indicator_views" (
                "id" serial PRIMARY KEY NOT NULL,
                "indicator_id" text NOT NULL REFERENCES "indicators"("id"),
                "viewed_at" timestamp with time zone DEFAULT now(),
                "user_agent" text,
                "ip_hash" text
            )
        `);

        await db.execute(sql`CREATE INDEX "indicator_views_indicator_idx" ON "indicator_views" ("indicator_id")`);
        await db.execute(sql`CREATE INDEX "indicator_views_time_idx" ON "indicator_views" ("viewed_at")`);

        // Create fgi_hourly table (no dependencies)
        await db.execute(sql`
            CREATE TABLE "fgi_hourly" (
                "ts_utc" timestamp with time zone PRIMARY KEY NOT NULL,
                "score" smallint NOT NULL,
                "label" text NOT NULL
            )
        `);

        console.log('✅ All tables recreated successfully!')

    } catch (error) {
        console.error('❌ Error:', error)
        throw error
    }
}

if (require.main === module) {
    (async () => {
        await clearDatabase()
        process.exit(0)
    })()
}