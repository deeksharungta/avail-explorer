import { useInfiniteQuery } from '@tanstack/react-query';
import { TransformedAccountTransfers } from '@/types/graphql';

interface GetAccountTransfersParams {
  address: string;
  first?: number;
}

// Fetch account transfers with pagination
const fetchAccountTransfers = async ({
  address,
  first = 20,
  pageParam,
}: GetAccountTransfersParams & { pageParam: string | null }) => {
  const params = new URLSearchParams();
  params.append('first', first.toString());
  if (pageParam) params.append('after', pageParam);

  const response = await fetch(
    `/api/accounts/${address}/transfers?${params.toString()}`
  );
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to fetch account transfers');
  }

  const result = await response.json();
  return result.data as TransformedAccountTransfers;
};

// Infinite query hook for transfers
export function useAccountTransfers({
  address,
  first = 20,
}: GetAccountTransfersParams) {
  return useInfiniteQuery<TransformedAccountTransfers, Error>({
    queryKey: ['accountTransfers', address, first],
    queryFn: ({ pageParam }) =>
      fetchAccountTransfers({
        address,
        first,
        pageParam: pageParam as string | null,
      }),
    initialPageParam: null,
    getNextPageParam: (lastPage) => {
      // Extract cursors from sent and received transfers
      const sentCursor = lastPage.sent.pageInfo.endCursor;
      const receivedCursor = lastPage.received.pageInfo.endCursor;

      // Return cursor for next page if there are more items
      if (
        lastPage.sent.pageInfo.hasNextPage ||
        lastPage.received.pageInfo.hasNextPage
      ) {
        // Return the later cursor if both exist
        if (sentCursor && receivedCursor) {
          return sentCursor > receivedCursor ? sentCursor : receivedCursor;
        }
        // Otherwise return whichever exists
        return sentCursor || receivedCursor || null;
      }

      // No more pages
      return null;
    },
    enabled: !!address,
    staleTime: 30 * 1000, // Consider data stale after 30 seconds
  });
}
