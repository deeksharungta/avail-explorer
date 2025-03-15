'use client';

import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Loader2, Info } from 'lucide-react';

import { ActionRecord, useActionsStore } from '@/stores/actionStore';
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@radix-ui/react-tooltip';
import { parseError } from '@/lib/error';
import { getTransactionLink } from '@/lib/utils';

export function ActionHistory() {
  const { actions } = useActionsStore();

  // Truncate long addresses or data
  const truncate = (str: string, length = 10) => {
    if (!str) return '';
    return str.length > length ? `${str.slice(0, 6)}...${str.slice(-4)}` : str;
  };

  // Format timestamp to show time
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  // Render transaction type with badge
  const renderTypeWithBadge = (type: string) => {
    return (
      <div>
        {type === 'transfer' ? (
          <Badge className='bg-blue-950 text-white px-3 py-1 rounded-full'>
            TRANSFER
          </Badge>
        ) : (
          <Badge className='bg-purple-900 text-white px-3 py-1 rounded-full'>
            DATA SUBMIT
          </Badge>
        )}
      </div>
    );
  };

  // Render status with icon
  const renderStatus = (status: string, error: string | undefined) => {
    switch (status) {
      case 'success':
        return (
          <div className='flex items-center text-green-500 font-medium'>
            <CheckCircle className='mr-2 h-5 w-5' />
            COMPLETED
          </div>
        );
      case 'pending':
        return (
          <div className='flex items-center text-yellow-500 font-medium'>
            <Loader2 className='mr-2 h-5 w-5 animate-spin' />
            PROCESSING
          </div>
        );
      case 'processing':
        return (
          <div className='flex items-center text-yellow-500 font-medium'>
            <Loader2 className='mr-2 h-5 w-5 animate-spin' />
            PROCESSING
          </div>
        );
      case 'failed':
        return (
          <div className='flex items-center text-red-500 font-medium'>
            <XCircle className='mr-2 h-5 w-5' />
            FAILED
            {error && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className='ml-2 h-4 w-4 cursor-pointer text-red-500' />
                  </TooltipTrigger>
                  <TooltipContent className='bg-secondary border rounded-md border-white/10 p-2 text-white max-w-xs'>
                    <p className='text-sm'>{parseError(error)}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        );

      default:
        return <div>{status}</div>;
    }
  };

  // Render value based on action type
  const renderValue = (action: ActionRecord) => {
    if (action.type === 'transfer') {
      return (
        <div>
          <div className='text-lg font-medium text-white'>
            {action.details.amount}
          </div>
          <div className='text-sm text-gray-400'>
            To: {truncate(action.details.recipient || '', 15)}
          </div>
        </div>
      );
    } else {
      return (
        <div className='text-white'>
          {truncate(action.details.data || '', 20)}
        </div>
      );
    }
  };

  // Render ID with pending indicator if needed
  const renderID = (action: ActionRecord) => {
    const isPending = action.status === 'pending';
    const id = action.transactionHash || action.id || '0x';

    return (
      <div className='font-mono text-sm text-white flex items-center'>
        {isPending && action.id.startsWith('pending-') ? (
          <span className='italic text-yellow-400'>Processing...</span>
        ) : (
          truncate(id, 15)
        )}
      </div>
    );
  };

  return (
    <div className='w-full mx-auto'>
      <h2 className='text-2xl font-bold mb-6 text-white'>Recent Actions</h2>
      <div className='rounded-md border border-white/10 overflow-hidden'>
        <Table>
          <TableHeader>
            <TableRow className='border-b border-white/10 bg-secondary hover:bg-secondary'>
              <TableHead className='text-white/80 font-medium'>ID</TableHead>
              <TableHead className='text-white/80 font-medium'>TYPE</TableHead>
              <TableHead className='text-white/80 font-medium'>VALUE</TableHead>
              <TableHead className='text-white/80 font-medium'>TIME</TableHead>
              <TableHead className='text-white/80 font-medium'>
                STATUS
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {actions.length === 0 ? (
              <TableRow className='border-b border-white/10 hover:bg-transparent py-6'>
                <TableCell colSpan={5} className='text-center text-white/80 '>
                  No recent actions
                </TableCell>
              </TableRow>
            ) : (
              actions.map((action) => (
                <TableRow
                  key={action.id}
                  className={`border-b border-white/10 hover:bg-secondary cursor-pointer ${
                    action.status === 'pending' ? 'bg-secondary/20' : 'bg-black'
                  }`}
                  onClick={
                    action.transactionHash
                      ? () => {
                          window.open(
                            getTransactionLink(action.transactionHash || ''),
                            '_blank'
                          );
                        }
                      : undefined
                  }
                >
                  <TableCell>{renderID(action)}</TableCell>
                  <TableCell>{renderTypeWithBadge(action.type)}</TableCell>
                  <TableCell>{renderValue(action)}</TableCell>
                  <TableCell className='text-white'>
                    {formatTime(action.timestamp)}
                  </TableCell>
                  <TableCell>
                    {renderStatus(action.status, action?.error)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
