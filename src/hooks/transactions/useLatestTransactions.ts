import { useInfiniteQuery } from '@tanstack/react-query';
import { NodeConnection, Extrinsic } from '@/types/graphql';
import { getLatestTransactions } from '@/lib/api/transactions';

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

  const transactions = await getLatestTransactions({
    first,
    after: pageParam || undefined,
  });

  return transactions as NodeConnection<Extrinsic>;
};

// Latest transactions hook with infinite query
export function useLatestTransactions(first = 20) {
  return useInfiniteQuery<NodeConnection<Extrinsic>, Error>({
    queryKey: ['latestTransactions', first],
    queryFn: ({ pageParam }) =>
      fetchLatestTransactions({ first, pageParam: pageParam as string | null }),
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.pageInfo.endCursor,
    staleTime: 15 * 1000,
  });
}
