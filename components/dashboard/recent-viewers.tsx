'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Eye, User, RefreshCw } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ViewerInfo {
    id: string;
    viewedAt: string;
    user?: {
        name: string;
    } | null;
    isAuthenticated: boolean;
}

interface RecentViewersProps {
    indicatorId: string;
    className?: string;
}

export function RecentViewers({ indicatorId, className }: RecentViewersProps) {
    const [viewers, setViewers] = useState<ViewerInfo[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchViewers = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/indicators/${indicatorId}/views?limit=10`);

            if (!response.ok) {
                throw new Error('Failed to fetch viewers');
            }

            const data = await response.json();
            setViewers(data.views || []);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load viewers');
            console.error('Failed to fetch viewers:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchViewers();
    }, [indicatorId]);

    const authenticatedViewers = viewers.filter(v => v.isAuthenticated);
    const anonymousCount = viewers.length - authenticatedViewers.length;

    if (loading) {
        return (
            <Card className={className}>
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center space-x-2">
                        <Users className="h-4 w-4" />
                        <span>Recent Viewers</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span>Loading viewers...</span>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card className={className}>
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center space-x-2">
                        <Users className="h-4 w-4" />
                        <span>Recent Viewers</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                            Unable to load viewer information
                        </p>
                        <Button size="sm" variant="outline" onClick={fetchViewers}>
                            Try Again
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className={className}>
            <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4" />
                        <span>Recent Activity</span>
                    </div>
                    <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                        <Eye className="h-3 w-3" />
                        <span>{viewers.length} recent views</span>
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {viewers.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                        No recent activity to display
                    </p>
                ) : (
                    <>
                        {/* Summary */}
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{authenticatedViewers.length} registered users</span>
                            <span>{anonymousCount} anonymous</span>
                        </div>

                        {/* Recent viewers list */}
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                            {viewers.slice(0, 8).map((viewer) => (
                                <div key={viewer.id} className="flex items-center justify-between text-sm">
                                    <div className="flex items-center space-x-2">
                                        {viewer.user ? (
                                            <>
                                                <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">
                                                    {viewer.user.name.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="font-medium truncate max-w-24">
                                                    {viewer.user.name}
                                                </span>
                                                <Badge variant="secondary" className="text-xs px-1 py-0">
                                                    User
                                                </Badge>
                                            </>
                                        ) : (
                                            <>
                                                <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center">
                                                    <User className="h-3 w-3 text-muted-foreground" />
                                                </div>
                                                <span className="text-muted-foreground italic text-xs">
                                                    Anonymous
                                                </span>
                                            </>
                                        )}
                                    </div>
                                    <span className="text-xs text-muted-foreground">
                                        {formatDistanceToNow(new Date(viewer.viewedAt), { addSuffix: true })}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {viewers.length > 8 && (
                            <p className="text-xs text-muted-foreground text-center">
                                +{viewers.length - 8} more views
                            </p>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    );
}
