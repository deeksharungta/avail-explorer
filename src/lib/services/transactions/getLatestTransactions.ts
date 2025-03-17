import { ApiPromise } from '@polkadot/api';
import { u8aToHex } from '@polkadot/util';
import { Vec } from '@polkadot/types';
import { EventRecord } from '@polkadot/types/interfaces';
import { connectToAvail } from '@/lib/wallet/walletConnection';

// Define interfaces
interface TransactionEvent {
  section: string;
  method: string;
  data: string;
}

interface Transaction {
  blockNumber: number;
  timestamp: string;
  index: number;
  hash: string;
  signer: string;
  section: string;
  method: string;
  args: string[];
  nonce: number | string;
  tip: string;
  era: string | Record<string, unknown>;
  success: boolean;
  failed: boolean;
  events: TransactionEvent[];
}

interface BlockData {
  number: number;
  hash: string;
  transactionCount: number;
  transactions: Transaction[];
}

// Function to get the latest 10 transactions and subscribe to new transaction events
export async function getLatestTransactionsAndSubscribe(
  onNewTransaction: (transaction: Transaction) => void
): Promise<{ transactions: Transaction[]; unsubscribe: () => void }> {
  // Connect to the Avail network
  const { api } = await connectToAvail();

  const latestTransactions = await getLatestTransactions(api, 10);

  const unsubscribe = await subscribeToNewBlocks(api, (error, blockData) => {
    if (error) {
      console.error('Error in block subscription:', error);
      return;
    }

    if (blockData && blockData.transactions.length > 0) {
      // Call the callback for each new transaction
      blockData.transactions.forEach((tx) => {
        onNewTransaction(tx);
      });
    }
  });

  return {
    transactions: latestTransactions,
    unsubscribe,
  };
}

// Get the latest N transactions
async function getLatestTransactions(
  api: ApiPromise,
  limit: number = 10
): Promise<Transaction[]> {
  // Get the latest block hash
  const latestHash = await api.rpc.chain.getBlockHash();
  const latestBlock = await api.rpc.chain.getBlock(latestHash);
  const latestBlockNumber = latestBlock.block.header.number.toNumber();

  const allTransactions: Transaction[] = [];

  // Start from the latest block and work backwards
  let blockCount = 0;
  let transactionCount = 0;

  for (let i = 0; transactionCount < limit && blockCount < 50; i++) {
    const blockNumber = latestBlockNumber - i;
    if (blockNumber < 0) break; // Safety check for genesis block

    blockCount++;

    try {
      const blockHash = await api.rpc.chain.getBlockHash(blockNumber);
      const transactions = await getTransactionData(api, blockHash);

      if (transactions.length > 0) {
        // Add transactions to our collection, limited to what we need
        const neededCount = limit - transactionCount;
        const transactionsToAdd = transactions.slice(0, neededCount);
        allTransactions.push(...transactionsToAdd);
        transactionCount += transactionsToAdd.length;
      }
    } catch (error) {
      console.error(`Error processing block #${blockNumber}:`, error);
    }

    // Break if we've found enough transactions
    if (transactionCount >= limit) break;
  }

  return allTransactions;
}

// Get transaction data from a specific block
async function getTransactionData(
  api: ApiPromise,
  blockHash: Uint8Array
): Promise<Transaction[]> {
  try {
    // Get the block with the specified hash
    const signedBlock = await api.rpc.chain.getBlock(blockHash);

    // Get all events for this block
    const allEvents = (await api.query.system.events.at(
      blockHash
    )) as Vec<EventRecord>;

    // Process all extrinsics in the block
    const transactions: Transaction[] = [];

    signedBlock.block.extrinsics.forEach(
      ({ method, signer, era, nonce, tip }, index) => {
        // Find events related to this extrinsic
        const events = allEvents.filter(
          ({ phase }) =>
            phase.isApplyExtrinsic && phase.asApplyExtrinsic.eq(index)
        );

        // Determine if extrinsic was successful
        const success = events.some(({ event }) =>
          api.events.system.ExtrinsicSuccess.is(event)
        );

        // Determine if extrinsic failed
        const failed = events.some(({ event }) =>
          api.events.system.ExtrinsicFailed.is(event)
        );

        // Get the hash of the extrinsic
        const extrinsicHash = api.registry.hash(
          signedBlock.block.extrinsics[index].toU8a()
        );

        transactions.push({
          blockNumber: signedBlock.block.header.number.toNumber(),
          timestamp: new Date().toISOString(),
          index,
          hash: extrinsicHash.toHex(),
          signer: signer ? signer.toString() : 'none',
          section: method.section,
          method: method.method as string,
          args: method.args.map((arg) => arg.toString()),
          nonce: nonce ? nonce.toNumber() : 'none',
          tip: tip ? (tip.toHuman() as string) : 'none',
          era: era ? (era.toHuman() as string) : 'none',
          success,
          failed,
          events: events.map(({ event }) => ({
            section: event.section,
            method: event.method as string,
            data: event.data.toString(),
          })),
        });
      }
    );

    return transactions;
  } catch (error) {
    console.warn(
      `Error getting transaction data for block ${u8aToHex(blockHash)}: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
    return [];
  }
}

// Subscribe to new blocks and extract transaction data
async function subscribeToNewBlocks(
  api: ApiPromise,
  callback: (error: Error | null, blockData?: BlockData) => void
): Promise<() => void> {
  const unsubscribe = await api.rpc.chain.subscribeNewHeads(async (header) => {
    try {
      const blockNumber = header.number.toNumber();

      const blockHash = await api.rpc.chain.getBlockHash(blockNumber);

      // Get transaction data from this block
      const transactions = await getTransactionData(api, blockHash);

      // Create block data object
      const blockData: BlockData = {
        number: blockNumber,
        hash: blockHash.toHex(),
        transactionCount: transactions.length,
        transactions,
      };

      // Call the callback with new block data
      callback(null, blockData);
    } catch (error) {
      callback(error instanceof Error ? error : new Error('Unknown error'));
    }
  });

  return unsubscribe;
}
