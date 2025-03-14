import { useQuery } from '@tanstack/react-query';

// Fetch data submission volume
const fetchDataSubmissionVolume = async (timeframe: number) => {
  const response = await fetch(
    `/api/stats/blobs-volume?timeframe=${timeframe}`
  );
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      errorData.error || 'Failed to fetch data submission volume'
    );
  }

  const result = await response.json();
  return result.data;
};

// Data submission volume hook
export function useDataSubmissionVolume(timeframe = 7) {
  return useQuery({
    queryKey: ['dataSubmissionVolume', timeframe],
    queryFn: () => fetchDataSubmissionVolume(timeframe),
    staleTime: 5 * 60 * 1000, // Consider data stale after 5 minutes
  });
}
