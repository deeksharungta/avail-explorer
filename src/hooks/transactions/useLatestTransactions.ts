import { useQuery } from '@tanstack/react-query';
import { LatestTransactionsResponse } from '@/types/graphql';

// Fetch latest transactions (10 at once)
const fetchLatestTransactions =
  async (): Promise<LatestTransactionsResponse> => {
    const response = await fetch('/api/transactions?first=10');

    if (!response.ok) {
      throw new Error('Failed to fetch latest transactions');
    }

    const data = await response.json();
    console.log({ data });

    return {
      extrinsics: data.data,
    };
  };

// Latest transactions hook
export function useLatestTransactions() {
  return useQuery<LatestTransactionsResponse, Error>({
    queryKey: ['latestTransactions', { fresh: true }],
    queryFn: fetchLatestTransactions,
    refetchInterval: 20 * 1000, // Poll every 20 seconds
    refetchOnWindowFocus: false,
    staleTime: 10 * 1000,
  });
}
