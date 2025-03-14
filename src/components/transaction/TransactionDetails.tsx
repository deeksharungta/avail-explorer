'use client';

import React from 'react';
import { CheckCircle, XCircle, Copy, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ErrorCard from '@/components/transaction/ErrorCard';
import EventsTab from '@/components/transaction/EventsTab';
import ExtrinsicDetailsTab from '@/components/transaction/ExtrinsicDetailsTab';
import ExtrinsicOverview from '@/components/transaction/ExtrinsicOverview';
// import NoTransactionFound from '@/components/transaction/NoTransactionFound';
import RawDataTab from '@/components/transaction/RawDataTab';
import { formatDate, copyToClipboard } from '@/lib/utils';
// import { useTransaction } from '@/hooks/transactions/useTransaction';

export interface Extrinsic {
  id: string;
  blockId: string;
  module: string;
  call: string;
  timestamp: string;
  txHash: string;
  blockHeight: number;
  success: boolean;
  isSigned: boolean;
  extrinsicIndex: number;
  hash: string;
  signer: string;
  signature: string;
  fees: string | null;
  feesRounded: number | null;
  nonce: number;
  argsName: Record<string, unknown>;
  argsValue: Record<string, unknown>;
  nbEvents: number;
}

export interface Event {
  id: string;
  name: string;
  extrinsicId: string;
  blockId: string;
  module: string;
  eventIndex: number;
  phase: string;
  params: Record<string, unknown>[];
}

interface TransactionDetailsProps {
  txHash: string;
}

// Mock extrinsic data
const mockExtrinsic: Extrinsic = {
  id: 'extrinsic-123',
  blockId: 'block-7839423',
  module: 'Tokens',
  call: 'Transfer',
  timestamp: '2025-03-14T15:30:45Z',
  txHash: '0x8e7a82b5f35c1532a55a11a3b8dca7b3c54d3a44215e8fa9d1a942153fe3b2c',
  blockHeight: 7839423,
  success: true,
  isSigned: true,
  extrinsicIndex: 2,
  hash: '0x8e7a82b5f35c1532a55a11a3b8dca7b3c54d3a44215e8fa9d1a942153fe3b2c',
  signer: '0x4d2cF54aB3E548aBc48e9A65a3f4a5b6c7d8e9f0',
  signature:
    '0x8e7a82b5f35c1532a55a11a3b8dca7b3c54d3a44215e8fa9d1a942153fe3b2c4d2cF54aB3E548aBc48e9A65a3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f1b',
  fees: '0.000525',
  feesRounded: 0.000525,
  nonce: 42,
  argsName: {
    dest: 'AccountId',
    value: 'Balance',
    memo: 'String',
  },
  argsValue: {
    dest: '0x8e7a82b5f35c1532a55a11a3b8dca7b3c54d3a44',
    value: '1500000000000000000',
    memo: 'Payment for services',
  },
  nbEvents: 2,
};

// Mock events for the extrinsic
const mockEvents: Event[] = [
  {
    id: 'event-1',
    name: 'Transfer',
    extrinsicId: 'extrinsic-123',
    blockId: 'block-7839423',
    module: 'Tokens',
    eventIndex: 0,
    phase: 'ApplyExtrinsic',
    params: [
      {
        name: 'from',
        type: 'AccountId',
        value: '0x4d2cF54aB3E548aBc48e9A65a3f4a5b6c7d8e9f0',
      },
      {
        name: 'to',
        type: 'AccountId',
        value: '0x8e7a82b5f35c1532a55a11a3b8dca7b3c54d3a44',
      },
      {
        name: 'amount',
        type: 'Balance',
        value: '1500000000000000000',
      },
    ],
  },
  {
    id: 'event-2',
    name: 'ExtrinsicSuccess',
    extrinsicId: 'extrinsic-123',
    blockId: 'block-7839423',
    module: 'System',
    eventIndex: 1,
    phase: 'ApplyExtrinsic',
    params: [
      {
        name: 'dispatchInfo',
        type: 'DispatchInfo',
        value: {
          weight: '200000000',
          class: 'Normal',
          paysFee: 'Yes',
        },
      },
    ],
  },
];

// Mock error for failed extrinsics
const mockError = {
  module: 'System',
  name: 'ExtrinsicFailed',
  details: 'The transaction ran out of gas before it could be completed.',
  stackTrace:
    'at Tokens.transfer (0x8e7a...3b2c:42)\nat Transaction.execute (0x8e7a...3b2c:15)',
};

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
  const result = {
    extrinsic: mockExtrinsic,
    events: mockEvents,
    error: mockError,
  };

  console.log({ txHash });

  // if (isLoading) {
  //   return (
  //     <div className='w-full mx-auto px-4 py-16 max-w-5xl text-center'>
  //       <div className='bg-secondary border-white/10 rounded-md p-8'>
  //         <div className='animate-pulse flex flex-col items-center'>
  //           <div className='h-12 w-12 bg-white/10 rounded-full mb-4'></div>
  //           <div className='h-6 w-64 bg-white/10 rounded mb-4'></div>
  //           <div className='h-4 w-48 bg-white/10 rounded'></div>
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

  // Check if no transaction was found
  // if (isError || !data) {
  //   return <NoTransactionFound hash={txHash} />;
  // }
  const { extrinsic, events, error } = result;

  return (
    <div className='w-full mx-auto px-4 py-8 max-w-5xl'>
      <div className='flex items-center justify-between mb-6'>
        <div>
          <h1 className='text-2xl font-bold text-white mb-2'>
            Extrinsic Details
          </h1>
          <div className='flex items-center space-x-2'>
            <StatusIndicator success={extrinsic.success} />
            <span className='text-gray-400 text-sm'>
              {formatDate(extrinsic.timestamp)}
            </span>
          </div>
        </div>
        <div className='flex space-x-2'>
          <Button
            variant='outline'
            size='sm'
            className='flex items-center border-white/10 bg-secondary text-white hover:bg-white/10 cursor-pointer hover:text-white'
            onClick={() => copyToClipboard(extrinsic.hash)}
          >
            <Copy className='mr-1 h-4 w-4' />
            Copy Hash
          </Button>
          <Button
            variant='outline'
            size='sm'
            className='flex items-center border-white/10 bg-secondary text-white hover:bg-white/10 cursor-pointer hover:text-white'
          >
            <ExternalLink className='mr-1 h-4 w-4' />
            View on Explorer
          </Button>
        </div>
      </div>

      <ExtrinsicOverview extrinsic={extrinsic} />

      <Tabs defaultValue='details' className='mb-6'>
        <TabsList className='bg-secondary border-white/10 text-white/60'>
          <TabsTrigger value='details'>Details</TabsTrigger>
          <TabsTrigger value='events'>
            Events ({extrinsic.nbEvents})
          </TabsTrigger>
          <TabsTrigger value='raw'>Raw Data</TabsTrigger>
        </TabsList>

        <TabsContent value='details'>
          <ExtrinsicDetailsTab extrinsic={extrinsic} />
        </TabsContent>

        <TabsContent value='events'>
          <EventsTab events={events} />
        </TabsContent>

        <TabsContent value='raw'>
          <RawDataTab extrinsic={extrinsic} />
        </TabsContent>
      </Tabs>

      {!extrinsic.success && error && <ErrorCard error={error} />}
    </div>
  );
}
