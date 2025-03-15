import graphqlClient from '@/lib/services/graphql/client';
import {
  GET_LATEST_TRANSACTIONS,
  GET_TRANSACTION_BY_HASH,
  GET_TRANSACTION_RELATED_DATA,
} from '@/lib/services/graphql/queries/transactions';
import {
  ExtrinsicResponse,
  ExtrinsicRelatedDataResponse,
  LatestTransactionsResponse,
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
    const data = await graphqlClient.request<LatestTransactionsResponse>(
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

// Fetch related data for a specific transaction using its ID
export async function getTransactionRelatedData(extrinsicId: string) {
  try {
    const data = await graphqlClient.request<ExtrinsicRelatedDataResponse>(
      GET_TRANSACTION_RELATED_DATA,
      { extrinsicId }
    );

    return {
      events: data.events?.nodes || [],
      transfers: data.transferEntities?.nodes || [],
      dataSubmissions: data.dataSubmissions?.nodes || [],
    };
  } catch (error) {
    console.error(
      `Error fetching related data for extrinsic ${extrinsicId}:`,
      error
    );
    throw new Error('Failed to fetch transaction related data');
  }
}

// Fetch detailed transaction information with related data
export async function getDetailedTransactionByHash(hash: string) {
  try {
    // Step 1: Get the transaction details
    const transaction = await getTransactionByHash(hash);

    if (!transaction) {
      return null;
    }

    // Step 2: Get related data using the extrinsic ID
    const relatedData = await getTransactionRelatedData(transaction.id);

    // Step 3: Combine the data
    return {
      ...transaction,
      relatedData,
    };
  } catch (error) {
    console.error(`Error fetching detailed transaction ${hash}:`, error);
    throw new Error('Failed to fetch detailed transaction information');
  }
}
