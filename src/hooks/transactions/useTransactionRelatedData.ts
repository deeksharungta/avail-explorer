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
  try {
    const result = await getTransactionRelatedData(id);
    return result;
  } catch (error) {
    console.error(`Error fetching related data for transaction ${id}:`, error);
    throw error;
  }
};

// Transaction details hook
export function useTransactionRelatedData(
  id: string | undefined
): UseQueryResult<TransactionResult, Error> {
  return useQuery({
    queryKey: ['transaction-related-data', id],
    queryFn: () => fetchTransactionRelatedData(id as string),
    enabled: !!id,
    retry: 3, // Retry up to 3 times for errors
  });
}
