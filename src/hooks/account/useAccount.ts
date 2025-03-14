import { useQuery, useQueryClient } from '@tanstack/react-query';

// API helpers
const fetchAccountById = async (address: string) => {
  const response = await fetch(`/api/accounts/${address}`);
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to fetch account details');
  }
  const result = await response.json();
  return result.data;
};

// Account detail hook
export function useAccount(address: string | undefined) {
  return useQuery({
    queryKey: ['account', address],
    queryFn: () => fetchAccountById(address as string),
    enabled: !!address, // Only fetch if address is provided
    staleTime: 60 * 1000, // Consider data stale after 1 minute
  });
}

// Prefetch account data (useful for navigation)
export function usePrefetchAccount() {
  const queryClient = useQueryClient();

  return (address: string) => {
    if (address) {
      queryClient.prefetchQuery({
        queryKey: ['account', address],
        queryFn: () => fetchAccountById(address),
        staleTime: 60 * 1000,
      });
    }
  };
}
