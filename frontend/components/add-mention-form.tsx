'use client';

import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface AddMentionFormProps {
  onSuccess?: () => void;
}

const PLATFORMS = ['Reddit', 'News'];

export function AddMentionForm({ onSuccess }: AddMentionFormProps) {
  const [mentionText, setMentionText] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<Set<string>>(new Set());
  const [keywords, setKeywords] = useState<string[]>([]);
  const [currentKeyword, setCurrentKeyword] = useState('');
  const [showMonitoringDialog, setShowMonitoringDialog] = useState(false);
  const [isMonitoringLoading, setIsMonitoringLoading] = useState(false);

  const togglePlatform = (platform: string) => {
    const newSelected = new Set(selectedPlatforms);
    if (newSelected.has(platform)) {
      newSelected.delete(platform);
    } else {
      newSelected.add(platform);
    }
    setSelectedPlatforms(newSelected);
  };

  const addKeyword = () => {
    if (currentKeyword.trim()) {
      setKeywords([...keywords, currentKeyword.trim()]);
      setCurrentKeyword('');
    }
  };

  const removeKeyword = (index: number) => {
    setKeywords(keywords.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!mentionText.trim()) {
      alert('Please enter mention text');
      return;
    }

    if (selectedPlatforms.size === 0) {
      alert('Please select at least one platform');
      return;
    }

    if (keywords.length === 0) {
      alert('Please add at least one keyword');
      return;
    }

    setIsMonitoringLoading(true);
    console.log('Form submitted:', {
      text: mentionText,
      platforms: Array.from(selectedPlatforms),
      keywords,
    });

    // Simulate API call with 2-second delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsMonitoringLoading(false);
    setShowMonitoringDialog(true);
  };

  const handleCloseDialog = () => {
    setShowMonitoringDialog(false);
    
    // Reset form after closing dialog
    setTimeout(() => {
      setMentionText('');
      setSelectedPlatforms(new Set());
      setKeywords([]);
      setCurrentKeyword('');
      onSuccess?.();
    }, 300);
  };

  return (
    <>
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Add New Mention to Monitor</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Mention Text */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Mention Text
              </label>
              <textarea
                value={mentionText}
                onChange={(e) => setMentionText(e.target.value)}
                placeholder="Enter the mention or phrase you want to monitor..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={4}
                disabled={isMonitoringLoading}
              />
              <p className="text-xs text-gray-500 mt-1">
                This is the text you want to monitor and search for across platforms
              </p>
            </div>

            {/* Platform Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Select Platforms
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {PLATFORMS.map((platform) => (
                  <label
                    key={platform}
                    className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedPlatforms.has(platform)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:bg-gray-50'
                    } ${isMonitoringLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <Checkbox
                      checked={selectedPlatforms.has(platform)}
                      onCheckedChange={() => togglePlatform(platform)}
                      disabled={isMonitoringLoading}
                    />
                    <span className="font-medium text-gray-900">{platform}</span>
                  </label>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Choose where you want to monitor mentions (Twitter, Reddit, News, etc.)
              </p>
            </div>

            {/* Keywords */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Related Keywords (Optional)
              </label>
              <div className="flex gap-2 mb-3">
                <Input
                  value={currentKeyword}
                  onChange={(e) => setCurrentKeyword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                  placeholder="Add keyword and press Enter..."
                  className="flex-1"
                  disabled={isMonitoringLoading}
                />
                <button
                  type="button"
                  onClick={addKeyword}
                  disabled={isMonitoringLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus size={18} />
                  Add
                </button>
              </div>

              {keywords.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {keywords.map((keyword, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                    >
                      {keyword}
                      <button
                        type="button"
                        onClick={() => removeKeyword(index)}
                        disabled={isMonitoringLoading}
                        className="text-blue-600 hover:text-blue-800 disabled:opacity-50"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-xs text-gray-500 mt-2">
                Add related keywords to improve matching accuracy
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isMonitoringLoading}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isMonitoringLoading ? (
                <>
                  <div className="animate-spin">
                    <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                  Starting Monitoring...
                </>
              ) : (
                'Start Monitoring'
              )}
            </button>
          </form>
        </div>
      </div>

      <Dialog open={showMonitoringDialog} onOpenChange={handleCloseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Monitoring Started</DialogTitle>
            <DialogDescription>
              Your mention "{mentionText}" will now be monitored.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-3">
            <p className="text-sm text-gray-600">
              <span className="font-semibold">Platforms:</span> {Array.from(selectedPlatforms).join(', ')}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-semibold">Keywords:</span> {keywords.join(', ')}
            </p>
            <p className="text-sm text-gray-600">
              You will receive real-time updates about these mentions across all selected platforms.
            </p>
          </div>
          <DialogFooter>
            <Button
              onClick={handleCloseDialog}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
