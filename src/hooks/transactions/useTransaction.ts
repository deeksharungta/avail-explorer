import { getTransactionByHash } from '@/lib/api/transactions';
import { ExtrinsicWithRelations } from '@/types/graphql';
import { useQuery, UseQueryResult } from '@tanstack/react-query';

// Fetch transaction by hash with related data
const fetchTransactionByHash = async (
  hash: string
): Promise<ExtrinsicWithRelations | null> => {
  try {
    const transaction = await getTransactionByHash(hash);
    return transaction;
  } catch (error) {
    console.error(`Error fetching transaction ${hash}:`, error);
    throw error;
  }
};

// Transaction details hook
export function useTransaction(
  hash: string | undefined
): UseQueryResult<ExtrinsicWithRelations | null, Error> {
  return useQuery({
    queryKey: ['transaction', hash],
    queryFn: () => fetchTransactionByHash(hash as string),
    enabled: !!hash,
    retry: 3, // Retry up to 3 times for errors
  });
}
