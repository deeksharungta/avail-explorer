import {
  fetchLatestBlock,
  fetchTotalTransactions,
  fetchTotalBlobs,
  fetchDataSubmissionStats,
} from '@/lib/api/stats';
import { useQuery } from '@tanstack/react-query';

// Hook for fetching latest block
export function useLatestBlock() {
  return useQuery({
    queryKey: ['latestBlock'],
    queryFn: fetchLatestBlock,
  });
}

// Hook for fetching total transactions
export function useTotalTransactions() {
  return useQuery({
    queryKey: ['totalTransactions'],
    queryFn: fetchTotalTransactions,
  });
}

// Hook for fetching total blobs
export function useTotalBlobs() {
  return useQuery({
    queryKey: ['totalBlobs'],
    queryFn: fetchTotalBlobs,
  });
}

// Hook for fetching data submission statistics
export function useDataSubmissionStats() {
  return useQuery({
    queryKey: ['dataSubmissionStats'],
    queryFn: fetchDataSubmissionStats,
  });
}

// Comprehensive chain stats hook
export function useChainStats() {
  const latestBlockQuery = useLatestBlock();
  const totalTransactionsQuery = useTotalTransactions();
  const totalBlobsQuery = useTotalBlobs();
  const dataSubmissionStatsQuery = useDataSubmissionStats();

  return {
    latestBlock: latestBlockQuery.data,
    totalTransactions: totalTransactionsQuery.data?.totalTransactions,
    totalBlobs: totalBlobsQuery.data?.totalBlobs,
    dataSubmissionStats: dataSubmissionStatsQuery.data,
    isLoading:
      latestBlockQuery.isLoading ||
      totalTransactionsQuery.isLoading ||
      totalBlobsQuery.isLoading ||
      dataSubmissionStatsQuery.isLoading,
    error:
      latestBlockQuery.error ||
      totalTransactionsQuery.error ||
      totalBlobsQuery.error ||
      dataSubmissionStatsQuery.error,
  };
}
