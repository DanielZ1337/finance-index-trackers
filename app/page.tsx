'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoadingOverlay } from '@/components/ui/loading-overlay';
import { AuthenticatedLayout } from '@/components/authenticated-layout';
import { useSession } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, BarChart3, Users, Activity } from 'lucide-react';
import Link from 'next/link';
import {
  DashboardHeader,
  IndicatorsTab,
  AnalyticsTab,
  IndicatorDetailModal,
} from '@/components/dashboard';
import { useDashboard } from '@/hooks/use-dashboard';

export default function DashboardPage() {
  const { data: session, isPending } = useSession();

  const {
    // State
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
  } = useDashboard();

  // Show landing page for non-authenticated users
  if (!isPending && !session) {
    return (
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="container mx-auto px-4 py-16 lg:py-24">
            <div className="text-center space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl font-bold tracking-tight lg:text-6xl">
                  Finance Index Tracker
                </h1>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                  Track and analyze financial indices with comprehensive data insights,
                  real-time updates, and powerful analytics tools.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg">
                  <Link href="/sign-in">Get Started</Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link href="/sign-up">Sign Up</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose Our Platform?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Get comprehensive insights into financial markets with our advanced tracking and analytics tools.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="text-center">
                <TrendingUp className="h-12 w-12 mx-auto text-primary mb-4" />
                <CardTitle>Real-time Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Monitor financial indices with live data updates and real-time price movements.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <BarChart3 className="h-12 w-12 mx-auto text-primary mb-4" />
                <CardTitle>Advanced Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Comprehensive analytics with charts, trends, and detailed performance metrics.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <Users className="h-12 w-12 mx-auto text-primary mb-4" />
                <CardTitle>User Management</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Secure authentication with profile management and personalized settings.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <Activity className="h-12 w-12 mx-auto text-primary mb-4" />
                <CardTitle>Performance Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Deep insights into market performance with historical data and predictions.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-muted/50 py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of users who trust our platform for their financial tracking needs.
            </p>
            <Button asChild size="lg">
              <Link href="/sign-up">Create Your Account</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show dashboard for authenticated users
  return (
    <AuthenticatedLayout title="Dashboard">
      <div className="container mx-auto px-4 py-8">
        <DashboardHeader />

        {/* Main Content */}
        <Tabs defaultValue="indicators" className="space-y-6">
          <TabsList>
            <TabsTrigger value="indicators">All Indicators</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="indicators">
            <IndicatorsTab
              searchInput={searchInput}
              setSearchInput={setSearchInput}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              sortBy={sortBy}
              setSortBy={setSortBy}
              sortDirection={sortDirection}
              setSortDirection={setSortDirection}
              indicators={indicators}
              loadingIndicators={loadingIndicators}
              indicatorsError={indicatorsError}
              onViewDetails={handleViewDetails}
            />
          </TabsContent>

          <TabsContent value="analytics">
            <AnalyticsTab
              analytics={analytics}
              loadingAnalytics={loadingAnalytics}
            />
          </TabsContent>
        </Tabs>

        {/* Detail View Modal */}
        <IndicatorDetailModal
          indicator={selectedIndicator?.indicator || null}
          data={selectedIndicator?.data || null}
          onClose={handleCloseDetail}
        />

        {/* Loading overlay for detail view */}
        <LoadingOverlay
          isVisible={loadingDetail}
          message="Loading indicator details..."
        />
      </div>
    </AuthenticatedLayout>
  );
}
