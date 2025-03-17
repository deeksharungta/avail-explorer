import React, { useState, useEffect, useRef } from 'react';
import { useLatestTransactions } from '@/hooks/transactions/useLatestTransactions';
import { RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
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
import AnimatedBlockNumber from './AnimatedBlockNumber';
import AnimatedTransactionRow from './AnimatedTransactionRow';

export interface Transaction {
  hash: string;
  method: string;
  module: string;
  status: 'completed' | 'pending' | 'failed' | string;
  timestamp: string;
  blockNumber?: number;
  txHash?: string;
  call?: string;
  success?: boolean;
}

export default function TransactionTable() {
  const [currentPage, setCurrentPage] = useState(0);
  const [latestBlockNumber, setLatestBlockNumber] = useState<number | null>(
    null
  );
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [newTransactionHashes, setNewTransactionHashes] = useState<Set<string>>(
    new Set()
  );
  const latestBlockRef = useRef<number | null>(null);
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);
  const prevTransactionsRef = useRef<string[]>([]);
  const ITEMS_PER_PAGE = 5;

  const { data, isLoading, isError, isFetching, refetch } =
    useLatestTransactions();

  // Reset to first page when new data is fetched and clear refresh state
  useEffect(() => {
    if (data) {
      setCurrentPage(0);

      // Set a delay before turning off the refreshing state
      // to give users visual feedback that something happened
      if (isRefreshing) {
        const timer = setTimeout(() => {
          setIsRefreshing(false);
        }, 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [data, isRefreshing]);

  // Update the block number when new transactions come in
  useEffect(() => {
    if (data?.nodes && data.nodes.length > 0) {
      // Track new transactions
      const currentTxHashes = data.nodes
        .map((tx) => tx.txHash || '')
        .filter((hash) => hash !== '');

      // Check if there are new transactions by comparing with previous ones
      if (prevTransactionsRef.current.length > 0) {
        const newHashes = new Set<string>();

        currentTxHashes.forEach((hash) => {
          if (!prevTransactionsRef.current.includes(hash)) {
            newHashes.add(hash);
          }
        });

        if (newHashes.size > 0) {
          setNewTransactionHashes(newHashes);

          // Clear marked transactions after some time
          setTimeout(() => {
            setNewTransactionHashes(new Set());
          }, 5000);
        }
      }

      // Update reference for next comparison
      prevTransactionsRef.current = currentTxHashes;

      // Get the highest block number from the transactions
      const highestBlockNumber = Math.max(
        ...data.nodes
          .filter((tx) => tx.blockNumber !== undefined)
          .map((tx) => tx.blockNumber || 0)
      );

      if (
        highestBlockNumber > 0 &&
        (!latestBlockRef.current || highestBlockNumber > latestBlockRef.current)
      ) {
        // Show refreshing indicator
        setIsRefreshing(true);
        setLatestBlockNumber(highestBlockNumber);
        latestBlockRef.current = highestBlockNumber;

        // Clear any existing timer
        if (refreshTimerRef.current) {
          clearTimeout(refreshTimerRef.current);
        }

        // Set timer to hide the refreshing indicator after 2 seconds
        refreshTimerRef.current = setTimeout(() => {
          setIsRefreshing(false);
          refreshTimerRef.current = null;
        }, 2000);
      }
    }
  }, [data?.nodes]);

  const handleRefresh = () => {
    setIsRefreshing(true);
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
          <div className='flex items-center gap-4'>
            {latestBlockNumber !== null && (
              <AnimatedBlockNumber value={latestBlockNumber} />
            )}
            <Button
              variant='ghost'
              className='flex items-center text-primary hover:text-primary hover:bg-white/10'
              onClick={handleRefresh}
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  isRefreshing || isFetching ? 'animate-spin' : ''
                }`}
              />
              {isRefreshing || isFetching ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>
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
            <RefreshCw className='h-4 w-4' />
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
        <div className='flex items-center gap-4'>
          {latestBlockNumber !== null && (
            <AnimatedBlockNumber value={latestBlockNumber} />
          )}
          <Button
            variant='ghost'
            className='flex items-center text-primary hover:text-primary hover:bg-[#1a1a1a] cursor-pointer'
            onClick={handleRefresh}
            disabled={isFetching}
          >
            <RefreshCw
              className={`h-4 w-4 ${
                isRefreshing || isFetching ? 'animate-spin' : ''
              }`}
            />
            {isRefreshing || isFetching ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </div>

      <div className='overflow-x-auto rounded-md border border-white/10 overflow-hidden'>
        <Table>
          <TableHeader>
            <TableRow className='border-b border-white/10 bg-secondary'>
              <TableHead className='text-white/80 font-medium'>
                BLOCK #
              </TableHead>
              <TableHead className='text-white/80 font-medium mr-2'>
                HASH
              </TableHead>
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
              <AnimatedTransactionRow
                key={`${tx.txHash || 'unknown'}-${startIndex + index}`}
                tx={tx}
                index={index}
                startIndex={startIndex}
                isNew={tx.txHash ? newTransactionHashes.has(tx.txHash) : false}
              />
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

// Skeleton loader for transaction table
const TransactionTableSkeleton = () => {
  return (
    <div>
      <div className='flex justify-between items-center mb-4'>
        <Skeleton className='h-8 w-48' />
        <div className='flex gap-4'>
          <Skeleton className='h-8 w-24' />
          <Skeleton className='h-8 w-24' />
        </div>
      </div>

      <div className='overflow-x-auto rounded-md border border-white/10 overflow-hidden'>
        <Table>
          <TableHeader>
            <TableRow className='border-b border-white/10 bg-secondary'>
              <TableHead className='text-white/10 font-medium'>
                <Skeleton className='h-4 w-16' />
              </TableHead>
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
                    <Skeleton className='h-6 w-16' />
                  </TableCell>
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
