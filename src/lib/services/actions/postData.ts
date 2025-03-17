import { SDK } from 'avail-js-sdk';
import { SignerOptions } from '@polkadot/api/types';
import { Account } from '@subwallet-connect/core/dist/types';
import { APP_ID } from '@/lib/config/constants';
import { WalletInterface } from '@/types/wallet';
import {
  ActionRecord,
  handleTransactionError,
  useActionsStore,
} from '@/stores/actionStore';
import { AVAIL_WS_RPC } from '@/lib/config/endpoints';

export interface DataPostingResult {
  txHash?: string;
  blockHash?: string;
  status: 'pending' | 'processing' | 'success' | 'failed';
  error?: string;
}

// Post data to Avail blockchain
export const postData = async (
  account: Account,
  wallet: WalletInterface,
  data: string
): Promise<DataPostingResult> => {
  // Input validation
  if (!account || !wallet) {
    return {
      status: 'failed',
      error: 'Wallet not connected',
    };
  }

  if (!data || data.trim() === '') {
    return {
      status: 'failed',
      error: 'Data cannot be empty',
    };
  }

  try {
    const sdk = await SDK.New(AVAIL_WS_RPC);
    const transaction = sdk.tx.dataAvailability.submitData(data);

    return new Promise<DataPostingResult>((resolve) => {
      try {
        // Tracking for whether we got initial response
        let initialResponse = false;
        let actionId: string | null = null;

        transaction.tx
          .signAndSend(
            account.address,
            { signer: wallet.signer, app_id: APP_ID } as Partial<SignerOptions>,
            ({ status, txHash, events }) => {
              // Only after successful signing, create the action record
              if (!initialResponse) {
                initialResponse = true;

                // Create the action only after signing is successful
                const { actions } = useActionsStore.getState();
                const newAction: ActionRecord = {
                  id: `action-${Date.now()}`,
                  type: 'data-submit',
                  details: { data },
                  timestamp: Date.now(),
                  status: 'processing',
                  transactionHash: txHash?.toHex(),
                  walletAddress: account.address,
                };

                // Store the action ID for later use
                actionId = newAction.id;

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
                  txHash: txHash?.toHex(),
                  status: 'processing',
                });
              }
              // Transaction is included in a block
              else if (status.isInBlock) {
                // Check for ExtrinsicFailed event
                let hasError = false;
                let errorInfo = '';

                if (events) {
                  events.forEach(({ event }) => {
                    if (event.method === 'ExtrinsicFailed') {
                      hasError = true;
                      const [dispatchError] = event.data;
                      errorInfo = dispatchError.toString();
                    }
                  });
                }

                // Find the action with matching txHash
                const { actions } = useActionsStore.getState();
                const actionToUpdate = actions.find(
                  (a) => a.transactionHash === txHash?.toHex()
                );

                if (hasError && actionToUpdate) {
                  // Update action status to failed
                  useActionsStore
                    .getState()
                    .updateActionStatus(actionToUpdate.id, {
                      blockHash: status.asInBlock.toHex(),
                      status: 'failed',
                      error: `Transaction failed: ${errorInfo}`,
                    });

                  resolve({
                    txHash: txHash?.toHex(),
                    blockHash: status.asInBlock.toHex(),
                    status: 'failed',
                    error: `Transaction failed: ${errorInfo}`,
                  });
                } else if (actionToUpdate) {
                  useActionsStore
                    .getState()
                    .updateActionStatus(actionToUpdate.id, {
                      blockHash: status.asInBlock.toHex(),
                      status: 'processing',
                    });
                  resolve({
                    txHash: txHash?.toHex(),
                    blockHash: status.asInBlock.toHex(),
                    status: 'processing',
                  });
                }
              }
              // Additional status for completeness
              else if (status.isFinalized) {
                // Find the action with matching txHash
                const { actions } = useActionsStore.getState();
                const actionToUpdate = actions.find(
                  (a) => a.transactionHash === txHash?.toHex()
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
          .catch((err) => {
            const errorMessage = handleTransactionError(err);

            // Update the action status to failed
            if (actionId) {
              useActionsStore.getState().updateActionStatus(actionId, {
                status: 'failed',
                error: errorMessage,
              });
            }

            resolve({
              status: 'failed',
              error: errorMessage,
            });
          });
      } catch (err) {
        const errorMessage = handleTransactionError(err);

        resolve({
          status: 'failed',
          error: errorMessage,
        });
      }
    });
  } catch (err) {
    const errorMessage = handleTransactionError(err);

    return {
      status: 'failed',
      error: errorMessage,
    };
  }
};
