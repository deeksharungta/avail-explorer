'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ActionConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  actionType: 'transfer' | 'data-submit';
  details: {
    recipient?: string;
    amount?: string;
    data?: string;
  };
}

export function ActionConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  actionType,
  details,
}: ActionConfirmModalProps) {
  const renderDetails = () => {
    if (actionType === 'transfer') {
      return (
        <>
          <div className='grid grid-cols-3 gap-2 mb-2'>
            <span className='font-medium'>Recipient:</span>
            <span className='col-span-2 break-all text-sm'>
              {details.recipient}
            </span>
          </div>
          <div className='grid grid-cols-3 gap-2'>
            <span className='font-medium'>Amount:</span>
            <span className='col-span-2'>{details.amount} AVAIL</span>
          </div>
        </>
      );
    }

    return (
      <div className='grid grid-cols-3 gap-2'>
        <span className='font-medium'>Data:</span>
        <span className='col-span-2 break-all text-sm'>{details.data}</span>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Confirm {actionType === 'transfer' ? 'Transfer' : 'Data Submission'}
          </DialogTitle>
          <DialogDescription>
            Please review the details of your action
          </DialogDescription>
        </DialogHeader>

        <div className='p-4 border rounded-md'>{renderDetails()}</div>

        <DialogFooter>
          <Button variant='outline' onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onConfirm}>Confirm</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
