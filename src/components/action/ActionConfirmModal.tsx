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
import { CheckCircle, XCircle, Loader2, ExternalLink } from 'lucide-react';
import Link from 'next/link';

type TransactionState = 'confirm' | 'processing' | 'success' | 'error';

interface ActionConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
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
  const [transactionState, setTransactionState] =
    useState<TransactionState>('confirm');
  const [error, setError] = useState<string>('');
  const [txHash, setTxHash] = useState<string>('');

  const handleConfirm = async () => {
    setTransactionState('processing');

    try {
      await onConfirm();
      setTxHash('0x' + Math.random().toString(16).slice(2, 34)); // Simulating a tx hash
      setTransactionState('success');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Transaction failed');
      setTransactionState('error');
    }
  };

  const handleClose = () => {
    // Reset state on close
    setTimeout(() => {
      setTransactionState('confirm');
      setError('');
      setTxHash('');
    }, 200);
    onClose();
  };

  const getExplorerLink = (hash: string) => {
    return `https://avail-turing.subscan.io/extrinsic/${hash}`;
  };

  const renderDetails = () => {
    if (actionType === 'transfer') {
      return (
        <div className='space-y-4'>
          <div className='flex justify-between items-center'>
            <span className='text-sm text-white/80 '>Recipient</span>
            <span className='break-all font-medium text-sm'>
              {details.recipient}
            </span>
          </div>
          <div className='flex justify-between items-center'>
            <span className='text-sm text-white/80 '>Amount</span>
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

  const renderModalContent = () => {
    switch (transactionState) {
      case 'processing':
        return (
          <div className='flex flex-col items-center py-6'>
            <Loader2 className='h-16 w-16 text-white animate-spin mb-4' />
            <h3 className='text-xl font-medium mb-2 text-white'>
              Processing Your{' '}
              {actionType === 'transfer' ? 'Transfer' : 'Data Submission'}
            </h3>
            <p className='text-center text-white/60 '>
              Please wait while we process your transaction. This may take a few
              moments.
            </p>
          </div>
        );

      case 'success':
        return (
          <div className='flex flex-col items-center py-6'>
            <CheckCircle className='h-16 w-16 text-green-500 mb-4' />
            <h3 className='text-xl font-medium mb-2 text-white'>
              {actionType === 'transfer' ? 'Transfer' : 'Data Submission'}{' '}
              Successful!
            </h3>
            <p className='text-center text-white/60  mb-6'>
              Your transaction has been successfully processed.
            </p>
            {true && (
              <Link
                href={getExplorerLink(txHash)}
                target='_blank'
                className='flex items-center text-blue-500 hover:text-blue-600 transition-colors'
              >
                View Transaction <ExternalLink className='ml-1 h-4 w-4' />
              </Link>
            )}
          </div>
        );

      case 'error':
        return (
          <div className='flex flex-col items-center py-6'>
            <XCircle className='h-16 w-16 text-red-500 mb-4' />
            <h3 className='text-xl text-white font-medium mb-2'>
              Transaction Failed
            </h3>
            <p className='text-center text-red-500 mb-2'>{error}</p>
            <p className='text-center text-white/60 '>Please try again.</p>
          </div>
        );

      default:
        return (
          <>
            <DialogHeader>
              <DialogTitle className='text-xl text-white'>
                Confirm{' '}
                {actionType === 'transfer' ? 'Transfer' : 'Data Submission'}
              </DialogTitle>
              <DialogDescription>
                Please review the details of your transaction
              </DialogDescription>
            </DialogHeader>

            <div className='bg-transparent text-white mt-2'>
              {renderDetails()}
            </div>
          </>
        );
    }
  };

  const renderFooter = () => {
    switch (transactionState) {
      case 'processing':
        return (
          <Button disabled className='w-full'>
            Processing...
          </Button>
        );

      case 'success':
      case 'error':
        return (
          <Button onClick={handleClose} className='w-full'>
            Close
          </Button>
        );

      default:
        return (
          <div className='flex gap-3 w-full'>
            <Button
              onClick={handleClose}
              className='flex-1 bg-white text-black cursor-pointer hover:bg-white/80 hover:text-black'
            >
              Cancel
            </Button>
            <Button onClick={handleConfirm} className='flex-1 cursor-pointer'>
              Confirm
            </Button>
          </div>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className=' dark:text-white sm:max-w-md border-white/10'>
        {renderModalContent()}
        <DialogFooter>{renderFooter()}</DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
