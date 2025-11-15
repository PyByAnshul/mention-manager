'use client';

import { AddMentionForm } from '@/components/add-mention-form';

export default function AddMentionPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <AddMentionForm />
      </div>
    </div>
  );
}
