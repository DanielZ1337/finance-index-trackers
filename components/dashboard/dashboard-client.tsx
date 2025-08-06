'use client';

import { useState } from 'react';
import { useDebounce } from '@uidotdev/usehooks';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SearchFilters } from '@/components/dashboard/search-filters';
import { IndicatorCard } from '@/components/dashboard/indicator-card';
import { IndicatorDetailView } from '@/components/dashboard/indicator-detail-view';
import { useIndicators, useIndicatorDetail, useIndicatorPrefetch } from '@/hooks/use-indicators';
import { Loader2 } from 'lucide-react';
import type {
    IndicatorWithLatestData,
    Indicator,
    IndicatorData,
    SortField,
    SortDirection,
} from '@/types';

interface DashboardClientProps {
    initialIndicators: IndicatorWithLatestData[];
}

export function DashboardClient({ initialIndicators }: DashboardClientProps) {
    // Filters and state - separate immediate input from debounced search
    const [searchInput, setSearchInput] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [sortBy, setSortBy] = useState<SortField>('view_count');
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
    const [selectedIndicatorId, setSelectedIndicatorId] = useState<string | null>(null);

    // Debounce the search input with 300ms delay
    const debouncedSearchQuery = useDebounce(searchInput, 300);

    // React Query hooks - use debounced search query for API calls
    const {
        data: indicators = initialIndicators,
        isLoading: loadingIndicators,
        error: indicatorsError
    } = useIndicators({
        category: selectedCategory,
        search: debouncedSearchQuery, // Use debounced value for API calls
        sortBy,
        sortDir: sortDirection,
    });

    const {
        data: indicatorDetail,
        isLoading: loadingDetail
    } = useIndicatorDetail(selectedIndicatorId);

    const { prefetchIndicatorDetail } = useIndicatorPrefetch();

    // Handlers
    const handleViewDetails = (indicator: IndicatorWithLatestData) => {
        setSelectedIndicatorId(indicator.id);
    };

    const handleCloseDetail = () => {
        setSelectedIndicatorId(null);
    };

    const handleIndicatorHover = (indicatorId: string) => {
        // Prefetch on hover for better UX
        prefetchIndicatorDetail(indicatorId);
    };

    // Filtered indicators for client-side filtering
    const filteredIndicators = indicators.filter(indicator => {
        const matchesSearch = !debouncedSearchQuery ||
            indicator.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
            indicator.description?.toLowerCase().includes(debouncedSearchQuery.toLowerCase());

        const matchesCategory = selectedCategory === 'all' || indicator.category === selectedCategory;

        return matchesSearch && matchesCategory;
    });

    if (indicatorsError) {
        return (
            <div className="text-center py-12">
                <p className="text-destructive">Failed to load indicators. Please try again.</p>
            </div>
        );
    }

    return (
        <>
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

            {loadingIndicators && !indicators.length ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <span className="ml-2">Loading indicators...</span>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredIndicators.map((indicator) => (
                        <div
                            key={indicator.id}
                            onMouseEnter={() => handleIndicatorHover(indicator.id)}
                        >
                            <IndicatorCard
                                indicator={indicator}
                                onViewDetails={handleViewDetails}
                            />
                        </div>
                    ))}
                </div>
            )}

            {selectedIndicatorId && indicatorDetail && (
                <IndicatorDetailView
                    indicator={indicatorDetail.indicator}
                    data={indicatorDetail.data}
                    onClose={handleCloseDetail}
                />
            )}
        </>
    );
}
