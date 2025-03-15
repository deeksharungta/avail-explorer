'use client';

import React from 'react';
import { CheckCircle, XCircle, Copy, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ErrorCard from '@/components/transaction/ErrorCard';
import ExtrinsicOverview from '@/components/transaction/ExtrinsicOverview';
import NoTransactionFound from '@/components/transaction/NoTransactionFound';
import { formatDate, copyToClipboard, getExplorerLink } from '@/lib/utils';
import { useTransaction } from '@/hooks/transactions/useTransaction';
import RelatedDetails from './RelatedDetails';

interface TransactionDetailsProps {
  txHash: string;
}

const StatusIndicator: React.FC<{ success: boolean }> = ({ success }) => {
  return success ? (
    <Badge className='bg-green-500/20 text-green-500 border-green-500/50'>
      <CheckCircle className='mr-1 h-3 w-3' />
      Completed
    </Badge>
  ) : (
    <Badge className='bg-red-500/20 text-red-500 border-red-500/50'>
      <XCircle className='mr-1 h-3 w-3' />
      Failed
    </Badge>
  );
};

export default function TransactionDetails({
  txHash,
}: TransactionDetailsProps) {
  const { data, isLoading, isError } = useTransaction(txHash);

  if (isLoading) {
    return <TransactionDetailsSkeleton />;
  }

  // Check if no transaction was found
  if (isError || !data) {
    return <NoTransactionFound hash={txHash} />;
  }

  const transaction = data;

  // To keep error handling similar to the mock data
  const error = !transaction.success
    ? {
        module: 'System',
        name: 'ExtrinsicFailed',
        details: 'Transaction failed',
        stackTrace: '',
      }
    : null;

  return (
    <div className='w-full mx-auto px-4 py-8 max-w-5xl'>
      <div className='flex items-center justify-between mb-6'>
        <div>
          <h1 className='text-2xl font-bold text-white mb-2'>
            Extrinsic #{transaction.id}
          </h1>
          <div className='flex items-center space-x-2'>
            <StatusIndicator success={transaction.success} />
            <span className='text-gray-400 text-sm'>
              {formatDate(transaction.timestamp)}
            </span>
          </div>
        </div>
        <div className='flex space-x-2'>
          <Button
            variant='outline'
            size='sm'
            className='flex items-center border-white/10 bg-secondary text-white hover:bg-white/10 cursor-pointer hover:text-white'
            onClick={() => copyToClipboard(transaction.txHash)}
          >
            <Copy className='mr-1 h-4 w-4' />
            Copy Hash
          </Button>
          <Button
            onClick={() => {
              window.open(getExplorerLink(transaction.txHash), '_blank');
            }}
            variant='outline'
            size='sm'
            className='flex items-center border-white/10 bg-secondary text-white hover:bg-white/10 cursor-pointer hover:text-white'
          >
            <ExternalLink className='mr-1 h-4 w-4' />
            View on Explorer
          </Button>
        </div>
      </div>

      <ExtrinsicOverview extrinsic={transaction} />
      <RelatedDetails extrinsic={transaction} />

      {!transaction.success && error && <ErrorCard error={error} />}
    </div>
  );
}

const SkeletonItem = ({
  labelWidth = 'w-1/4',
  valueWidth = 'w-3/4',
  className = '',
}) => (
  <div className={`flex flex-col space-y-2 ${className}`}>
    <div className={`h-5 bg-white/10 rounded ${labelWidth}`}></div>
    <div className={`h-10 bg-white/10 rounded ${valueWidth}`}></div>
  </div>
);

const TransactionDetailsSkeleton: React.FC = () => {
  return (
    <div className='w-full mx-auto px-4 py-8 max-w-5xl animate-pulse'>
      <div className='flex items-center justify-between mb-6'>
        <div className='space-y-2'>
          <div className='h-8 bg-white/10 rounded w-64'></div>
          <div className='flex items-center space-x-2'>
            <div className='h-6 w-24 bg-white/10 rounded'></div>
            <div className='h-4 w-32 bg-white/10 rounded'></div>
          </div>
        </div>
        <div className='flex space-x-2'>
          <div className='h-8 w-24 bg-white/10 rounded'></div>
          <div className='h-8 w-32 bg-white/10 rounded'></div>
        </div>
      </div>

      <div className='bg-white/5 rounded-lg p-10 mb-6'>
        <div className='grid md:grid-cols-2 gap-4'>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
            <SkeletonItem key={item} />
          ))}
        </div>
      </div>

      <div className='flex space-x-2 mb-4'>
        {['Details', 'Events', 'Data Submissions'].map((tab, index) => (
          <div
            key={tab}
            className={`
              h-8 w-24 rounded-md
              ${index === 0 ? 'bg-white/10' : 'bg-white/5'}
            `}
          ></div>
        ))}
      </div>

      <div className='space-y-6 bg-white/5 rounded-lg p-10 mb-6'>
        <div>
          <div className='h-6 bg-white/10 rounded w-48 mb-4'></div>
          <div className='grid md:grid-cols-2 gap-4'>
            {[1, 2, 3, 4].map((item) => (
              <SkeletonItem key={item} />
            ))}
          </div>
        </div>

        <div>
          <div className='h-6 bg-white/10 rounded w-48 mb-4'></div>
          <div className='h-20 bg-white/10 rounded'></div>
        </div>

        <div>
          <div className='h-6 bg-white/10 rounded w-48 mb-4'></div>
          <div className='grid md:grid-cols-2 gap-4'>
            {[1, 2].map((item) => (
              <SkeletonItem key={item} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
