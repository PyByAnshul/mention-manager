// Metric cards showing statistics
'use client';

import type { Stats } from '@/lib/api';

interface MetricCardsProps {
  stats: Stats | null;
}

const METRIC_COLORS = {
  total: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', icon: '📊' },
  positive: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', icon: '😊' },
  negative: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', icon: '😟' },
  neutral: { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-700', icon: '😐' },
};

export function MetricCards({ stats }: MetricCardsProps) {
  const metrics = [
    { key: 'total', label: 'Total Mentions', value: stats?.total_mentions || 0, color: METRIC_COLORS.total },
    { key: 'positive', label: 'Positive', value: `${stats?.positive_percentage || 0}%`, color: METRIC_COLORS.positive },
    { key: 'negative', label: 'Negative', value: `${stats?.negative_percentage || 0}%`, color: METRIC_COLORS.negative },
    { key: 'neutral', label: 'Neutral', value: `${stats?.neutral_percentage || 0}%`, color: METRIC_COLORS.neutral },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 px-6 py-4">
      {metrics.map((metric) => (
        <div
          key={metric.key}
          className={`${metric.color.bg} border-l-4 ${metric.color.border} rounded-lg p-4 hover:shadow-md transition-shadow`}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-2">{metric.label}</p>
              <p className={`text-3xl font-bold ${metric.color.text}`}>{metric.value}</p>
            </div>
            <span className="text-2xl">{metric.color.icon}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
