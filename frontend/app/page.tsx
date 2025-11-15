// Main dashboard page with state management and data fetching
'use client';

import { useEffect, useState, useCallback } from 'react';
import { MetricCards } from '@/components/metric-cards';
import { TrendsChart } from '@/components/trends-chart';
import { SentimentChart } from '@/components/sentiment-chart';
import { AlertsBanner } from '@/components/alerts-banner';
import { FilterBar } from '@/components/filter-bar';
import { MentionCards } from '@/components/mention-cards';
import { LoadingSpinner } from '@/components/loading-spinner';
import { ErrorMessage } from '@/components/error-message';
import { fetchStats, fetchMentions, fetchTrends, generateMockData, type Stats, type Mention, type TrendData } from '@/lib/api';

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [mentions, setMentions] = useState<Mention[]>([]);
  const [trends, setTrends] = useState<TrendData[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const [activeFilters, setActiveFilters] = useState({
    platform: 'all',
    sentiment: 'all',
  });
  const [page, setPage] = useState(0);

  // Load all data
  const loadAllData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsData, mentionsResponse, trendsData] = await Promise.all([
        fetchStats(),
        fetchMentions({ limit: 20, offset: 0 }),
        fetchTrends(),
      ]);
      setStats(statsData);
      setMentions(mentionsResponse.data);
      setTrends(trendsData);
      setPage(0);
    } catch (err) {
      console.error('Failed to load data:', err);
      setError('Demo mode: Using sample data');
      try {
        const [statsData, mentionsResponse, trendsData] = await Promise.all([
          fetchStats(),
          fetchMentions({ limit: 20, offset: 0 }),
          fetchTrends(),
        ]);
        setStats(statsData);
        setMentions(mentionsResponse.data);
        setTrends(trendsData);
        setError(null);
      } catch (retryErr) {
        console.error('Retry failed:', retryErr);
        setError('Failed to load data. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Load mentions with filters
  const loadMentions = useCallback(async () => {
    try {
      const response = await fetchMentions({
        sentiment: activeFilters.sentiment !== 'all' ? activeFilters.sentiment : undefined,
        limit: 20,
        offset: page * 20,
      });
      setMentions(prev => (page === 0 ? response.data : [...prev, ...response.data]));
    } catch (err) {
      console.error('[v0] Failed to load mentions:', err);
    }
  }, [activeFilters, page]);

  // Initial load
  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Load when filters change
  useEffect(() => {
    if (stats) {
      loadMentions();
    }
  }, [activeFilters, page, loadMentions, stats]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      setIsRefreshing(true);
      try {
        const statsData = await fetchStats();
        if (statsData) {
          setStats(statsData);
        }
      } catch (err) {
        console.error('[v0] Auto-refresh failed:', err);
        // Don't show error to user on auto-refresh, just log it
      } finally {
        setIsRefreshing(false);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = async () => {
    await loadAllData();
  };

  const handleLoadMore = () => {
    setPage(p => p + 1);
  };

  if (loading) return <LoadingSpinner />;
  if (error && !stats) return <ErrorMessage message={error} onRetry={loadAllData} />;

  return (
    <div className="min-h-screen bg-gray-50">
      
      <MetricCards stats={stats} />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-6 py-4">
        <TrendsChart data={trends} />
        <SentimentChart stats={stats} />
      </div>

      {stats?.recent_alerts && stats.recent_alerts.length > 0 && (
        <AlertsBanner alerts={stats.recent_alerts} />
      )}

      <FilterBar activeFilters={activeFilters} onFilterChange={setActiveFilters} />
      
      <div className="px-6 py-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Mentions</h2>
        <MentionCards 
          mentions={mentions}
          onLoadMore={handleLoadMore}
          hasMore={mentions.length % 20 === 0 && mentions.length > 0}
        />
      </div>
    </div>
  );
}
