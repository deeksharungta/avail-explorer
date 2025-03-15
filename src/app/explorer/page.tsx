'use client';

// import ChainStats from '@/components/explorer/ChainStats';
import TransactionTable from '@/components/explorer/TransactionTable';

export default function ExplorerPage() {
  return (
    <div className='w-full mx-auto px-4 py-8 max-w-5xl'>
      {/* <ChainStats /> */}
      <TransactionTable />
    </div>
  );
}
