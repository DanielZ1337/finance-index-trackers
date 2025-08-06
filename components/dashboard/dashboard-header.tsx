'use client';

import { ThemeToggle } from '@/components/theme-toggle';
import { AuthButton } from '@/components/auth';

export function DashboardHeader() {
    return (
        <div className="mb-8 flex items-center justify-between">
            <div>
                <h1 className="text-4xl font-bold tracking-tight mb-2">
                    Finance Index Trackers
                </h1>
                <p className="text-xl text-muted-foreground">
                    Monitor market sentiment, volatility, and key financial indicators
                </p>
            </div>
            <div className="flex items-center gap-2">
                <AuthButton />
                <ThemeToggle />
            </div>
        </div>
    );
}
