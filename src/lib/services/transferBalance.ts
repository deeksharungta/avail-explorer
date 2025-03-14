import { Account } from '@subwallet-connect/core/dist/types';
import { SignerOptions } from '@polkadot/api/types';
import { BN, SDK } from 'avail-js-sdk';

export interface TransactionResult {
  txHash: string;
  blockHash: string;
  events: string[];
}

// Perform token transfer using Avail SDK
export async function performBalanceTransfer(
  account: Account,
  wallet: any,
  destinationAddress: string,
  amount: BN
): Promise<TransactionResult> {
  // Create SDK instance
  const sdk = await SDK.New('wss://turing-rpc.avail.so/ws');

  return new Promise((resolve, reject) => {
    try {
      const transaction = sdk.tx.balances.transferKeepAlive(
        destinationAddress,
        amount
      );

      const unsubscribe = transaction.tx
        .signAndSend(
          account.address,
          {
            signer: wallet.signer,
            app_id: 0,
          } as Partial<SignerOptions>,
          ({ status, events, txHash }) => {
            if (status.isInBlock) {
              let hasError = false;
              const processedEvents = events.map((e) => e.event.method);

              events.forEach(({ event }) => {
                if (event.method === 'ExtrinsicFailed') {
                  hasError = true;
                  const [dispatchError] = event.data;
                  const errorInfo = dispatchError.toString();

                  reject(new Error(`Transaction failed: ${errorInfo}`));
                }
              });

              if (!hasError) {
                resolve({
                  txHash: txHash.toString(),
                  blockHash: status.asInBlock.toString(),
                  events: processedEvents,
                });
              }

              // Always unsubscribe
              //@ts-expect-error this
              unsubscribe();
            } else if (status.isFinalized) {
              console.log('Transaction finalized:', status.asFinalized.toHex());
            }
          }
        )
        .catch(reject);
    } catch (err) {
      reject(err);
    }
  });
}

// Convert token amount to smallest unit
export function convertToSmallestUnit(amount: string): BN {
  return new BN(amount).mul(new BN('1000000000000000000'));
}
