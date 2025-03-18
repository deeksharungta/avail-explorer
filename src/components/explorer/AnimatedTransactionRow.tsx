import React, { useEffect, useState } from 'react';
import { TableRow, TableCell } from '@/components/ui/table';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import { formatDate, getTransactionLink } from '@/lib/utils';

interface AnimatedTransactionRowProps {
  tx: {
    txHash?: string;
    blockNumber?: number;
    call?: string;
    module?: string;
    timestamp: string;
    success?: boolean;
  };
  index: number;
  startIndex: number;
  isNew?: boolean;
}

const AnimatedTransactionRow: React.FC<AnimatedTransactionRowProps> = ({
  tx,
  index,
  startIndex,
  isNew = false,
}) => {
  const [animating, setAnimating] = useState(isNew);

  useEffect(() => {
    if (isNew) {
      setAnimating(true);
      const timer = setTimeout(() => {
        setAnimating(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isNew, tx.txHash]);

  return (
    <TableRow
      onClick={
        tx.txHash
          ? () => {
              window.location.href = getTransactionLink(tx.txHash || '');
            }
          : undefined
      }
      key={`${tx.txHash || 'unknown'}-${startIndex + index}`}
      className={`border-b border-white/10 hover:bg-secondary bg-black transition-all ease-in-out duration-700 cursor-pointer ${
        animating ? 'bg-white/10' : ''
      }`}
    >
      <TableCell className='text-white'>{tx.blockNumber || 'N/A'}</TableCell>
      <TableCell className='font-mono text-white truncate max-w-20'>
        {tx.txHash}
      </TableCell>
      <TableCell className='text-white'>{tx.call || 'N/A'}</TableCell>
      <TableCell className='text-white'>{tx.module || 'N/A'}</TableCell>
      <TableCell className='text-white whitespace-nowrap'>
        {formatDate(tx.timestamp)}
      </TableCell>
      <TableCell>
        <StatusIndicator status={tx.success ? 'completed' : 'failed'} />
      </TableCell>
    </TableRow>
  );
};

// Status indicator component
const StatusIndicator = ({ status }: { status: string }) => {
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

export default AnimatedTransactionRow;
