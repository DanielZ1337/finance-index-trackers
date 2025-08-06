'use client';

import { useState } from 'react';
import { useDebounce } from '@uidotdev/usehooks';
import { useIndicators, useIndicatorDetail, useAnalytics } from '@/hooks/use-indicators';
import type {
    IndicatorWithLatestData,
    SortField,
    SortDirection
} from '@/types';

export function useDashboard() {
    // State management
    const [selectedIndicatorId, setSelectedIndicatorId] = useState<string | null>(null);
    const [searchInput, setSearchInput] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [sortBy, setSortBy] = useState<SortField>('view_count');
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

    // Debounce the search input with 300ms delay
    const debouncedSearchQuery = useDebounce(searchInput, 300);

    // React Query hooks
    const {
        data: indicators = [],
        isLoading: loadingIndicators,
        error: indicatorsError
    } = useIndicators({
        category: selectedCategory,
        search: debouncedSearchQuery,
        sortBy,
        sortDir: sortDirection,
    });

    const { data: analytics, isLoading: loadingAnalytics } = useAnalytics();

    const {
        data: indicatorDetail,
        isLoading: loadingDetail
    } = useIndicatorDetail(selectedIndicatorId);

    // Event handlers
    const handleViewDetails = (indicator: IndicatorWithLatestData) => {
        setSelectedIndicatorId(indicator.id);
    };

    const handleCloseDetail = () => {
        setSelectedIndicatorId(null);
    };

    // Computed values
    const selectedIndicator = indicatorDetail ? {
        indicator: indicatorDetail.indicator,
        data: indicatorDetail.data,
    } : null;

    return {
        // State
        selectedIndicatorId,
        searchInput,
        setSearchInput,
        selectedCategory,
        setSelectedCategory,
        sortBy,
        setSortBy,
        sortDirection,
        setSortDirection,

        // Data
        indicators,
        loadingIndicators,
        indicatorsError,
        analytics,
        loadingAnalytics,
        selectedIndicator,
        loadingDetail,

        // Handlers
        handleViewDetails,
        handleCloseDetail,
    };
}
