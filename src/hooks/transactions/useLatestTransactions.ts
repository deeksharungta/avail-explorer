import { useQuery } from '@tanstack/react-query';
import { LatestTransactionsResponse } from '@/types/graphql';
import { getLatestTransactions } from '@/lib/api/transactions';

// Dummy data to show while API is timing out
const DUMMY_TRANSACTIONS = {
  nodes: Array(10)
    .fill(null)
    .map((_, index) => ({
      module: ['balances', 'system', 'staking', 'assets', 'identity'][
        Math.floor(Math.random() * 5)
      ],
      call: ['transfer', 'approve', 'stake', 'claim', 'set_identity'][
        Math.floor(Math.random() * 5)
      ],
      timestamp: new Date(Date.now() - index * 3600000).toISOString(), // Last few hours
      txHash: `0x${Array(64)
        .fill(0)
        .map(() => Math.floor(Math.random() * 16).toString(16))
        .join('')}`,
      success: Math.random() > 0.2, // 80% success rate for dummy data
    })),
};

// Fetch latest transactions wrapper function
const fetchLatestTransactions = async (params = { first: 10 }) => {
  try {
    const extrinsics = await getLatestTransactions(params);
    console.log({ extrinsics });
    return extrinsics;
  } catch (error) {
    console.error('Error in fetchLatestTransactions:', error);
    return DUMMY_TRANSACTIONS;
  }
};

// Latest transactions hook
export function useLatestTransactions(params = { first: 10 }) {
  return useQuery<LatestTransactionsResponse['extrinsics'], Error>({
    queryKey: ['latestTransactions', params],
    queryFn: () => fetchLatestTransactions(params),
    refetchInterval: 20 * 1000, // Poll every 20 seconds
    refetchOnWindowFocus: false,
    staleTime: 10 * 1000,
  });
}
