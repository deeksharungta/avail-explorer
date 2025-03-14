import graphqlClient from '@/lib/services/graphql/client';
import {
  GET_ACCOUNT_BY_ID,
  GET_ACCOUNT_TRANSFERS,
  GET_ACCOUNT_TRANSACTIONS,
} from '@/lib/services/graphql/queries/accounts';
import {
  AccountResponse,
  TransformedAccountTransfers,
  AccountTransfersResponse,
  NodeConnection,
  Extrinsic,
  AccountTransactionsResponse,
} from '@/types/graphql';

interface GetAccountTransfersParams {
  address: string;
  first?: number;
  after?: string;
}

// Fetch account details by address
export async function getAccountById(address: string) {
  if (!address || typeof address !== 'string') {
    throw new Error('Invalid account address');
  }

  try {
    const data = await graphqlClient.request<AccountResponse>(
      GET_ACCOUNT_BY_ID,
      {
        id: address,
      }
    );

    return data.accountEntity;
  } catch (error) {
    console.error(`Error fetching account ${address}:`, error);
    throw new Error('Failed to fetch account details');
  }
}

// Fetch transfers for an account (both sent and received)
export async function getAccountTransfers({
  address,
  first = 20,
  after,
}: GetAccountTransfersParams): Promise<TransformedAccountTransfers> {
  if (!address || typeof address !== 'string') {
    throw new Error('Invalid account address');
  }

  try {
    // Validate parameters
    const limit = Math.min(Math.max(1, first), 20);

    const data = await graphqlClient.request<AccountTransfersResponse>(
      GET_ACCOUNT_TRANSFERS,
      {
        address,
        first: limit,
        after: after || null,
      }
    );

    return {
      sent: data.fromTransfers,
      received: data.toTransfers,
    };
  } catch (error) {
    console.error(`Error fetching transfers for account ${address}:`, error);
    throw new Error('Failed to fetch account transfers');
  }
}

// Fetch transactions initiated by an account
export async function getAccountTransactions({
  address,
  first = 20,
  after,
}: GetAccountTransfersParams): Promise<NodeConnection<Extrinsic>> {
  if (!address || typeof address !== 'string') {
    throw new Error('Invalid account address');
  }

  try {
    // Validate parameters
    const limit = Math.min(Math.max(1, first), 20);

    const data = await graphqlClient.request<AccountTransactionsResponse>(
      GET_ACCOUNT_TRANSACTIONS,
      {
        address,
        first: limit,
        after: after || null,
      }
    );

    return data.extrinsics;
  } catch (error) {
    console.error(`Error fetching transactions for account ${address}:`, error);
    throw new Error('Failed to fetch account transactions');
  }
}
