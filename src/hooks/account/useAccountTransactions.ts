import { useInfiniteQuery } from '@tanstack/react-query';
import { NodeConnection, Extrinsic } from '@/types/graphql';

interface GetAccountTransactionsParams {
  address: string;
  first?: number;
}

// Fetch account transactions with pagination
const fetchAccountTransactions = async ({
  address,
  first = 20,
  pageParam,
}: GetAccountTransactionsParams & { pageParam: string | null }) => {
  const params = new URLSearchParams();
  params.append('first', first.toString());
  if (pageParam) params.append('after', pageParam);

  const response = await fetch(
    `/api/accounts/${address}/transactions?${params.toString()}`
  );
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to fetch account transactions');
  }

  const result = await response.json();
  return result.data as NodeConnection<Extrinsic>;
};

// Infinite query hook for transactions
export function useAccountTransactions({
  address,
  first = 20,
}: GetAccountTransactionsParams) {
  return useInfiniteQuery<NodeConnection<Extrinsic>, Error>({
    queryKey: ['accountTransactions', address, first],
    queryFn: ({ pageParam }) =>
      fetchAccountTransactions({
        address,
        first,
        pageParam: pageParam as string | null,
      }),
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.pageInfo.endCursor,
    enabled: !!address,
    staleTime: 30 * 1000, // Consider data stale after 30 seconds
  });
}
