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
import { useActions } from '@/hooks/useActions';
import { formatDistance } from 'date-fns';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';

export function ActionHistory() {
  const { actions } = useActions();
  console.log({ actions });

  // Truncate long addresses or data
  const truncate = (str: string, length = 10) => {
    return str.length > length ? `${str.slice(0, 6)}...${str.slice(-4)}` : str;
  };

  // Render status badge
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge>Completed</Badge>;
      case 'pending':
        return <Badge>Pending</Badge>;
      case 'failed':
        return <Badge variant='destructive'>Failed</Badge>;
      default:
        return <Badge variant='secondary'>{status}</Badge>;
    }
  };

  // Generate explorer link
  const getExplorerLink = (txHash: string) => {
    return `https://avail-turing.subscan.io/extrinsic/${txHash}`;
  };

  return (
    <div className='w-full max-w-4xl mx-auto'>
      <h2 className='text-xl font-semibold mb-4'>Recent Actions</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Type</TableHead>
            <TableHead>Details</TableHead>
            <TableHead>Time</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {actions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className='text-center'>
                No recent actions
              </TableCell>
            </TableRow>
          ) : (
            actions.map((action) => (
              <TableRow key={action.id}>
                <TableCell>
                  {action.type === 'transfer' ? 'Transfer' : 'Data Submit'}
                </TableCell>
                <TableCell>
                  {action.type === 'transfer'
                    ? `${action.details.amount} AVAIL to ${truncate(
                        action.details.recipient || ''
                      )}`
                    : truncate(action.details.data || '', 20)}
                </TableCell>
                <TableCell>
                  {formatDistance(action.timestamp, new Date(), {
                    addSuffix: true,
                  })}
                </TableCell>
                <TableCell>{renderStatusBadge(action.status)}</TableCell>
                <TableCell>
                  {action.transactionHash && (
                    <Link
                      href={getExplorerLink(action.transactionHash)}
                      target='_blank'
                      className='hover:bg-gray-100 p-2 rounded-full inline-flex items-center'
                      title='View in Explorer'
                    >
                      <ExternalLink size={16} />
                    </Link>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
