'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { addKeyword, type Keyword } from '@/lib/api';

interface AddKeywordFormProps {
  onSuccess?: (keyword: Keyword) => void;
}

export function AddKeywordForm({ onSuccess }: AddKeywordFormProps) {
  const [keyword, setKeyword] = useState('');
  const [platform] = useState('all');
  const [sentiment, setSentiment] = useState('positive');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!keyword.trim()) {
      alert('Please enter a keyword');
      return;
    }

    setIsLoading(true);
    try {
      const newKeyword = await addKeyword({
        keyword: keyword.trim(),
        platform,
        sentiment
      });
      if (newKeyword) {
        onSuccess?.(newKeyword);
        setKeyword('');
      } else {
        alert('Failed to add keyword');
      }
    } catch (error) {
      console.error('Failed to add keyword:', error);
      alert('Failed to add keyword');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Keyword
        </label>
        <Input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Enter keyword to monitor..."
          disabled={isLoading}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Sentiment
        </label>
        <select
          value={sentiment}
          onChange={(e) => setSentiment(e.target.value)}
          disabled={isLoading}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="positive">Positive</option>
          <option value="negative">Negative</option>
          <option value="neutral">Neutral</option>
        </select>
      </div>
      <Button type="submit" disabled={isLoading || !keyword.trim()} className="w-full">
        {isLoading ? 'Adding...' : 'Add Keyword'}
      </Button>
    </form>
  );
}