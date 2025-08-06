'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { SearchFilters } from '@/components/dashboard/search-filters';
import { IndicatorCard } from '@/components/dashboard/indicator-card';
import { IndicatorDetailView } from '@/components/dashboard/indicator-detail-view';
import { AnalyticsOverview } from '@/components/dashboard/analytics-overview';
import { Loader2 } from 'lucide-react';
import type {
  IndicatorWithLatestData,
  Indicator,
  IndicatorData,
  SortField,
  SortDirection
} from '@/types';

export default function DashboardPage() {
  const [indicators, setIndicators] = useState<IndicatorWithLatestData[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [selectedIndicator, setSelectedIndicator] = useState<{
    indicator: Indicator;
    data: IndicatorData[];
  } | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState<SortField>('view_count');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Loading states
  const [loadingIndicators, setLoadingIndicators] = useState(true);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Fetch indicators
  useEffect(() => {
    async function fetchIndicators() {
      setLoadingIndicators(true);
      try {
        const params = new URLSearchParams();
        if (selectedCategory !== 'all') params.set('category', selectedCategory);
        if (searchQuery) params.set('search', searchQuery);
        params.set('sortBy', sortBy);
        params.set('sortDir', sortDirection);

        const response = await fetch(`/api/indicators?${params}`);
        const data = await response.json();
        setIndicators(data);
      } catch (error) {
        console.error('Failed to fetch indicators:', error);
      } finally {
        setLoadingIndicators(false);
      }
    }

    fetchIndicators();
  }, [selectedCategory, searchQuery, sortBy, sortDirection]);

  // Fetch analytics
  useEffect(() => {
    async function fetchAnalytics() {
      setLoadingAnalytics(true);
      try {
        const response = await fetch('/api/analytics');
        const data = await response.json();
        setAnalytics(data);
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setLoadingAnalytics(false);
      }
    }

    fetchAnalytics();
  }, []);

  // Handle indicator detail view
  const handleViewDetails = async (indicator: IndicatorWithLatestData) => {
    setLoadingDetail(true);
    try {
      const response = await fetch(`/api/indicators/${indicator.id}?range=30d`);
      const data = await response.json();
      setSelectedIndicator({
        indicator: data.indicator,
        data: data.data,
      });
    } catch (error) {
      console.error('Failed to fetch indicator details:', error);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleCloseDetail = () => {
    setSelectedIndicator(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-2">
            Finance Index Trackers
          </h1>
          <p className="text-xl text-muted-foreground">
            Monitor market sentiment, volatility, and key financial indicators
          </p>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="indicators" className="space-y-6">
          <TabsList>
            <TabsTrigger value="indicators">All Indicators</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="indicators" className="space-y-6">
            {/* Search and Filters */}
            <Card>
              <CardContent className="p-6">
                <SearchFilters
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
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
                      onViewDetails={handleViewDetails}
                    />
                  ))
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            {loadingAnalytics ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2 text-lg">Loading analytics...</span>
              </div>
            ) : analytics ? (
              <AnalyticsOverview analytics={analytics} />
            ) : (
              <div className="text-center py-12">
                <p className="text-lg text-muted-foreground">
                  Failed to load analytics data.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Detail View Modal */}
        {selectedIndicator && (
          <IndicatorDetailView
            indicator={selectedIndicator.indicator}
            data={selectedIndicator.data}
            onClose={handleCloseDetail}
          />
        )}

        {/* Loading overlay for detail view */}
        {loadingDetail && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 flex items-center justify-center">
            <div className="bg-background p-6 rounded-lg shadow-lg">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
              <p>Loading indicator details...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
