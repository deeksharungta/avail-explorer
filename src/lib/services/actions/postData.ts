import { SDK } from 'avail-js-sdk';
import { SignerOptions } from '@polkadot/api/types';
import { Account } from '@subwallet-connect/core/dist/types';
import { APP_ID } from '@/lib/config/constants';
import { WalletInterface } from '@/types/wallet';
import { useActionsStore } from '@/stores/actionStore';
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
  data: string,
  actionId: string // Pass the action ID from the store
): Promise<DataPostingResult> => {
  const { updateActionStatus } = useActionsStore.getState();

  // Create SDK instance
  if (!account || !wallet) {
    return {
      status: 'failed',
      error: 'Wallet not connected',
    };
  }

  try {
    const sdk = await SDK.New(AVAIL_WS_RPC);
    const transaction = sdk.tx.dataAvailability.submitData(data);

    return new Promise<DataPostingResult>((resolve) => {
      try {
        // Return initial pending status as soon as transaction is signed
        let initialResponse = false;

        transaction.tx
          .signAndSend(
            account.address,
            { signer: wallet.signer, app_id: APP_ID } as Partial<SignerOptions>,
            ({ status, txHash }) => {
              // Initial transaction submission - update state with processing status
              if (!initialResponse) {
                initialResponse = true;

                // Update action status to processing
                updateActionStatus(actionId, {
                  status: 'processing',
                  transactionHash: txHash?.toHex(),
                });

                resolve({
                  txHash: txHash?.toHex(),
                  status: 'processing',
                });
              }
              // Transaction is included in a block
              else if (status.isInBlock) {
                // Update action status to success
                resolve({
                  txHash: txHash?.toHex(),
                  blockHash: status.asInBlock.toHex(),
                  status: 'processing',
                });
              }
              // Additional status for completeness
              else if (status.isFinalized) {
                updateActionStatus(actionId, {
                  status: 'success',
                  error: undefined,
                });

                console.log(
                  'Transaction finalized:',
                  status.asFinalized.toHex()
                );
              }
            }
          )
          .catch((err) => {
            console.error('Transaction error:', err);

            // Update action status to failed
            updateActionStatus(actionId, {
              status: 'failed',
              error: err.message || 'Transaction failed',
            });

            resolve({
              status: 'failed',
              error: err.message || 'Transaction failed',
            });
          });
      } catch (err) {
        console.error('SignAndSend error:', err);

        // Update action status to failed
        updateActionStatus(actionId, {
          status: 'failed',
          error:
            err instanceof Error ? err.message : 'Transaction signing failed',
        });

        resolve({
          status: 'failed',
          error:
            err instanceof Error ? err.message : 'Transaction signing failed',
        });
      }
    });
  } catch (err) {
    console.error('SDK initialization error:', err);

    // Update action status to failed
    updateActionStatus(actionId, {
      status: 'failed',
      error: err instanceof Error ? err.message : 'Failed to initialize SDK',
    });

    return {
      status: 'failed',
      error: err instanceof Error ? err.message : 'Failed to initialize SDK',
    };
  }
};
