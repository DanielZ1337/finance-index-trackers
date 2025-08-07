import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { multiSession } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/lib/db";

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg", // PostgreSQL
    }),
    emailAndPassword: {
        enabled: true,
    },
    socialProviders: {
        github: {
            clientId: process.env.GITHUB_CLIENT_ID as string,
            clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
        },
    },
    session: {
        expiresIn: 60 * 60 * 24 * 7, // 7 days
        updateAge: 60 * 60 * 24, // 1 day (session will be updated if user is active after 1 day)
    },
    rateLimit: {
        enabled: true,
        window: 60, // 1 minute window
        max: 100, // 100 requests per window
        storage: "memory", // Use memory storage for rate limiting
    },
    advanced: {
        crossSubDomainCookies: {
            enabled: false,
        },
        useSecureCookies: process.env.NODE_ENV === "production",
        ipAddress: {
            ipAddressHeaders: ["x-forwarded-for", "x-real-ip", "cf-connecting-ip", "x-client-ip"],
            disableIpTracking: false
        },
        database: {
            generateId: () => crypto.randomUUID(),
        },
    },
    plugins: [
        multiSession(),
        nextCookies(), // Must be last plugin for proper cookie handling
    ],
});