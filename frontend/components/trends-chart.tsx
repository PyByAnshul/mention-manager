'use client';

import { useRouter } from 'next/navigation';
import type { TrendData } from '@/lib/api';

interface TrendsChartProps {
  data: TrendData[];
}

export function TrendsChart({ data }: TrendsChartProps) {
  const router = useRouter();

  if (!data || data.length === 0) return null;

  const maxCount = Math.max(...data.map(d => d.count));

  const handleBarClick = (date: string) => {
    router.push(`/mentions?filterDate=${date}`);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Mention Volume (Last 7 Days)</h2>
      
      <div className="w-full overflow-x-auto -mx-4 md:mx-0 md:overflow-visible">
        <div className="flex items-end justify-between gap-1 md:gap-2 px-4 md:px-0" style={{ minWidth: '100%', minHeight: '240px' }}>
          {data.map((point, idx) => {
            const height = (point.count / maxCount) * 200;
            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 min-w-[40px]">
                <div className="w-full flex flex-col items-center">
                  <div
                    className="w-full bg-gradient-to-t from-blue-400 to-blue-600 rounded-t hover:opacity-80 transition-opacity cursor-pointer group relative"
                    style={{ height: `${height}px`, minWidth: '32px' }}
                    onClick={() => handleBarClick(point.date)}
                  >
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                      {point.count}
                    </div>
                  </div>
                </div>
                <span className="text-xs text-gray-500 font-medium w-full text-center">{point.date.split('-')[2]}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
