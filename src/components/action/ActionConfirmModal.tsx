'use client';

import React, { useState } from 'react';
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
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@radix-ui/react-tooltip';
import { Loader2 } from 'lucide-react';

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
  const [isProcessing, setIsProcessing] = useState(false);

  const handleConfirm = async () => {
    try {
      setIsProcessing(true);
      await onConfirm();
      setIsProcessing(false);
      onClose();
    } catch (err) {
      console.error(err);
      setIsProcessing(false);
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
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <pre className='font-medium text-sm break-all truncate max-w-52'>
                {details.data}
              </pre>
            </TooltipTrigger>
            <TooltipContent className='bg-secondary border rounded-md border-white/10 p-2 text-white max-w-xs z-40'>
              <p className='text-sm'>{details.data}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => !isProcessing && onClose()}>
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
              disabled={isProcessing}
              className='flex-1 cursor-pointer bg-secondary hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={isProcessing}
              className='flex-1 bg-white text-black cursor-pointer hover:bg-white/80 hover:text-black disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {isProcessing ? (
                <div className='flex items-center justify-center'>
                  <Loader2 className='animate-spin mr-2 h-4 w-4 text-black' />
                  Processing...
                </div>
              ) : (
                'Confirm'
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
