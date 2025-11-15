// Alert banner for spike detection
'use client';

import { X } from 'lucide-react';
import { useState } from 'react';
import type { Alert } from '@/lib/api';

interface AlertsBannerProps {
  alerts: Alert[];
}

export function AlertsBanner({ alerts }: AlertsBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || !alerts || alerts.length === 0) return null;

  return (
    <div className="mx-6 my-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start justify-between">
      <div className="flex items-start gap-3">
        <span className="text-xl">⚠️</span>
        <div>
          {alerts.map((alert, idx) => (
            <p key={idx} className="text-sm font-medium text-yellow-800">
              {alert.message}
            </p>
          ))}
          <p className="text-xs text-yellow-600 mt-1">
            Detected {new Date(alerts[0].created_at).toLocaleTimeString()}
          </p>
        </div>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="text-yellow-600 hover:text-yellow-700 transition-colors"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
}
