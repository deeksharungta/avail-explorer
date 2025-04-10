'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle,
  XCircle,
  Loader2,
  Info,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

import { ActionRecord, useActionsStore } from '@/stores/actionStore';
import { useWalletStore } from '@/stores/walletStore';
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@radix-ui/react-tooltip';
import { parseError } from '@/lib/error';
import { formatTimestamp, getTransactionLink } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { useTransactions } from '@/hooks/transactions/useTransactions';
import { ExtrinsicBasicInfo } from '@/types/graphql';

type ActionWithApiData = ActionRecord & { apiData?: ExtrinsicBasicInfo };

export function ActionHistory() {
  const { actions } = useActionsStore();
  const { account } = useWalletStore();
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterType, setFilterType] = useState('all');
  const rowsPerPage = 10;

  // Load action statuses from localStorage on component mount
  const [statusUpdated, setStatusUpdated] = useState(false);

  // Extract transaction hashes from actions
  const transactionHashes = useMemo(
    () =>
      actions
        .filter((action) => Boolean(action.transactionHash))
        .map((action) => action.transactionHash as string),
    [actions]
  );

  // Fetch transaction data from API
  const { data: transactionData, isLoading: isLoadingTransactions } =
    useTransactions(transactionHashes);

  // Track which transactions have been updated to prevent status flicker
  const [updatedTransactions] = useState(new Set());

  // Combine actions with API data
  const enhancedActions = useMemo(
    () =>
      actions.map((action) => {
        // If no transaction hash, return original action
        if (!action.transactionHash || !transactionData) {
          return action;
        }

        const txData = transactionData.find(
          (tx) => tx.hash === action.transactionHash
        );

        // No API data available
        if (!txData) {
          return action;
        }

        // If this transaction was already updated to success/failed,
        // or if the action is already in a final state, don't change the status
        if (
          updatedTransactions.has(action.transactionHash) ||
          action.status === 'success' ||
          action.status === 'failed'
        ) {
          return {
            ...action,
            apiData: txData.apiData,
          };
        }
        let newStatus: 'pending' | 'processing' | 'success' | 'failed' =
          action.status;
        // Only update status if transaction is still pending/processing
        if (
          (action.status === 'pending' || action.status === 'processing') &&
          txData.apiData
        ) {
          const updatedStatus = txData.apiData.success ? 'success' : 'failed';
          updatedTransactions.add(action.transactionHash);
          newStatus = updatedStatus;
        }

        return {
          ...action,
          status: newStatus,
          apiData: txData.apiData,
        };
      }),
    [actions, transactionData, updatedTransactions]
  );

  // Update action store when transaction status changes
  useEffect(() => {
    if (statusUpdated || isLoadingTransactions) return;

    const updateActionStatus = useActionsStore.getState().updateActionStatus;
    let hasUpdates = false;

    enhancedActions.forEach((action) => {
      const originalAction = actions.find((a) => a.id === action.id);

      if (
        originalAction &&
        originalAction.status !== action.status &&
        (originalAction.status === 'pending' ||
          originalAction.status === 'processing')
      ) {
        updateActionStatus(action.id, {
          status: action.status,
          transactionHash: action.transactionHash,
        });

        hasUpdates = true;
      }
    });

    if (hasUpdates) {
      setStatusUpdated(true);
    }
  }, [enhancedActions, actions, statusUpdated, isLoadingTransactions]);

  // Reset status updated flag when transaction data changes
  useEffect(() => {
    if (!isLoadingTransactions && statusUpdated) {
      setStatusUpdated(false);
    }
  }, [transactionData, isLoadingTransactions, statusUpdated]);

  // Filter actions based on type
  const filteredActions = useMemo(
    () =>
      filterType === 'all'
        ? enhancedActions
        : enhancedActions.filter((action) => action.type === filterType),
    [enhancedActions, filterType]
  );

  const paginatedActions = filteredActions.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const totalPages = Math.ceil(filteredActions.length / rowsPerPage);

  // Truncate long addresses or data
  const truncate = (str: string, length = 10) => {
    if (!str) return '';
    return str.length > length ? `${str.slice(0, 6)}...${str.slice(-4)}` : str;
  };

  // Update initial load state when transactions finish loading
  useEffect(() => {
    if (!isLoadingTransactions && isInitialLoad) {
      setIsInitialLoad(false);
    }
  }, [isLoadingTransactions, isInitialLoad]);

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
  const renderValue = (action: ActionWithApiData) => {
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

  // Pagination handlers
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  if (!account) {
    return;
  }

  return (
    <div className='w-full mx-auto'>
      <div className='flex justify-between items-center mb-6'>
        <div className='flex items-center'>
          <h2 className='text-2xl font-bold text-white'>Recent Actions</h2>
          {/* <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className='ml-2 h-4 w-4 cursor-pointer text-white/50 mt-2' />
              </TooltipTrigger>
              <TooltipContent className='bg-secondary border rounded-md border-white/10 p-2 text-white max-w-xs'>
                <p className='text-sm'>
                  Actions are stored in local storage and may be lost if
                  it&apos;s cleared.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider> */}
        </div>
        <Select onValueChange={setFilterType} value={filterType}>
          <SelectTrigger className='w-48 bg-secondary text-white border-white/10 cursor-pointer'>
            <SelectValue placeholder='Filter by type' />
          </SelectTrigger>
          <SelectContent className='bg-background text-white border-white/10 '>
            <SelectItem value='all'>All</SelectItem>
            <SelectItem value='transfer'>Transfer</SelectItem>
            <SelectItem value='data-submit'>Data Submit</SelectItem>
          </SelectContent>
        </Select>
      </div>
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
            {isLoadingTransactions && isInitialLoad ? (
              <TableRow className='border-b border-white/10 hover:bg-transparent py-6'>
                <TableCell colSpan={5} className='text-center text-white/80'>
                  <div className='flex justify-center items-center py-4'>
                    <Loader2 className='h-6 w-6 animate-spin mr-2 text-white/50' />
                    <span>Loading transaction data...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : paginatedActions.length === 0 ? (
              <TableRow className='border-b border-white/10 hover:bg-transparent py-6'>
                <TableCell colSpan={5} className='text-center text-white/80 '>
                  No recent actions
                </TableCell>
              </TableRow>
            ) : (
              paginatedActions.map((action) => (
                <TableRow
                  key={action.id}
                  className={`border-b border-white/10 hover:bg-secondary cursor-pointer ${
                    action.status === 'pending' ? 'bg-secondary/20' : 'bg-black'
                  }`}
                  onClick={
                    action.transactionHash
                      ? () => {
                          window.location.href = getTransactionLink(
                            action.transactionHash || ''
                          );
                        }
                      : undefined
                  }
                >
                  <TableCell>{renderID(action)}</TableCell>
                  <TableCell>{renderTypeWithBadge(action.type)}</TableCell>
                  <TableCell>
                    {renderValue(action as ActionWithApiData)}
                  </TableCell>
                  <TableCell className='text-white'>
                    {formatTimestamp(action.timestamp)}
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
      {/* Pagination Controls */}
      {paginatedActions.length > 0 && (
        <div className='flex justify-between items-center mt-4'>
          <div className='text-white/80 text-sm'>
            Page {currentPage} of {totalPages}
          </div>
          <div className='flex items-center space-x-2'>
            <Button
              variant='outline'
              size='icon'
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              className='bg-secondary border-white/10 text-white hover:bg-white/10 hover:text-white  disabled:opacity-50 cursor-pointer'
            >
              <ChevronLeft className='h-4 w-4' />
            </Button>
            <Button
              variant='outline'
              size='icon'
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className='bg-secondary text-white border-white/10 hover:bg-white/10 hover:text-white disabled:opacity-50 cursor-pointer'
            >
              <ChevronRight className='h-4 w-4' />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
