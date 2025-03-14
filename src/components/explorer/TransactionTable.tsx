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
import React, { useState } from 'react';

export interface Transaction {
  hash: string;
  method: string;
  module: string;
  status: 'completed' | 'pending' | 'failed' | string;
}

interface StatusIndicatorProps {
  status: Transaction['status'];
}

interface TransactionTableProps {
  transactions: Transaction[];
}

export default function TransactionTable({
  transactions,
}: TransactionTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const transactionsPerPage = 5;
  const totalPages = Math.ceil(transactions.length / transactionsPerPage);

  // Get current transactions
  const indexOfLastTransaction = currentPage * transactionsPerPage;
  const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;
  const currentTransactions = transactions.slice(
    indexOfFirstTransaction,
    indexOfLastTransaction
  );

  // Change page
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

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

  return (
    <div>
      <div className='flex justify-between items-center mb-4'>
        <h2 className='text-xl font-semibold text-white'>
          Recent Transactions
        </h2>
        <Button
          variant='ghost'
          className='flex items-center text-primary hover:text-primary hover:bg-[#1a1a1a] cursor-pointer'
          onClick={() => setCurrentPage(1)}
        >
          <RefreshCw className='h-4 w-4' />
          Refresh
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
                STATUS
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentTransactions.map((tx, index) => (
              <TableRow
                key={index}
                className='border-b border-white/10 hover:bg-secondary bg-black transition-colors'
              >
                <TableCell className='font-mono text-white'>
                  {tx.hash}
                </TableCell>
                <TableCell className='text-white'>{tx.method}</TableCell>
                <TableCell className='text-white'>{tx.module}</TableCell>
                <TableCell>
                  <StatusIndicator status={tx.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className='flex justify-between items-center mt-4'>
        <div className='text-sm text-gray-400'>
          Showing {indexOfFirstTransaction + 1}-
          {Math.min(indexOfLastTransaction, transactions.length)} of{' '}
          {transactions.length} transactions
        </div>
        <div className='flex space-x-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={prevPage}
            disabled={currentPage === 1}
            className='flex items-center border-white/10 bg-secondary hover:bg-secondary/80 text-white'
          >
            <ChevronLeft className='h-4 w-4 mr-1' />
            Previous
          </Button>
          <Button
            variant='outline'
            size='sm'
            onClick={nextPage}
            disabled={currentPage === totalPages}
            className='flex items-center border-white/10 bg-secondary hover:bg-secondary/80 text-white'
          >
            Next
            <ChevronRight className='h-4 w-4 ml-1' />
          </Button>
        </div>
      </div>
    </div>
  );
}
