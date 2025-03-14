import { useInfiniteQuery } from '@tanstack/react-query';
import { NodeConnection, Extrinsic } from '@/types/graphql';

interface GetTransactionsParams {
  first?: number;
}

// Fetch latest transactions with pagination
const fetchLatestTransactions = async ({
  first = 20,
  pageParam,
}: GetTransactionsParams & { pageParam: string | null }) => {
  const params = new URLSearchParams();
  params.append('first', first.toString());
  if (pageParam) params.append('after', pageParam);

  const response = await fetch(`/api/transactions/latest?${params.toString()}`);
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to fetch latest transactions');
  }

  const result = await response.json();
  return result.data as NodeConnection<Extrinsic>;
};

// Latest transactions hook with infinite query
export function useLatestTransactions(first = 20) {
  return useInfiniteQuery<NodeConnection<Extrinsic>, Error>({
    queryKey: ['latestTransactions', first],
    queryFn: ({ pageParam }) =>
      fetchLatestTransactions({ first, pageParam: pageParam as string | null }),
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.pageInfo.endCursor,
    staleTime: 15 * 1000, // Consider data stale after 15 seconds
  });
}
