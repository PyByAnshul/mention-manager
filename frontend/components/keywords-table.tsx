'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Trash2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AddKeywordDialog } from '@/components/add-keyword-dialog';
import { deleteKeyword, type Keyword } from '@/lib/api';

interface KeywordsTableProps {
  keywords: Keyword[];
  pagination: { total: number; limit: number; offset: number; pages: number };
  onKeywordAdded: (keyword: Keyword) => void;
  onKeywordDeleted: (keywordId: number) => void;
  onPageChange: (page: number) => void;
  currentPage: number;
}

export function KeywordsTable({ keywords, pagination, onKeywordAdded, onKeywordDeleted, onPageChange, currentPage }: KeywordsTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'date'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const router = useRouter();

  const filteredKeywords = useMemo(() => {
    let filtered = (keywords || []).filter(k =>
      k && k.keyword && k.keyword.toLowerCase().includes(searchTerm.toLowerCase())
    );

    filtered.sort((a, b) => {
      if (sortBy === 'name') {
        const comparison = a.keyword.localeCompare(b.keyword);
        return sortOrder === 'asc' ? comparison : -comparison;
      } else {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      }
    });

    return filtered;
  }, [keywords, searchTerm, sortBy, sortOrder]);

  const handleDelete = async (keywordId: number) => {
    if (!confirm('Are you sure you want to delete this keyword?')) return;
    
    setDeletingId(keywordId);
    try {
      await deleteKeyword(keywordId);
      onKeywordDeleted(keywordId);
    } catch (error) {
      console.error('Failed to delete keyword:', error);
      alert('Failed to delete keyword');
    } finally {
      setDeletingId(null);
    }
  };

  const handleViewMentions = (keyword: string) => {
    router.push(`/mentions?keyword=${encodeURIComponent(keyword)}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Keywords</h1>
          <p className="text-gray-600 mt-1">Manage and track keywords across your mentions</p>
        </div>
        <AddKeywordDialog onKeywordAdded={onKeywordAdded} />
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Search keywords..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex gap-2 flex-wrap">
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'name' | 'date')}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="date">Sort by Date</option>
          <option value="name">Sort by Name</option>
        </select>
        
        <button
          onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          {sortOrder === 'asc' ? '↑ Ascending' : '↓ Descending'}
        </button>
      </div>

      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Keyword</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Created</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredKeywords.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                  {searchTerm ? 'No keywords found matching your search' : 'No keywords added yet'}
                </td>
              </tr>
            ) : (
              filteredKeywords.map((keyword) => (
                <tr key={keyword.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{keyword.keyword}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      keyword.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {keyword.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(keyword.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => handleViewMentions(keyword.keyword)}
                        size="sm"
                        variant="outline"
                        className="flex items-center gap-1"
                      >
                        <ArrowRight size={16} />
                        View Mentions
                      </Button>
                      <button
                        onClick={() => handleDelete(keyword.id)}
                        disabled={deletingId === keyword.id}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        title="Delete keyword"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between px-6 py-3 bg-white border-t border-gray-200">
          <div className="text-sm text-gray-700">
            Showing {pagination.offset + 1} to {Math.min(pagination.offset + pagination.limit, pagination.total)} of {pagination.total} results
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 0}
              className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            {Array.from({ length: pagination.pages }, (_, i) => (
              <button
                key={i}
                onClick={() => onPageChange(i)}
                className={`px-3 py-1 text-sm border rounded ${
                  currentPage === i
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === pagination.pages - 1}
              className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
