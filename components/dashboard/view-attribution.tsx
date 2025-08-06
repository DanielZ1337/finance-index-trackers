import { User, Users, Eye, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { formatDistanceToNow } from 'date-fns';
import { useIndicatorViews } from '@/hooks/use-indicator-views';

interface ViewUser {
    id: string;
    name: string;
    // Don't expose email for privacy
}

interface ViewAttribution {
    id: string;
    viewedAt: string;
    user?: ViewUser | null;
    isAuthenticated: boolean;
}

interface ViewAttributionProps {
    views: ViewAttribution[];
    totalViews: number;
    showDetailed?: boolean;
}

export function ViewAttribution({ views, totalViews, showDetailed = false }: ViewAttributionProps) {
    const authenticatedViews = views.filter(view => view.isAuthenticated);
    const anonymousViewCount = totalViews - authenticatedViews.length;

    // Get unique users (most recent view per user)
    const uniqueUsers = authenticatedViews.reduce((acc, view) => {
        if (!view.user) return acc;

        const existingUser = acc.find(u => u.user?.id === view.user?.id);
        if (!existingUser || new Date(view.viewedAt) > new Date(existingUser.viewedAt)) {
            return [...acc.filter(u => u.user?.id !== view.user?.id), view];
        }
        return acc;
    }, [] as ViewAttribution[]);

    if (!showDetailed) {
        // Simple summary view for cards
        return (
            <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center space-x-2">
                    <Eye className="h-3 w-3" />
                    <span>{totalViews} views</span>
                    {uniqueUsers.length > 0 && (
                        <div className="flex items-center space-x-1">
                            <Users className="h-3 w-3" />
                            <span>{uniqueUsers.length} users</span>
                        </div>
                    )}
                </div>
                {anonymousViewCount > 0 && (
                    <span className="text-muted-foreground/70">
                        +{anonymousViewCount} anonymous
                    </span>
                )}
            </div>
        );
    }

    // Detailed view for modal/expanded view
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">View Activity</h4>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Eye className="h-4 w-4" />
                    <span>{totalViews} total views</span>
                </div>
            </div>

            {/* Authenticated Users */}
            {uniqueUsers.length > 0 && (
                <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Viewed by {uniqueUsers.length} users</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {uniqueUsers.slice(0, 8).map((view) => (
                            <TooltipProvider key={view.id}>
                                <Tooltip>
                                    <TooltipTrigger>
                                        <div className="flex items-center space-x-2 bg-muted rounded-full px-3 py-1">
                                            <div className="h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">
                                                {view.user?.name.charAt(0).toUpperCase() || 'U'}
                                            </div>
                                            <span className="text-xs font-medium truncate max-w-20">
                                                {view.user?.name || 'Anonymous'}
                                            </span>
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <div className="text-xs">
                                            <p className="font-medium">{view.user?.name}</p>
                                            <p className="text-muted-foreground">
                                                Viewed {formatDistanceToNow(new Date(view.viewedAt), { addSuffix: true })}
                                            </p>
                                        </div>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        ))}
                        {uniqueUsers.length > 8 && (
                            <Badge variant="secondary" className="text-xs">
                                +{uniqueUsers.length - 8} more
                            </Badge>
                        )}
                    </div>
                </div>
            )}

            {/* Anonymous Views */}
            {anonymousViewCount > 0 && (
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span>{anonymousViewCount} anonymous views</span>
                </div>
            )}

            {/* Recent Activity */}
            {views.length > 0 && (
                <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Recent Activity</span>
                    </div>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                        {views.slice(0, 5).map((view) => (
                            <div key={view.id} className="flex items-center justify-between text-xs text-muted-foreground">
                                <div className="flex items-center space-x-2">
                                    {view.user ? (
                                        <>
                                            <div className="h-4 w-4 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">
                                                {view.user.name.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="font-medium">{view.user.name}</span>
                                        </>
                                    ) : (
                                        <>
                                            <User className="h-4 w-4" />
                                            <span className="italic">Anonymous user</span>
                                        </>
                                    )}
                                </div>
                                <span>{formatDistanceToNow(new Date(view.viewedAt), { addSuffix: true })}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

// Hook to get user attribution data for an indicator
export function useIndicatorAttribution(indicatorId: string) {
    const { getViews } = useIndicatorViews(indicatorId, 20, 0);

    return {
        getAttribution: getViews,
    };
}
