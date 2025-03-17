import { Account } from '@subwallet-connect/core/dist/types';
import { SignerOptions } from '@polkadot/api/types';
import { BN, SDK } from 'avail-js-sdk';
import { WalletInterface } from '@/types/wallet';
import {
  ActionRecord,
  handleTransactionError,
  useActionsStore,
} from '@/stores/actionStore';
import { AVAIL_WS_RPC } from '@/lib/config/endpoints';

export interface TransactionResult {
  txHash: string;
  blockHash: string;
  events: string[];
  status: 'pending' | 'processing' | 'success' | 'failed';
  error?: string;
}

// Perform token transfer using Avail SDK
export async function performBalanceTransfer(
  account: Account,
  wallet: WalletInterface,
  destinationAddress: string,
  amountBN: BN,
  amount: string
): Promise<TransactionResult> {
  // Input validation
  if (!account || !wallet) {
    return {
      txHash: '',
      blockHash: '',
      events: [],
      status: 'failed',
      error: 'Wallet not connected',
    };
  }

  if (!destinationAddress || destinationAddress.trim() === '') {
    return {
      txHash: '',
      blockHash: '',
      events: [],
      status: 'failed',
      error: 'Destination address cannot be empty',
    };
  }

  if (!amountBN || amountBN.isZero()) {
    return {
      txHash: '',
      blockHash: '',
      events: [],
      status: 'failed',
      error: 'Amount cannot be zero',
    };
  }

  try {
    // Create SDK instance
    const sdk = await SDK.New(AVAIL_WS_RPC);
    const transaction = sdk.tx.balances.transferKeepAlive(
      destinationAddress,
      amountBN
    );

    return new Promise((resolve) => {
      try {
        let initialResponse = false;

        transaction.tx
          .signAndSend(
            account.address,
            {
              signer: wallet.signer,
              app_id: 0,
            } as Partial<SignerOptions>,
            ({ status, events, txHash }) => {
              // Initial transaction submission
              if (!initialResponse) {
                initialResponse = true;

                // Create the action only after signing is successful
                const { actions } = useActionsStore.getState();
                const newAction: ActionRecord = {
                  id: `action-${Date.now()}`,
                  type: 'transfer',
                  details: {
                    recipient: destinationAddress,
                    amount: amount,
                  },
                  timestamp: Date.now(),
                  status: 'processing',
                  transactionHash: txHash.toString(),
                  walletAddress: account.address,
                };

                // Add the action to the store
                const updatedActions = [newAction, ...actions];
                useActionsStore.setState({ actions: updatedActions });

                // Save to local storage
                if (typeof window !== 'undefined' && account.address) {
                  try {
                    const storageKey = `wallet-actions-${account.address}`;
                    localStorage.setItem(
                      storageKey,
                      JSON.stringify(updatedActions)
                    );
                  } catch {}
                }

                resolve({
                  txHash: txHash.toString(),
                  blockHash: '',
                  events: [],
                  status: 'processing',
                });
              }
              // Transaction is included in a block
              else if (status.isInBlock) {
                let hasError = false;
                let errorInfo = '';
                const processedEvents = events.map((e) => e.event.method);

                events.forEach(({ event }) => {
                  if (event.method === 'ExtrinsicFailed') {
                    hasError = true;
                    const [dispatchError] = event.data;
                    errorInfo = dispatchError.toString();
                  }
                });

                // Find the action with matching txHash
                const { actions } = useActionsStore.getState();
                const actionToUpdate = actions.find(
                  (a) => a.transactionHash === txHash.toString()
                );

                if (hasError && actionToUpdate) {
                  // Update action status to failed
                  useActionsStore
                    .getState()
                    .updateActionStatus(actionToUpdate.id, {
                      status: 'failed',
                      blockHash: status.asInBlock.toString(),
                      error: `Transaction failed: ${errorInfo}`,
                    });

                  resolve({
                    txHash: txHash.toString(),
                    blockHash: status.asInBlock.toString(),
                    events: processedEvents,
                    status: 'failed',
                    error: `Transaction failed: ${errorInfo}`,
                  });
                } else if (actionToUpdate) {
                  useActionsStore
                    .getState()
                    .updateActionStatus(actionToUpdate.id, {
                      blockHash: status.asInBlock.toString(),
                    });

                  resolve({
                    txHash: txHash.toString(),
                    blockHash: status.asInBlock.toString(),
                    events: processedEvents,
                    status: 'processing',
                  });
                }
              }
              // Additional status updates for completeness
              else if (status.isFinalized) {
                // Find the action with matching txHash
                const { actions } = useActionsStore.getState();
                const actionToUpdate = actions.find(
                  (a) => a.transactionHash === txHash.toString()
                );

                if (actionToUpdate) {
                  useActionsStore
                    .getState()
                    .updateActionStatus(actionToUpdate.id, {
                      status: 'success',
                      error: undefined,
                    });
                }
              }
            }
          )
          .catch((error) => {
            const errorMessage = handleTransactionError(error);

            // If signing fails, don't create an action record
            resolve({
              txHash: '',
              blockHash: '',
              events: [],
              status: 'failed',
              error: errorMessage,
            });
          });
      } catch (err) {
        const errorMessage = handleTransactionError(err);

        resolve({
          txHash: '',
          blockHash: '',
          events: [],
          status: 'failed',
          error: errorMessage,
        });
      }
    });
  } catch (err) {
    const errorMessage = handleTransactionError(err);

    return {
      txHash: '',
      blockHash: '',
      events: [],
      status: 'failed',
      error: errorMessage,
    };
  }
}
