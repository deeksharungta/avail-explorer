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
import Link from 'next/link';
import { formatAddress, getAccountLink } from '@/lib/utils';
import { ActionRecord } from '@/stores/actionStore';

interface ActionConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<
    | void
    | ActionRecord
    | {
        status: string;
        error: string;
      }
  >;
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
  const handleConfirm = async () => {
    try {
      await onConfirm();
      onClose();
    } catch (err) {
      console.error(err);
      onClose();
    }
  };

  const renderDetails = () => {
    if (actionType === 'transfer') {
      return (
        <div className='space-y-4'>
          <div className='flex justify-between items-center'>
            <span className='text-sm text-white/80'>Recipient</span>
            <Link
              target='_blank'
              href={getAccountLink(details?.recipient || '')}
              className='break-all font-medium text-sm hover:underline'
            >
              {formatAddress(details?.recipient as string)}
            </Link>
          </div>
          <div className='flex justify-between items-center'>
            <span className='text-sm text-white/80'>Amount</span>
            <span className='font-medium text-sm'>{details.amount} AVAIL</span>
          </div>
        </div>
      );
    }

    return (
      <div className='flex justify-between items-center'>
        <span className='text-sm text-white/80'>Data</span>
        <pre className='font-medium text-sm break-all whitespace-pre-wrap'>
          {details.data}
        </pre>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='dark:text-white sm:max-w-md border-white/10'>
        <DialogHeader>
          <DialogTitle className='text-xl text-white'>
            Confirm {actionType === 'transfer' ? 'Transfer' : 'Data Submission'}
          </DialogTitle>
          <DialogDescription>
            Please review the details of your transaction
          </DialogDescription>
        </DialogHeader>

        <div className='bg-transparent text-white mt-2'>{renderDetails()}</div>

        <DialogFooter>
          <div className='flex gap-3 w-full'>
            <Button
              onClick={onClose}
              className='flex-1 cursor-pointer bg-secondary hover:bg-white/10'
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              className='flex-1 bg-white text-black cursor-pointer hover:bg-white/80 hover:text-black'
            >
              Confirm
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
