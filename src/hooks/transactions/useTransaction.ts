import { getTransactionByHash } from '@/lib/api/transactions';
import { ExtrinsicWithRelations } from '@/types/graphql';
import { useQuery, UseQueryResult } from '@tanstack/react-query';

// Fetch transaction by hash with related data
const fetchTransactionByHash = async (
  hash: string
): Promise<ExtrinsicWithRelations> => {
  const transaction = await getTransactionByHash(hash);

  if (!transaction) {
    throw new Error('Transaction not found');
  }
  return transaction;
};

// Transaction details hook
export function useTransaction(
  hash: string | undefined
): UseQueryResult<ExtrinsicWithRelations, Error> {
  return useQuery({
    queryKey: ['transaction', hash],
    queryFn: () => fetchTransactionByHash(hash as string),
    enabled: !!hash,
    retry: 3,
  });
}
