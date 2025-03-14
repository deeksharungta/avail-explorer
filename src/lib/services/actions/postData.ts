import { SDK } from 'avail-js-sdk';
import { SignerOptions } from '@polkadot/api/types';
import { Account } from '@subwallet-connect/core/dist/types';
import { APP_ID } from '@/lib/config/constants';

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

  const transaction = sdk.tx.dataAvailability.submitData(data);
  return new Promise((resolve, reject) => {
    try {
      transaction.tx
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
