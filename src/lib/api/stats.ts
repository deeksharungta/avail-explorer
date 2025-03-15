import graphqlClient from '@/lib/services/graphql/client';
import {
  GET_LATEST_BLOCK,
  GET_DATA_SUBMISSION_STATS,
  GET_TOTAL_TRANSACTION_COUNTS,
  GET_TOTAL_BLOBS_COUNTS,
} from '@/lib/services/graphql/queries/stats';
import {
  LatestBlockResponse,
  DataSubmissionStatsResponse,
  TotalTransactionCountsResponse,
  TotalBlobsCountsResponse,
} from '@/types/graphql';

// Fetch latest block
export async function fetchLatestBlock() {
  try {
    const data = await graphqlClient.request<LatestBlockResponse>(
      GET_LATEST_BLOCK
    );
    return data.latestBlock.nodes[0] || null;
  } catch (error) {
    console.error('Error fetching latest block:', error);
    throw new Error('Failed to fetch latest block');
  }
}

// Fetch total transactions count
export async function fetchTotalTransactions() {
  try {
    const data = await graphqlClient.request<TotalTransactionCountsResponse>(
      GET_TOTAL_TRANSACTION_COUNTS
    );
    return {
      totalTransactions: data.totalTransactions.totalCount,
    };
  } catch (error) {
    console.error('Error fetching total transactions:', error);
    throw new Error('Failed to fetch total transactions');
  }
}

// Fetch total blobs count
export async function fetchTotalBlobs() {
  try {
    const data = await graphqlClient.request<TotalBlobsCountsResponse>(
      GET_TOTAL_BLOBS_COUNTS
    );
    return {
      totalBlobs: data.totalDataSubmissions.totalCount,
    };
  } catch (error) {
    console.error('Error fetching total transactions:', error);
    throw new Error('Failed to fetch total transactions');
  }
}

// Fetch data submission statistics
export async function fetchDataSubmissionStats() {
  try {
    const data = await graphqlClient.request<DataSubmissionStatsResponse>(
      GET_DATA_SUBMISSION_STATS
    );
    return {
      totalByteSize: data.dataSubmissionStats.aggregates.sum.byteSize || 0,
      avgByteSize: data.dataSubmissionStats.aggregates.average.byteSize || 0,
      totalFees: data.dataSubmissionStats.aggregates.sum.fees || 0,
      avgFees: data.dataSubmissionStats.aggregates.average.fees || 0,
    };
  } catch (error) {
    console.error('Error fetching data submission stats:', error);
    throw new Error('Failed to fetch data submission statistics');
  }
}
