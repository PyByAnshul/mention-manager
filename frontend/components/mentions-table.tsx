'use client';

import { useState, useMemo, useEffect } from 'react';
import { ChevronUp, ChevronDown, Download } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { useSearchParams } from 'next/navigation';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { Mention } from '@/lib/api';

interface MentionsTableProps {
  mentions: Mention[];
  pagination?: { total: number; limit: number; offset: number; pages: number };
  selectedChart?: string;
  onPageChange?: (page: number) => void;
  currentPage?: number;
}

type SortField = 'created_at' | 'sentiment' | 'platform' | 'score';
type SortOrder = 'asc' | 'desc';

export function MentionsTable({ mentions, pagination, selectedChart, onPageChange, currentPage = 0 }: MentionsTableProps) {
  const searchParams = useSearchParams();
  const [searchText, setSearchText] = useState('');

  const [selectedSentiment, setSelectedSentiment] = useState<string>('all');
  const [filterDate, setFilterDate] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  useEffect(() => {
    const sentiment = searchParams.get('sentiment');
    const date = searchParams.get('filterDate');
    if (sentiment) setSelectedSentiment(sentiment);
    if (date) setFilterDate(date);
  }, [searchParams]);

  // Filter and sort data
  const filteredMentions = useMemo(() => {
    let filtered = mentions || [];

    if (searchText) {
      filtered = filtered.filter(m =>
        m.text.toLowerCase().includes(searchText.toLowerCase())
      );
    }



    if (selectedSentiment !== 'all') {
      filtered = filtered.filter(m => m.sentiment === selectedSentiment);
    }

    if (filterDate) {
      filtered = filtered.filter(m => m.created_at.startsWith(filterDate));
    }

    // Sort
    filtered.sort((a, b) => {
      let aVal: any = a[sortField];
      let bVal: any = b[sortField];

      if (sortOrder === 'desc') {
        return bVal > aVal ? 1 : -1;
      } else {
        return aVal > bVal ? 1 : -1;
      }
    });

    return filtered;
  }, [mentions, searchText, selectedSentiment, filterDate, sortField, sortOrder]);

  const toggleRowSelection = (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    const newSelected = new Set(selectedRows);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedRows(newSelected);
  };

  const toggleSelectAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedRows.size === filteredMentions.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(filteredMentions.map(m => String(m.id))));
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const downloadCSV = () => {
    const rowsToDownload = selectedRows.size > 0
      ? filteredMentions.filter(m => selectedRows.has(String(m.id)))
      : filteredMentions;

    if (rowsToDownload.length === 0) {
      alert('No records to download');
      return;
    }

    const headers = ['ID', 'Text', 'Platform', 'Sentiment', 'Score', 'Created At'];
    const csvContent = [
      headers.join(','),
      ...rowsToDownload.map(m =>
        [
          m.id,
          `"${m.text.replace(/"/g, '""')}"`,
          m.platform,
          m.sentiment,
          (m.sentiment_score || 0).toFixed(2),
          m.created_at,
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mentions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <div className="w-4 h-4" />;
    return sortOrder === 'asc' ? (
      <ChevronUp size={16} />
    ) : (
      <ChevronDown size={16} />
    );
  };

  return (
    <>
      <div className="space-y-4">
        {/* Header with title and action buttons */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h2 className="text-xl font-bold text-gray-900">
            {selectedChart ? `${selectedChart} Mentions` : 'All Mentions'}
          </h2>
          <div className="flex items-center gap-2">
            {selectedRows.size > 0 && (
              <button
                onClick={downloadCSV}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                <Download size={18} />
                Download ({selectedRows.size})
              </button>
            )}
          </div>
        </div>

        {/* Filters and Search */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            placeholder="Search mentions..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full"
          />



          <select
            value={selectedSentiment}
            onChange={(e) => setSelectedSentiment(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Sentiments</option>
            <option value="positive">Positive</option>
            <option value="neutral">Neutral</option>
            <option value="negative">Negative</option>
          </select>

          <div className="text-sm text-gray-600 py-2">
            {filteredMentions.length} records
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-left w-12">
                  <Checkbox
                    checked={selectedRows.size === filteredMentions.length && filteredMentions.length > 0}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedRows(new Set(filteredMentions.map(m => String(m.id))));
                      } else {
                        setSelectedRows(new Set());
                      }
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-900">Text</th>
                <th
                  className="px-4 py-3 text-left font-semibold text-gray-900 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('platform')}
                >
                  <div className="flex items-center gap-2">
                    Platform <SortIcon field="platform" />
                  </div>
                </th>
                <th
                  className="px-4 py-3 text-left font-semibold text-gray-900 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('sentiment')}
                >
                  <div className="flex items-center gap-2">
                    Sentiment <SortIcon field="sentiment" />
                  </div>
                </th>
                <th
                  className="px-4 py-3 text-left font-semibold text-gray-900 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('score')}
                >
                  <div className="flex items-center gap-2">
                    Score <SortIcon field="score" />
                  </div>
                </th>
                <th
                  className="px-4 py-3 text-left font-semibold text-gray-900 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('created_at')}
                >
                  <div className="flex items-center gap-2">
                    Date <SortIcon field="created_at" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredMentions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    No mentions found
                  </td>
                </tr>
              ) : (
                filteredMentions.map((mention) => (
                  <tr
                    key={mention.id}
                    className={`border-b border-gray-200 hover:bg-gray-50 transition-colors ${
                      selectedRows.has(String(mention.id)) ? 'bg-blue-100 border-l-4 border-l-blue-600' : ''
                    }`}
                    onClick={() => toggleRowSelection(String(mention.id))}
                  >
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedRows.has(String(mention.id))}
                        onCheckedChange={(checked) => {
                          const newSelected = new Set(selectedRows);
                          if (checked) {
                            newSelected.add(String(mention.id));
                          } else {
                            newSelected.delete(String(mention.id));
                          }
                          setSelectedRows(newSelected);
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </td>
                    <td className="px-4 py-3 max-w-xs truncate">{mention.text}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                        {mention.platform}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          mention.sentiment === 'positive'
                            ? 'bg-green-100 text-green-700'
                            : mention.sentiment === 'negative'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {mention.sentiment.charAt(0).toUpperCase() + mention.sentiment.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3">{(mention.sentiment_score || 0).toFixed(2)}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {new Date(mention.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Selection status */}
        {selectedRows.size > 0 && (
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
            <span className="text-sm font-medium text-blue-900">
              {selectedRows.size} row{selectedRows.size !== 1 ? 's' : ''} selected
            </span>
            <button
              onClick={() => setSelectedRows(new Set())}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Clear Selection
            </button>
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.pages > 1 && onPageChange && (
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
    </>
  );
}
