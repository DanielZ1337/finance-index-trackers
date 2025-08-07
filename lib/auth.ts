import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { multiSession } from "better-auth/plugins";
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
    advanced: {
        generateId: () => crypto.randomUUID(),
        crossSubDomainCookies: {
            enabled: false,
        },
        useSecureCookies: process.env.NODE_ENV === "production",
        getIP: (request: Request) => {
            // Better IP detection for various hosting environments
            const forwarded = request.headers.get('x-forwarded-for');
            const realIp = request.headers.get('x-real-ip');
            const cfConnectingIp = request.headers.get('cf-connecting-ip');
            const remoteAddr = request.headers.get('remote-addr');

            // Priority order: CF-Connecting-IP > X-Real-IP > X-Forwarded-For > Remote-Addr
            const ip = cfConnectingIp ||
                realIp ||
                forwarded?.split(',')[0]?.trim() ||
                remoteAddr ||
                'unknown';

            return ip;
        },
    },
    plugins: [
        multiSession(),
    ],
});
