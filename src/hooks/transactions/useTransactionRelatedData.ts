import { getTransactionRelatedData } from '@/lib/api/transactions';
import {
  DataSubmissionNode,
  EventNode,
  TransferEntityNode,
} from '@/types/graphql';
import { useQuery, UseQueryResult } from '@tanstack/react-query';

interface TransactionResult {
  events: Array<EventNode>;
  transfers: Array<TransferEntityNode>;
  dataSubmissions: Array<DataSubmissionNode>;
}

// Fetch transaction related data
const fetchTransactionRelatedData = async (
  id: string
): Promise<TransactionResult> => {
  const result = await getTransactionRelatedData(id);

  if (!result) {
    throw new Error('Data not found');
  }
  return result;
};

// Transaction details hook
export function useTransactionRelatedData(
  id: string | undefined
): UseQueryResult<TransactionResult, Error> {
  return useQuery({
    queryKey: ['transaction-related-data', id],
    queryFn: () => fetchTransactionRelatedData(id as string),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // Consider data stale after 5 minutes
  });
}
