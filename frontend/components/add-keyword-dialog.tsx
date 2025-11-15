'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { AddKeywordForm } from '@/components/add-keyword-form';
import { type Keyword } from '@/lib/api';

interface AddKeywordDialogProps {
  onKeywordAdded: (keyword: Keyword) => void;
}

export function AddKeywordDialog({ onKeywordAdded }: AddKeywordDialogProps) {
  const [open, setOpen] = useState(false);

  const handleFormSuccess = (newKeyword: Keyword) => {
    onKeywordAdded(newKeyword);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus size={18} />
          Add Keyword
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto"> 
        <DialogHeader>
          <DialogTitle>Add New Keyword</DialogTitle>
        </DialogHeader>
        <AddKeywordForm 
          onSuccess={handleFormSuccess} 
        />
      </DialogContent>
    </Dialog>
  );
}
