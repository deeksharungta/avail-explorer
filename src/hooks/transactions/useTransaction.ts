import { useQuery } from '@tanstack/react-query';

// Fetch transaction by hash
const fetchTransactionByHash = async (hash: string) => {
  const response = await fetch(`/api/transactions/${hash}`);
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to fetch transaction details');
  }

  const result = await response.json();
  return result.data;
};

// Transaction details hook
export function useTransaction(hash: string | undefined) {
  return useQuery({
    queryKey: ['transaction', hash],
    queryFn: () => fetchTransactionByHash(hash as string),
    enabled: !!hash,
    staleTime: 5 * 60 * 1000, // Consider data stale after 5 minutes
  });
}
