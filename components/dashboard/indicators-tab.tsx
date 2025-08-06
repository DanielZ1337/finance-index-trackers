'use client';

import { Card, CardContent } from '@/components/ui/card';
import { SearchFilters } from '@/components/dashboard/search-filters';
import { IndicatorCard } from '@/components/dashboard/indicator-card';
import { Loader2 } from 'lucide-react';
import type {
    IndicatorWithLatestData,
    SortField,
    SortDirection
} from '@/types';

interface IndicatorsTabProps {
    // Search and filter props
    searchInput: string;
    setSearchInput: (value: string) => void;
    selectedCategory: string;
    setSelectedCategory: (value: string) => void;
    sortBy: SortField;
    setSortBy: (value: SortField) => void;
    sortDirection: SortDirection;
    setSortDirection: (value: SortDirection) => void;

    // Data props
    indicators: IndicatorWithLatestData[];
    loadingIndicators: boolean;
    indicatorsError: any;

    // Handler props
    onViewDetails: (indicator: IndicatorWithLatestData) => void;
}

export function IndicatorsTab({
    searchInput,
    setSearchInput,
    selectedCategory,
    setSelectedCategory,
    sortBy,
    setSortBy,
    sortDirection,
    setSortDirection,
    indicators,
    loadingIndicators,
    indicatorsError,
    onViewDetails,
}: IndicatorsTabProps) {
    return (
        <div className="space-y-6">
            {/* Search and Filters */}
            <Card>
                <CardContent className="p-6">
                    <SearchFilters
                        searchQuery={searchInput}
                        onSearchChange={setSearchInput}
                        selectedCategory={selectedCategory}
                        onCategoryChange={setSelectedCategory}
                        sortBy={sortBy}
                        onSortByChange={setSortBy}
                        sortDirection={sortDirection}
                        onSortDirectionChange={setSortDirection}
                    />
                </CardContent>
            </Card>

            {/* Indicators Grid */}
            {loadingIndicators ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <span className="ml-2 text-lg">Loading indicators...</span>
                </div>
            ) : indicatorsError ? (
                <div className="text-center py-12">
                    <p className="text-lg text-destructive">
                        Failed to load indicators. Please try again.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {indicators.length === 0 ? (
                        <div className="col-span-full text-center py-12">
                            <p className="text-lg text-muted-foreground">
                                No indicators found matching your criteria.
                            </p>
                        </div>
                    ) : (
                        indicators.map((indicator) => (
                            <IndicatorCard
                                key={indicator.id}
                                indicator={indicator}
                                onViewDetails={onViewDetails}
                            />
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
