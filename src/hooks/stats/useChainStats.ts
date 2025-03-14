import { useQuery } from '@tanstack/react-query';

// Fetch chain statistics
const fetchChainStats = async () => {
  const response = await fetch('/api/stats/chain');
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to fetch chain statistics');
  }

  const result = await response.json();
  return result.data;
};

// Chain stats hook with auto-refresh
export function useChainStats(refetchInterval = 10000) {
  return useQuery({
    queryKey: ['chainStats'],
    queryFn: fetchChainStats,
    refetchInterval,
    staleTime: refetchInterval / 2,
  });
}
