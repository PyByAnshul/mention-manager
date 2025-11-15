// Dashboard header with search and refresh
'use client';

import { RefreshCw } from 'lucide-react';

interface HeaderProps {
  onRefresh: () => void;
  isLoading?: boolean;
}

export function Header({ onRefresh, isLoading = false }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">BM</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">BrandMonitor</h1>
        </div>
        
        <input
          type="text"
          placeholder="Search brand..."
          className="flex-1 max-w-xs mx-8 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>
    </header>
  );
}
