import { useQuery } from '@tanstack/react-query';

// Fetch transaction volume
const fetchTransactionVolume = async (timeframe: number) => {
  const response = await fetch(
    `/api/stats/transactions-volume?timeframe=${timeframe}`
  );
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      errorData.error || 'Failed to fetch transaction volume data'
    );
  }

  const result = await response.json();
  return result.data;
};

// Transaction volume hook
export function useTransactionVolume(timeframe = 7) {
  return useQuery({
    queryKey: ['transactionVolume', timeframe],
    queryFn: () => fetchTransactionVolume(timeframe),
    staleTime: 5 * 60 * 1000, // Consider data stale after 5 minutes
  });
}
