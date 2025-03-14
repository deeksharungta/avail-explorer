import { Account } from '@subwallet-connect/core/dist/types';
import { SignerOptions } from '@polkadot/api/types';
import { BN, SDK } from 'avail-js-sdk';
import { WalletInterface } from '@/types/wallet';
import { useActionsStore } from '@/stores/actionStore';
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
  amount: BN,
  actionId: string // Pass the action ID from the store
): Promise<TransactionResult> {
  const { updateActionStatus } = useActionsStore.getState();

  // Create SDK instance
  const sdk = await SDK.New(AVAIL_WS_RPC);

  const transaction = sdk.tx.balances.transferKeepAlive(
    destinationAddress,
    amount
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
            // Initial transaction submission - update state with processing status
            if (!initialResponse) {
              initialResponse = true;

              // Update action status to processing
              updateActionStatus(actionId, {
                status: 'processing',
                transactionHash: txHash.toString(),
              });

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

              if (hasError) {
                // Update action status to failed
                updateActionStatus(actionId, {
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
              } else {
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
              updateActionStatus(actionId, {
                status: 'success',
                error: undefined,
              });
            }
          }
        )
        .catch((error) => {
          // Update action status to failed
          updateActionStatus(actionId, {
            status: 'failed',
            error: error.message || 'Transaction failed',
          });

          resolve({
            txHash: '',
            blockHash: '',
            events: [],
            status: 'failed',
            error: error.message || 'Transaction failed',
          });
        });
    } catch (err) {
      // Update action status to failed
      updateActionStatus(actionId, {
        status: 'failed',
        error: err instanceof Error ? err.message : 'Unknown error',
      });

      resolve({
        txHash: '',
        blockHash: '',
        events: [],
        status: 'failed',
        error: err instanceof Error ? err.message : 'Unknown error',
      });
    }
  });
}

export interface ConversionResult {
  success: boolean;
  value?: BN;
  error?: string;
}

// Convert token amount to smallest unit
export function convertToSmallestUnit(amount: string): ConversionResult {
  try {
    const cleanAmount = amount.trim().replace(/,/g, '');

    // Validate that the string is a valid number
    if (isNaN(Number(cleanAmount))) {
      return {
        success: false,
        error: 'Invalid number format',
      };
    }

    const decimalPlaces = 18;

    const amountBN = new BN(
      (parseFloat(cleanAmount) * Math.pow(10, decimalPlaces)).toFixed(0)
    );
    return {
      success: true,
      value: amountBN,
    };
  } catch (error) {
    console.error('Error converting to smallest unit:', error);
    return {
      success: false,
      error: `Unable to convert amount: ${amount}`,
    };
  }
}
