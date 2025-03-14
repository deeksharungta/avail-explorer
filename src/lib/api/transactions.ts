import graphqlClient from '@/lib/services/graphql/client';
import {
  GET_LATEST_TRANSACTIONS,
  GET_TRANSACTION_BY_HASH,
  GET_TRANSACTION_STATS,
} from '@/lib/services/graphql/queries/transactions';
import {
  ExtrinsicsResponse,
  ExtrinsicResponse,
  ExtrinsicStatsResponse,
} from '@/types/graphql';

interface GetTransactionsParams {
  first: number;
  after?: string;
}

// Fetch the latest transactions with pagination
export async function getLatestTransactions({
  first = 10,
  after,
}: GetTransactionsParams) {
  try {
    const data = await graphqlClient.request<ExtrinsicsResponse>(
      GET_LATEST_TRANSACTIONS,
      {
        first,
        after: after || null,
      }
    );
    return data.extrinsics;
  } catch (error) {
    console.error('Error fetching latest transactions:', error);
    throw new Error('Failed to fetch latest transactions');
  }
}

// Fetch a specific transaction by hash
export async function getTransactionByHash(hash: string) {
  try {
    const data = await graphqlClient.request<ExtrinsicResponse>(
      GET_TRANSACTION_BY_HASH,
      { hash }
    );

    // If transaction exists, return the first node
    if (
      data.extrinsics &&
      data.extrinsics.nodes &&
      data.extrinsics.nodes.length > 0
    ) {
      return data.extrinsics.nodes[0];
    }

    // Transaction not found
    return null;
  } catch (error) {
    console.error(`Error fetching transaction ${hash}:`, error);
    throw new Error('Failed to fetch transaction details');
  }
}

// Fetch transaction statistics
export async function getTransactionStats() {
  try {
    const data = await graphqlClient.request<ExtrinsicStatsResponse>(
      GET_TRANSACTION_STATS
    );

    return {
      totalFees: data.extrinsics.aggregates.sum.feesRounded || 0,
      averageFee: data.extrinsics.aggregates.average.feesRounded || 0,
    };
  } catch (error) {
    console.error('Error fetching transaction stats:', error);
    throw new Error('Failed to fetch transaction statistics');
  }
}
