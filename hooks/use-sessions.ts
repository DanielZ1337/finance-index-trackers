'use client';

import { useState, useEffect } from 'react';
import { UAParser } from 'ua-parser-js';

export interface DeviceSession {
    id: string;
    token: string;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
    expiresAt: Date;
    userAgent?: string;
    ipAddress?: string;
    isCurrent: boolean;
    device?: {
        type: string;
        browser: string;
        os: string;
    };
}

export function useSessions() {
    const [sessions, setSessions] = useState<DeviceSession[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchSessions = async () => {
        try {
            setLoading(true);
            setError(null);

            // Use our custom API endpoint to get all sessions
            const response = await fetch('/api/sessions');

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            // Set sessions from our API response
            setSessions(data.sessions || []);
        } catch (err) {
            console.error('Failed to fetch sessions:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch sessions');
        } finally {
            setLoading(false);
        }
    };

    const revokeSession = async (sessionToken: string) => {
        try {
            const response = await fetch('/api/sessions', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ sessionToken }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to revoke session');
            }

            // Remove from local state
            setSessions(prev => prev.filter(session => session.token !== sessionToken));

            return { success: true };
        } catch (err) {
            console.error('Failed to revoke session:', err);
            return {
                success: false,
                error: err instanceof Error ? err.message : 'Failed to revoke session'
            };
        }
    };

    const revokeAllOtherSessions = async () => {
        try {
            // Get all other sessions (not current)
            const otherSessions = sessions.filter(session => !session.isCurrent);

            if (otherSessions.length === 0) {
                return { success: true };
            }

            // Revoke all other sessions
            const promises = otherSessions.map(async (session) => {
                const response = await fetch('/api/sessions', {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ sessionToken: session.token }),
                });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.error || 'Failed to revoke session');
                }

                return response.json();
            });

            await Promise.all(promises);

            // Update local state to only show current session
            setSessions(prev => prev.filter(session => session.isCurrent));

            return { success: true };
        } catch (err) {
            console.error('Failed to revoke all sessions:', err);
            return {
                success: false,
                error: err instanceof Error ? err.message : 'Failed to revoke all sessions'
            };
        }
    };

    useEffect(() => {
        fetchSessions();
    }, []);

    return {
        sessions,
        loading,
        error,
        refetch: fetchSessions,
        revokeSession,
        revokeAllOtherSessions,
    };
}
