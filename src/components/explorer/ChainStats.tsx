'use client';

import React from 'react';
import StatCard from './StatCard';
import { useChainStats } from '@/hooks/stats/useChainStats';

// Skeleton Loader Component
function StatCardSkeleton() {
  return (
    <div className='bg-secondary p-6 rounded-md border border-white/10 animate-pulse'>
      <div className='h-4 bg-white/10 rounded w-2/3 mb-2'></div>
      <div className='h-8 bg-white/10 rounded w-full'></div>
    </div>
  );
}

export default function ChainStats() {
  const {
    latestBlock,
    totalTransactions,
    totalBlobs,
    dataSubmissionStats,
    isLoading,
    error,
  } = useChainStats();

  if (isLoading) {
    return (
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8'>
        {[1, 2, 3, 4].map((item) => (
          <StatCardSkeleton key={item} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8'>
        <div className='col-span-full text-red-500'>
          Error loading chain statistics: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8'>
      <StatCard
        title='Total Blob Size'
        value={dataSubmissionStats?.totalByteSize.toString() || '0'}
      />
      <StatCard title='Latest Block' value={`#${latestBlock?.number || '0'}`} />
      <StatCard
        title='Total Transactions'
        value={totalTransactions?.toString() || '0'}
      />
      <StatCard
        title='Total Data Submissions'
        value={totalBlobs?.toString() || '0'}
      />
    </div>
  );
}
