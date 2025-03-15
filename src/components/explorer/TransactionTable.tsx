import React, { useState, useEffect } from 'react';
import { useLatestTransactions } from '@/hooks/transactions/useLatestTransactions';
import {
  CheckCircle,
  XCircle,
  RefreshCw,
  Clock,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate, getTransactionLink } from '@/lib/utils';

export interface Transaction {
  hash: string;
  method: string;
  module: string;
  status: 'completed' | 'pending' | 'failed' | string;
  timestamp: string;
}

interface StatusIndicatorProps {
  status: Transaction['status'];
}

// Skeleton loader for transaction table
const TransactionTableSkeleton = () => {
  return (
    <div>
      <div className='flex justify-between items-center mb-4'>
        <Skeleton className='h-8 w-48' />
        <Skeleton className='h-10 w-24' />
      </div>

      <div className='overflow-x-auto rounded-md border border-white/10 overflow-hidden'>
        <Table>
          <TableHeader>
            <TableRow className='border-b border-white/10 bg-secondary'>
              <TableHead className='text-white/10 font-medium'>
                <Skeleton className='h-4 w-24' />
              </TableHead>
              <TableHead className='text-white/10 font-medium'>
                <Skeleton className='h-4 w-20' />
              </TableHead>
              <TableHead className='text-white/10 font-medium'>
                <Skeleton className='h-4 w-20' />
              </TableHead>
              <TableHead className='text-white/10 font-medium'>
                <Skeleton className='h-4 w-24' />
              </TableHead>
              <TableHead className='text-white/10 font-medium'>
                <Skeleton className='h-4 w-20' />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array(5)
              .fill(0)
              .map((_, index) => (
                <TableRow
                  key={index}
                  className='border-b border-white/10 hover:bg-secondary bg-black transition-colors'
                >
                  <TableCell>
                    <Skeleton className='h-6 w-32' />
                  </TableCell>
                  <TableCell>
                    <Skeleton className='h-6 w-24' />
                  </TableCell>
                  <TableCell>
                    <Skeleton className='h-6 w-20' />
                  </TableCell>
                  <TableCell>
                    <Skeleton className='h-6 w-28' />
                  </TableCell>
                  <TableCell>
                    <Skeleton className='h-6 w-24' />
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default function TransactionTable() {
  const [currentPage, setCurrentPage] = useState(0);
  const ITEMS_PER_PAGE = 5;

  const { data, isLoading, isError, isFetching, refetch } =
    useLatestTransactions();

  console.log({ data });

  // Debug data structure
  useEffect(() => {
    if (data) {
      console.log('Transaction data structure:', data);
    }
  }, [data]);

  // Reset to first page when new data is fetched
  useEffect(() => {
    if (data) {
      setCurrentPage(0);
    }
  }, [data]);

  const handleRefresh = () => {
    refetch();
    // Reset to first page on manual refresh
    setCurrentPage(0);
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const nextPage = () => {
    if (
      currentPage <
      Math.ceil((allTransactions?.length || 0) / ITEMS_PER_PAGE) - 1
    ) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Show skeleton loader during initial loading
  if (isLoading) {
    return <TransactionTableSkeleton />;
  }

  if (isError) {
    return (
      <div className='p-4 border border-red-400 bg-red-100 text-red-700 rounded-md'>
        Error occurred while fetching transactions. Please try refreshing.
      </div>
    );
  }

  const allTransactions = data?.nodes || [];

  // Calculate pagination
  const startIndex = currentPage * ITEMS_PER_PAGE;
  const endIndex = Math.min(
    startIndex + ITEMS_PER_PAGE,
    allTransactions.length
  );

  // Get transactions for the current page
  const currentTransactions = allTransactions.slice(startIndex, endIndex);

  // Determine if we have a next page
  const hasNextPage =
    allTransactions.length > (currentPage + 1) * ITEMS_PER_PAGE;

  // If we have no transactions to display
  if (allTransactions.length === 0) {
    return (
      <div className='flex flex-col space-y-4'>
        <div className='flex justify-between items-center mb-4'>
          <h2 className='text-xl font-semibold text-white'>
            Recent Transactions
          </h2>
          <Button
            variant='ghost'
            className='flex items-center text-primary hover:text-primary hover:bg-[#1a1a1a]'
            onClick={handleRefresh}
          >
            <RefreshCw className='h-4 w-4 mr-2' />
            Refresh
          </Button>
        </div>

        <div className='p-8 text-center bg-secondary/20 rounded-md border border-white/10'>
          <p className='text-white/70'>
            No transactions found. Try refreshing.
          </p>
          <Button
            variant='outline'
            className='mt-4 border-white/10 hover:bg-secondary/40'
            onClick={handleRefresh}
          >
            <RefreshCw className='h-4 w-4 mr-2' />
            Refresh
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className='flex justify-between items-center mb-4'>
        <h2 className='text-xl font-semibold text-white'>
          Recent Transactions
        </h2>
        <Button
          variant='ghost'
          className='flex items-center text-primary hover:text-primary hover:bg-[#1a1a1a] cursor-pointer'
          onClick={handleRefresh}
          disabled={isFetching}
        >
          <RefreshCw
            className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`}
          />
          {isFetching ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      <div className='overflow-x-auto rounded-md border border-white/10 overflow-hidden'>
        <Table>
          <TableHeader>
            <TableRow className='border-b border-white/10 bg-secondary'>
              <TableHead className='text-white/80 font-medium'>HASH</TableHead>
              <TableHead className='text-white/80 font-medium'>
                METHOD
              </TableHead>
              <TableHead className='text-white/80 font-medium'>
                MODULE
              </TableHead>
              <TableHead className='text-white/80 font-medium'>
                TIMESTAMP
              </TableHead>
              <TableHead className='text-white/80 font-medium'>
                STATUS
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentTransactions.map((tx, index) => (
              <TableRow
                onClick={
                  tx.txHash
                    ? () => {
                        window.open(
                          getTransactionLink(tx.txHash || ''),
                          '_blank'
                        );
                      }
                    : undefined
                }
                key={`${tx.txHash || 'unknown'}-${startIndex + index}`}
                className='border-b border-white/10 hover:bg-secondary bg-black transition-colors cursor-pointer'
              >
                <TableCell className='font-mono text-white truncate max-w-[100px]'>
                  {tx.txHash}
                </TableCell>
                <TableCell className='text-white'>{tx.call || 'N/A'}</TableCell>
                <TableCell className='text-white'>
                  {tx.module || 'N/A'}
                </TableCell>
                <TableCell className='text-white whitespace-nowrap'>
                  {formatDate(tx.timestamp)}
                </TableCell>
                <TableCell>
                  <StatusIndicator
                    status={tx.success ? 'completed' : 'failed'}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className='flex justify-between items-center mt-4'>
        <div className='text-sm text-gray-400'>
          {allTransactions.length > 0 ? (
            <>
              Showing {startIndex + 1} to {endIndex} of {allTransactions.length}{' '}
              transactions
            </>
          ) : (
            <>No transactions found</>
          )}
        </div>
        <div className='flex space-x-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={prevPage}
            disabled={currentPage === 0}
            className='flex items-center border-white/10 bg-secondary hover:bg-secondary/80 text-white hover:text-white cursor-pointer'
          >
            <ChevronLeft className='h-4 w-4 mr-1' />
            Previous
          </Button>
          <Button
            variant='outline'
            size='sm'
            onClick={nextPage}
            disabled={!hasNextPage}
            className='flex items-center border-white/10 bg-secondary hover:bg-secondary/80 text-white hover:text-white cursor-pointer'
          >
            Next
            <ChevronRight className='h-4 w-4 ml-1' />
          </Button>
        </div>
      </div>
    </div>
  );
}

// Status indicator component
const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status }) => {
  switch (status) {
    case 'completed':
      return (
        <div className='flex items-center text-green-500 font-medium'>
          <CheckCircle className='mr-2 h-5 w-5' />
          Completed
        </div>
      );
    case 'pending':
      return (
        <div className='flex items-center text-yellow-500 font-medium'>
          <Clock className='mr-2 h-5 w-5' />
          Pending
        </div>
      );
    case 'failed':
      return (
        <div className='flex items-center text-red-500 font-medium'>
          <XCircle className='mr-2 h-5 w-5' />
          Failed
        </div>
      );
    default:
      return <span>{status}</span>;
  }
};
