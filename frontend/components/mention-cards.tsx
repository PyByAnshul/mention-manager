// Individual mention cards with platform and sentiment badges
'use client';

import { ExternalLink } from 'lucide-react';
import type { Mention } from '@/lib/api';

interface MentionCardsProps {
  mentions: Mention[];
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoading?: boolean;
}

const PLATFORM_COLORS = {
  Twitter: { bg: 'bg-blue-100', text: 'text-blue-800', icon: '🐦' },
  Reddit: { bg: 'bg-orange-100', text: 'text-orange-800', icon: '👽' },
  News: { bg: 'bg-purple-100', text: 'text-purple-800', icon: '📰' },
};

const SENTIMENT_COLORS = {
  positive: { bg: 'bg-green-100', text: 'text-green-800', icon: '😊' },
  negative: { bg: 'bg-red-100', text: 'text-red-800', icon: '😟' },
  neutral: { bg: 'bg-gray-100', text: 'text-gray-800', icon: '😐' },
};

function formatTimeAgo(date: string): string {
  const now = new Date();
  const then = new Date(date);
  const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);

  if (seconds < 60) return 'now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export function MentionCards({ mentions, onLoadMore, hasMore = false, isLoading = false }: MentionCardsProps) {
  if (!mentions || mentions.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg">No mentions found</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {mentions.map((mention, index) => {
        const platformColor = PLATFORM_COLORS[mention.platform as keyof typeof PLATFORM_COLORS] || 
          { bg: 'bg-gray-100', text: 'text-gray-800', icon: '📱' };
        const sentimentColor = SENTIMENT_COLORS[mention.sentiment as keyof typeof SENTIMENT_COLORS] || 
          { bg: 'bg-gray-100', text: 'text-gray-800', icon: '😐' };

        return (
          <div
            key={`${mention.id}-${index}`}
            className={`bg-white border-l-4 rounded-lg p-4 hover:shadow-md transition-shadow ${
              mention.sentiment === 'positive'
                ? 'border-green-500'
                : mention.sentiment === 'negative'
                ? 'border-red-500'
                : 'border-gray-500'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`${platformColor.bg} ${platformColor.text} px-2 py-1 rounded text-xs font-medium`}>
                    {platformColor.icon} {mention.platform}
                  </span>
                  <span className={`${sentimentColor.bg} ${sentimentColor.text} px-2 py-1 rounded text-xs font-medium`}>
                    {sentimentColor.icon}
                  </span>
                </div>
                <p className="text-gray-800 text-sm leading-relaxed line-clamp-3">{mention.text}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-xs text-gray-500 mb-2">{formatTimeAgo(mention.created_at)}</p>
                <a
                  href={mention.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs font-medium transition-colors"
                >
                  View <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        );
      })}

      {hasMore && (
        <div className="text-center pt-4">
          <button
            onClick={onLoadMore}
            disabled={isLoading}
            className="px-6 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Loading...' : 'Load More Mentions'}
          </button>
        </div>
      )}
    </div>
  );
}
