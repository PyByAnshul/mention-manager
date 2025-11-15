// Filter chips for platform and sentiment
'use client';

interface FilterBarProps {
  activeFilters: {
    platform: string;
    sentiment: string;
  };
  onFilterChange: (filters: { platform: string; sentiment: string }) => void;
}

const PLATFORMS = ['all', 'Reddit', 'News'];
const SENTIMENTS = ['all', 'positive', 'negative', 'neutral'];

export function FilterBar({ activeFilters, onFilterChange }: FilterBarProps) {
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4 space-y-4">


      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">Sentiment</p>
        <div className="flex gap-2 flex-wrap">
          {SENTIMENTS.map((sentiment) => (
            <button
              key={sentiment}
              onClick={() => onFilterChange({ ...activeFilters, sentiment })}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeFilters.sentiment === sentiment
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {sentiment === 'all' ? 'All Sentiments' : sentiment.charAt(0).toUpperCase() + sentiment.slice(1)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
