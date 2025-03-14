import graphqlClient from '@/lib/services/graphql/client';
import {
  GET_CHAIN_STATS,
  GET_TRANSACTION_VOLUME,
  GET_DATA_SUBMISSION_VOLUME,
} from '@/lib/services/graphql/queries/stats';
import {
  ChainStatsResponse,
  TransactionVolumeResponse,
  DataSubmissionVolumeResponse,
} from '@/types/graphql';

//Fetch overall chain statistics
export async function getChainStats() {
  try {
    const data = await graphqlClient.request<ChainStatsResponse>(
      GET_CHAIN_STATS
    );

    return {
      latestBlock: data.latestBlock.nodes[0] || null,
      totalBlocks: data.totalBlocks.totalCount || 0,
      totalTransactions: data.totalTransactions.totalCount || 0,
      totalDataSubmissions: data.totalDataSubmissions.totalCount || 0,
      recentBlocks: data.recentBlocks.nodes || [],
      recentTransactions: data.recentTransactions.nodes || [],
      totalDataSize: data.dataSubmissionStats.aggregates.sum.byteSize || 0,
    };
  } catch (error) {
    console.error('Error fetching chain stats:', error);
    throw new Error('Failed to fetch chain statistics');
  }
}

//Fetch transaction volume over time
export async function getTransactionVolume(timeframe: number) {
  try {
    const data = await graphqlClient.request<TransactionVolumeResponse>(
      GET_TRANSACTION_VOLUME,
      {
        timeframe,
      }
    );

    // Transform data for chart display
    const volumeData = data.extrinsics.groupedAggregates.map((group) => ({
      date: group.keys[0], // First key is the date (from groupBy)
      count: group.count,
    }));

    return volumeData;
  } catch (error) {
    console.error('Error fetching transaction volume:', error);
    throw new Error('Failed to fetch transaction volume data');
  }
}

// Fetch data submission volume over time
export async function getDataSubmissionVolume(timeframe: number) {
  try {
    const data = await graphqlClient.request<DataSubmissionVolumeResponse>(
      GET_DATA_SUBMISSION_VOLUME,
      {
        timeframe,
      }
    );

    // Transform data for chart display
    const volumeData = data.dataSubmissions.groupedAggregates.map((group) => ({
      date: group.keys[0], // First key is the date (from groupBy)
      size: group.sum.byteSize,
    }));

    return volumeData;
  } catch (error) {
    console.error('Error fetching data submission volume:', error);
    throw new Error('Failed to fetch data submission volume data');
  }
}
