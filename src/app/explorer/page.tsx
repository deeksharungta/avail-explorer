'use client';

import StatCard from '@/components/explorer/StatCard';
import TransactionTable from '@/components/explorer/TransactionTable';

const networkStats = {
  totalBlobSize: '128.45 GB',
  latestBlock: '#7839452',
  totalTransactions: '245,893',
  activeUsers: '15,734',
};

const recentTransactions = [
  {
    hash: '0x8e7a...3b2c',
    method: 'Transfer',
    module: 'Tokens',
    status: 'completed',
  },
  {
    hash: '0x4d2c...9f7a',
    method: 'DataSubmit',
    module: 'Data',
    status: 'pending',
  },
  {
    hash: '0x3a1b...7c5d',
    method: 'Stake',
    module: 'Staking',
    status: 'completed',
  },
  {
    hash: '0x5e2f...1d4a',
    method: 'Vote',
    module: 'Governance',
    status: 'failed',
  },
  {
    hash: '0x7b3c...6e5f',
    method: 'Transfer',
    module: 'Tokens',
    status: 'completed',
  },
  // Additional 5 transactions for second page
  {
    hash: '0x9a2b...4c7d',
    method: 'Delegate',
    module: 'Governance',
    status: 'completed',
  },
  {
    hash: '0x1d3f...8e6a',
    method: 'Claim',
    module: 'Rewards',
    status: 'pending',
  },
  {
    hash: '0x6c4b...2a9d',
    method: 'DataUpdate',
    module: 'Data',
    status: 'completed',
  },
  {
    hash: '0x2e7f...5b3c',
    method: 'Transfer',
    module: 'Tokens',
    status: 'failed',
  },
  {
    hash: '0xf1e2...d8c9',
    method: 'Unstake',
    module: 'Staking',
    status: 'completed',
  },
];

export default function ExplorerPage() {
  return (
    <div className='w-full mx-auto px-4 py-8 max-w-5xl'>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8'>
        <StatCard title='Total Blob Size' value={networkStats.totalBlobSize} />
        <StatCard title='Latest Block' value={networkStats.latestBlock} />
        <StatCard
          title='Total Transactions'
          value={networkStats.totalTransactions}
        />
        <StatCard title='Active Users' value={networkStats.activeUsers} />
      </div>
      <TransactionTable transactions={recentTransactions} />
    </div>
  );
}
