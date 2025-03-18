import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useCallback } from 'react';
import { getTransactionsByHashes } from '@/lib/api/transactions';
import { ExtrinsicBasicInfo } from '@/types/graphql';
import { ActionRecord, useActionsStore } from '@/stores/actionStore';

// Configuration for background sync
interface BackgroundSyncConfig {
  interval?: number; // Sync interval in milliseconds
  maxAgeMinutes?: number; // Maximum age of pending transactions to sync
}

// Default configuration
const DEFAULT_SYNC_CONFIG: BackgroundSyncConfig = {
  interval: 30000, // 30 seconds
  maxAgeMinutes: 60, // 1 hour
};

// Type definitions for the hook return values
interface TransactionData {
  hash: string;
  apiData: ExtrinsicBasicInfo | null;
  localData: ActionRecord | null;
  status: string;
  data: Record<string, unknown>;
}

interface UseTransactionsReturn {
  data: TransactionData[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

// Custom hook for handling transaction data from both API and local state
export function useTransactions(
  hashes: string[] | undefined,
  backgroundSyncConfig: BackgroundSyncConfig = DEFAULT_SYNC_CONFIG
): UseTransactionsReturn {
  // Access store values
  const actions = useActionsStore((state) => state.actions);
  const updateActionStatus = useActionsStore(
    (state) => state.updateActionStatus
  );
  const queryClient = useQueryClient();

  // Filter out invalid hashes and ensure uniqueness
  const validHashes = useMemo(() => {
    if (!hashes?.length) return [];
    return [...new Set(hashes.filter(Boolean))];
  }, [hashes]);

  // Determine which hashes need API fetch (only pending or processing)
  const hashesToFetch = useMemo(() => {
    return validHashes.filter((hash) => {
      const localTx = actions.find(
        (action) => action.transactionHash === hash || action.id === hash
      );
      return (
        localTx &&
        (localTx.status === 'pending' || localTx.status === 'processing')
      );
    });
  }, [actions, validHashes]);

  // Fetch transaction data from API
  const apiQuery = useQuery({
    queryKey: ['multiple-transactions', hashesToFetch],
    queryFn: () =>
      hashesToFetch.length > 0
        ? fetchTransactionsByHashes(hashesToFetch)
        : Promise.resolve([]),
    staleTime: 30000, // 30 seconds
    refetchInterval:
      backgroundSyncConfig.interval || DEFAULT_SYNC_CONFIG.interval,
    enabled: hashesToFetch.length > 0, // Only run the query if there are hashes to fetch
  });

  // Find local transactions
  const localTransactions = useMemo(() => {
    const result: Record<string, ActionRecord | null> = {};

    validHashes.forEach((hash) => {
      result[hash] =
        actions.find(
          (action) => action.transactionHash === hash || action.id === hash
        ) || null;
    });

    return result;
  }, [actions, validHashes]);

  // Background sync function
  const performBackgroundSync = useCallback(async () => {
    try {
      // Filter pending transactions within the max age
      const pendingTransactions = actions.filter((action) => {
        // Check if transaction is pending
        const isPending =
          action.status === 'pending' || action.status === 'processing';

        // Check transaction age
        const transactionAge =
          Date.now() - new Date(action.timestamp).getTime();
        const maxAgeMs = (backgroundSyncConfig.maxAgeMinutes || 60) * 60 * 1000;

        return isPending && transactionAge < maxAgeMs;
      });

      // Extract unique transaction hashes
      const transactionHashes = [
        ...new Set(
          pendingTransactions
            .map((tx) => tx.transactionHash)
            .filter(Boolean) as string[]
        ),
      ];

      // No pending transactions to sync
      if (transactionHashes.length === 0) {
        return;
      }

      // Fetch transaction statuses from API
      const transactions = await fetchTransactionsByHashes(transactionHashes);

      // Prepare and apply updates
      transactions.forEach((tx) => {
        const matchingAction = pendingTransactions.find(
          (action) => action.transactionHash === tx.txHash
        );

        if (matchingAction) {
          const newStatus = tx.success ? 'success' : 'failed';

          // Only update if status has changed and is still in a pending state
          if (
            matchingAction.status !== newStatus &&
            (matchingAction.status === 'pending' ||
              matchingAction.status === 'processing')
          ) {
            updateActionStatus(matchingAction.id, {
              status: newStatus,
              transactionHash: tx.txHash,
            });
          }
        }
      });

      // Update query data to avoid unnecessary refetches
      queryClient.setQueryData(
        ['multiple-transactions', transactionHashes],
        transactions
      );
    } catch (error) {
      console.error('Background sync error:', error);
    }
  }, [actions, updateActionStatus, queryClient, backgroundSyncConfig]);

  // Initial and periodic background sync
  useEffect(() => {
    // Immediate initial sync for pending transactions
    performBackgroundSync();
  }, [performBackgroundSync]);

  // Combine API and local data
  const combinedData = useMemo((): TransactionData[] => {
    if (!apiQuery.data && !Object.keys(localTransactions).length) return [];

    return validHashes.map((hash) => {
      const apiTransaction =
        apiQuery.data?.find((tx) => tx.txHash === hash) || null;
      const localTransaction = localTransactions[hash];

      // Only update status if the local transaction is still pending/processing
      let status = localTransaction?.status || 'pending';

      if (
        localTransaction &&
        (localTransaction.status === 'pending' ||
          localTransaction.status === 'processing') &&
        apiTransaction?.success !== undefined
      ) {
        status = apiTransaction.success ? 'success' : 'failed';
      }

      return {
        hash,
        apiData: apiTransaction,
        localData: localTransaction,
        status,
        data: {
          ...(localTransaction?.details || {}),
          ...(apiTransaction || {}),
          status,
        },
      };
    });
  }, [apiQuery.data, validHashes, localTransactions]);

  return {
    data: combinedData,
    isLoading: apiQuery.isLoading,
    error: apiQuery.error as Error | null,
    refetch: apiQuery.refetch,
  };
}

// Helper function to fetch multiple transactions
async function fetchTransactionsByHashes(
  hashes: string[]
): Promise<ExtrinsicBasicInfo[]> {
  if (!hashes.length) return [];

  try {
    return await getTransactionsByHashes(hashes);
  } catch (error) {
    console.error('Error fetching multiple transactions:', error);
    throw error;
  }
}
