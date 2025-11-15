'use client';

import { useRouter } from 'next/navigation';
import type { Stats } from '@/lib/api';

interface SentimentChartProps {
  stats: Stats | null;
}

export function SentimentChart({ stats }: SentimentChartProps) {
  const router = useRouter();

  if (!stats) return null;

  const sentiments = [
    { label: 'Positive', value: stats.positive_percentage, color: 'bg-green-500', count: stats.positive_count, key: 'positive' },
    { label: 'Negative', value: stats.negative_percentage, color: 'bg-red-500', count: stats.negative_count, key: 'negative' },
    { label: 'Neutral', value: stats.neutral_percentage, color: 'bg-gray-500', count: stats.neutral_count, key: 'neutral' },
  ];

  const handleSentimentClick = (sentiment: string) => {
    router.push(`/mentions?sentiment=${sentiment}`);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Sentiment Breakdown</h2>
      
      <div className="space-y-6">
        {sentiments.map((sentiment) => (
          <div 
            key={sentiment.label}
            className="cursor-pointer group"
            onClick={() => handleSentimentClick(sentiment.key)}
          >
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">{sentiment.label}</span>
              <span className="text-sm font-semibold text-gray-900">{sentiment.value}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`${sentiment.color} h-2 rounded-full transition-all duration-300 group-hover:opacity-80`}
                style={{ width: `${sentiment.value}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">{sentiment.count} mentions</p>
          </div>
        ))}
      </div>
    </div>
  );
}
