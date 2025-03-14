import { SDK } from 'avail-js-sdk';
import { SignerOptions } from '@polkadot/api/types';
import { APP_ID } from '../config/constants';
import { Account } from '@subwallet-connect/core/dist/types';

export interface DataPostingResult {
  txHash?: string;
  blockHash?: string;
  status: 'pending' | 'success' | 'failed';
  error?: string;
}

// Post data to Avail blockchain
export const postData = async (
  account: Account,
  wallet: any,
  data: string
): Promise<DataPostingResult> => {
  // Create SDK instance
  if (!account || !wallet) {
    return {
      status: 'failed',
      error: 'Wallet not connected',
    };
  }

  const sdk = await SDK.New('wss://turing-rpc.avail.so/ws');

  return new Promise((resolve, reject) => {
    try {
      const transaction = sdk.tx.dataAvailability.submitData(data);

      const unsubscribe = transaction.tx
        .signAndSend(
          account.address,
          { signer: wallet.signer, app_id: APP_ID } as Partial<SignerOptions>,
          ({ status, txHash }) => {
            if (status.isInBlock) {
              resolve({
                txHash: txHash?.toHex(),
                blockHash: status.asInBlock.toHex(),
                status: 'success',
              });

              // Always unsubscribe
              //@ts-expect-error this
              unsubscribe();
            } else if (status.isFinalized) {
              console.log('Transaction finalized:', status.asFinalized.toHex());
            }
          }
        )
        .catch((err) => {
          console.error('Transaction error:', err);
          reject({
            status: 'failed',
            error: err.message,
          });
        });
    } catch (err) {
      console.error('Submission error:', err);
      reject({
        status: 'failed',
        error: err instanceof Error ? err.message : 'Unknown error',
      });
    }
  });
};
