'use client';

import { Loader2 } from 'lucide-react';

interface LoadingOverlayProps {
    isVisible: boolean;
    message?: string;
}

export function LoadingOverlay({
    isVisible,
    message = "Loading..."
}: LoadingOverlayProps) {
    if (!isVisible) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 flex items-center justify-center">
            <div className="bg-background p-6 rounded-lg shadow-lg border">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                <p className="text-center text-muted-foreground">{message}</p>
            </div>
        </div>
    );
}
