import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { db } from '@/lib/db';
import { schema } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { UAParser } from 'ua-parser-js';

export async function GET() {
    try {
        // Get current session to verify authentication
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Query all sessions for the current user from database
        const userSessions = await db
            .select()
            .from(schema.session)
            .where(eq(schema.session.userId, session.user.id));

        // Get current session token to mark it
        const currentSessionToken = session.session?.token;

        // Format sessions with device information
        const formattedSessions = userSessions.map((dbSession) => {
            let deviceInfo = {
                type: 'desktop',
                browser: 'Unknown',
                os: 'Unknown',
            };

            // Parse user agent if available
            if (dbSession.userAgent) {
                try {
                    let userAgentData;
                    if (typeof dbSession.userAgent === 'string') {
                        // If it's a JSON string, parse it
                        if (dbSession.userAgent.startsWith('{')) {
                            userAgentData = JSON.parse(dbSession.userAgent);
                            deviceInfo = {
                                type: userAgentData.device || 'desktop',
                                browser: userAgentData.browser || 'Unknown',
                                os: userAgentData.os || 'Unknown',
                            };
                        } else {
                            // If it's a raw user agent string, parse it
                            const parser = new UAParser(dbSession.userAgent);
                            const result = parser.getResult();
                            deviceInfo = {
                                type: result.device.type || 'desktop',
                                browser: `${result.browser.name || 'Unknown'} ${result.browser.version || ''}`.trim(),
                                os: `${result.os.name || 'Unknown'} ${result.os.version || ''}`.trim(),
                            };
                        }
                    }
                } catch (e) {
                    console.warn('Failed to parse user agent:', e);
                }
            }

            return {
                id: dbSession.id,
                token: dbSession.token,
                userId: dbSession.userId,
                createdAt: dbSession.createdAt,
                updatedAt: dbSession.updatedAt,
                expiresAt: dbSession.expiresAt,
                userAgent: dbSession.userAgent,
                ipAddress: dbSession.ipAddress,
                isCurrent: dbSession.token === currentSessionToken,
                device: deviceInfo,
            };
        });

        // Sort sessions with current session first, then by most recent
        formattedSessions.sort((a, b) => {
            if (a.isCurrent && !b.isCurrent) return -1;
            if (!a.isCurrent && b.isCurrent) return 1;
            return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        });

        return NextResponse.json({
            sessions: formattedSessions,
            total: formattedSessions.length,
        });
    } catch (error) {
        console.error('Error fetching user sessions:', error);
        return NextResponse.json(
            { error: 'Failed to fetch sessions' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { sessionToken } = await request.json();

        if (!sessionToken) {
            return NextResponse.json({ error: 'Session token is required' }, { status: 400 });
        }

        // Get current session to verify authentication
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Verify the session belongs to the current user
        const targetSession = await db
            .select()
            .from(schema.session)
            .where(eq(schema.session.token, sessionToken))
            .limit(1);

        if (!targetSession.length || targetSession[0].userId !== session.user.id) {
            return NextResponse.json({ error: 'Session not found or unauthorized' }, { status: 404 });
        }

        // Don't allow revoking current session via this endpoint
        if (sessionToken === session.session?.token) {
            return NextResponse.json({ error: 'Cannot revoke current session' }, { status: 400 });
        }

        // Delete the session
        await db
            .delete(schema.session)
            .where(eq(schema.session.token, sessionToken));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error revoking session:', error);
        return NextResponse.json(
            { error: 'Failed to revoke session' },
            { status: 500 }
        );
    }
}
