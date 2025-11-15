'use client';

import { Suspense } from 'react';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { MentionsTable } from '@/components/mentions-table';
import { LoadingSpinner } from '@/components/loading-spinner';
import { fetchMentions, type Mention } from '@/lib/api';

function MentionsContent() {
  const [mentions, setMentions] = useState<Mention[]>([]);
  const [pagination, setPagination] = useState({ total: 0, limit: 20, offset: 0, pages: 0 });
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const keyword = searchParams.get('keyword');

  const loadMentions = async (page = 0) => {
    try {
      setLoading(true);
      const response = await fetchMentions({ limit: 20, offset: page * 20 });
      
      let filtered = response.data;
      if (keyword) {
        filtered = response.data.filter(m => 
          m.text.toLowerCase().includes(keyword.toLowerCase())
        );
      }
      
      setMentions(filtered);
      setPagination(response.pagination);
      setCurrentPage(page);
    } catch (error) {
      console.error('Failed to load mentions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMentions();
  }, [keyword]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {keyword && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
            Showing mentions for keyword: <span className="font-semibold">"{keyword}"</span>
          </div>
        )}
        <MentionsTable 
          mentions={mentions} 
          pagination={pagination}
          currentPage={currentPage}
          onPageChange={loadMentions}
        />
      </div>
    </div>
  );
}

export default function MentionsPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <MentionsContent />
    </Suspense>
  );
}
