// import { getLatestTransactionsAndSubscribe } from '@/lib/services/transactions/getLatestTransactions';
// import { useQuery, useQueryClient } from '@tanstack/react-query';
// import { useEffect, useRef } from 'react';

// export interface TransactionData {
//   nodes: {
//     txHash: string;
//     call: string;
//     module: string;
//     timestamp: string;
//     success: boolean;
//     blockNumber?: number;
//   }[];
//   pageInfo: {
//     hasNextPage: boolean;
//     endCursor: string | null;
//   };
//   totalCount: number;
// }

// // Define the RawTransaction interface
// interface RawTransaction {
//   hash: string;
//   method: string;
//   section: string;
//   timestamp: string;
//   success: boolean;
//   blockNumber?: number;
// }

// // Hook to fetch and subscribe to latest transactions
// export function useLatestTransactions() {
//   const queryClient = useQueryClient();
//   const unsubscribeRef = useRef<(() => void) | null>(null);
//   const latestBlockNumberRef = useRef<number | null>(null);

//   // Fetch the latest transactions and set up subscription
//   const query = useQuery<TransactionData, Error>({
//     queryKey: ['transactions', 'latest'],
//     queryFn: async () => {
//       // Clean up any existing subscription
//       if (unsubscribeRef.current) {
//         unsubscribeRef.current();
//         unsubscribeRef.current = null;
//       }

//       // Get transactions and set up subscription
//       const { transactions, unsubscribe } =
//         await getLatestTransactionsAndSubscribe(
//           (newTransaction: RawTransaction) => {
//             // Update latest block number if this transaction has a new block
//             if (
//               newTransaction.blockNumber &&
//               (!latestBlockNumberRef.current ||
//                 newTransaction.blockNumber > latestBlockNumberRef.current)
//             ) {
//               latestBlockNumberRef.current = newTransaction.blockNumber;

//               // Trigger UI refresh when new block is detected
//               queryClient.setQueryData(
//                 ['latestBlock'],
//                 latestBlockNumberRef.current
//               );
//             }

//             // When a new transaction arrives, update the query data
//             queryClient.setQueryData<TransactionData>(
//               ['transactions', 'latest'],
//               (oldData) => {
//                 if (!oldData) {
//                   return {
//                     nodes: [mapTransactionToTableFormat(newTransaction)],
//                     pageInfo: { hasNextPage: false, endCursor: null },
//                     totalCount: 1,
//                   };
//                 }

//                 // Check if transaction already exists
//                 const exists = oldData.nodes.some(
//                   (tx) => tx.txHash === newTransaction.hash
//                 );
//                 if (exists) return oldData;

//                 // Add the new transaction to the beginning of the list
//                 // Keep only the most recent transactions (limit to show only the latest 10)
//                 const MAX_TRANSACTIONS = 10;
//                 return {
//                   ...oldData,
//                   nodes: [
//                     mapTransactionToTableFormat(newTransaction),
//                     ...oldData.nodes,
//                   ].slice(0, MAX_TRANSACTIONS), // Keep only the latest 10
//                   totalCount: oldData.totalCount + 1,
//                 };
//               }
//             );
//           }
//         );

//       // Store the unsubscribe function
//       unsubscribeRef.current = unsubscribe;

//       // Find the highest block number from transactions
//       const highestBlockNumber = transactions.reduce(
//         (max, tx) =>
//           tx.blockNumber && tx.blockNumber > max ? tx.blockNumber : max,
//         0
//       );

//       if (highestBlockNumber > 0) {
//         latestBlockNumberRef.current = highestBlockNumber;
//         // Set the latest block number for other components to access
//         queryClient.setQueryData(['latestBlock'], highestBlockNumber);
//       }

//       // Map the transactions to the format expected by the table component
//       return {
//         nodes: transactions.map(mapTransactionToTableFormat),
//         pageInfo: {
//           hasNextPage: false,
//           endCursor: null,
//         },
//         totalCount: transactions.length,
//       };
//     },
//     staleTime: 30000,
//     refetchOnWindowFocus: false,
//   });

//   // Clean up subscription when component unmounts
//   useEffect(() => {
//     return () => {
//       if (unsubscribeRef.current) {
//         unsubscribeRef.current();
//         unsubscribeRef.current = null;
//       }
//     };
//   }, []);

//   return query;
// }

// // Maps transaction from API format to required format
// function mapTransactionToTableFormat(transaction: RawTransaction) {
//   return {
//     txHash: transaction.hash,
//     call: transaction.method,
//     module: transaction.section,
//     timestamp: transaction.timestamp,
//     success: transaction.success,
//     blockNumber: transaction.blockNumber,
//   };
// }

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
      success: Math.random() > 0.2,
      blockId: `${Math.floor(Math.random() * 100000) + 1000000}`,
    })),
};

// Fetch latest transactions wrapper function
const fetchLatestTransactions = async (params = { first: 10 }) => {
  try {
    const extrinsics = await getLatestTransactions(params);
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
    retry: 3,
  });
}
