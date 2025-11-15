'use client';

import { useEffect, useState } from 'react';
import { KeywordsTable } from '@/components/keywords-table';
import { LoadingSpinner } from '@/components/loading-spinner';
import { fetchKeywords } from '@/lib/api';
import { Keyword } from '@/lib/api';
import { AddKeywordDialog } from '@/components/add-keyword-dialog';

export default function KeywordsPage() {
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [pagination, setPagination] = useState({ total: 0, limit: 20, offset: 0, pages: 0 });
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const loadKeywords = async (page = 0) => {
    try {
      setLoading(true);
      const response = await fetchKeywords({ limit: 20, offset: page * 20 });
      setKeywords(response.data);
      setPagination(response.pagination);
      setCurrentPage(page);
    } catch (error) {
      console.error('Failed to load keywords:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadKeywords();
  }, []);

  const handleKeywordAdded = (newKeyword: Keyword) => {
    loadKeywords(currentPage); // Reload current page
    setIsDialogOpen(false);
  };

  const handleKeywordDeleted = (keywordId: number) => {
    loadKeywords(currentPage); // Reload current page
  };

  const openDialog = () => {
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-12">
       
        
        {/* Keywords table below the form */}
        <KeywordsTable 
          keywords={keywords}
          pagination={pagination}
          currentPage={currentPage}
          onKeywordAdded={handleKeywordAdded}
          onKeywordDeleted={handleKeywordDeleted}
          onPageChange={loadKeywords}
        />
        {isDialogOpen && <AddKeywordDialog onClose={closeDialog} onAddKeyword={handleKeywordAdded} />}
      </div>
    </div>
  );
}
