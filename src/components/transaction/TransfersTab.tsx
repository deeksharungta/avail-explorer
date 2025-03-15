import React from 'react';
import { ArrowRightLeft, Send, Download, Clock } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { TransferEntityNode } from '@/types/graphql';
import { Card, CardContent } from '@/components/ui/card';

interface TransferTabProps {
  transfers: TransferEntityNode[];
}

export default function TransfersTab({ transfers }: TransferTabProps) {
  return (
    <Card className='bg-secondary/70 border-white/20 shadow-lg'>
      <CardContent className='py-6'>
        <h3 className='text-lg font-medium mb-6 text-white flex items-center'>
          <ArrowRightLeft className='h-5 w-5 mr-2 text-blue-400' />
          Transfers
        </h3>
        <div className='space-y-6'>
          {transfers.map((transfer) => (
            <div
              key={transfer.id}
              className='bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-all'
            >
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='flex items-center space-x-3'>
                  <Send className='h-5 w-5 text-green-400 flex-shrink-0' />
                  <div>
                    <p className='text-sm text-white/60'>From</p>
                    <p className='text-sm font-mono break-all'>
                      {transfer.from}
                    </p>
                  </div>
                </div>
                <div className='flex items-center space-x-3'>
                  <Download className='h-5 w-5 text-blue-400 flex-shrink-0' />
                  <div>
                    <p className='text-sm text-white/60'>To</p>
                    <p className='text-sm font-mono break-all'>{transfer.to}</p>
                  </div>
                </div>
                <div className='flex items-center space-x-3'>
                  <ArrowRightLeft className='h-5 w-5 text-purple-400 flex-shrink-0' />
                  <div>
                    <p className='text-sm text-white/60'>Amount</p>
                    <p className='text-sm font-medium'>
                      {transfer.amount} {transfer.currency}
                    </p>
                  </div>
                </div>
                <div className='flex items-center space-x-3'>
                  <Clock className='h-5 w-5 text-orange-400 flex-shrink-0' />
                  <div>
                    <p className='text-sm text-white/60'>Time</p>
                    <p className='text-sm'>{formatDate(transfer.timestamp)}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        {transfers.length === 0 && (
          <div className='text-center text-white/60 py-8 flex flex-col items-center'>
            <ArrowRightLeft className='h-12 w-12 text-blue-400 mb-4' />
            <p>No transfers found</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
