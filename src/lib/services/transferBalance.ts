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

  const transaction = sdk.tx.balances.transferKeepAlive(
    destinationAddress,
    amount
  );

  return new Promise((resolve, reject) => {
    try {
      transaction.tx
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
  try {
    const cleanAmount = amount.trim().replace(/,/g, '');

    // Validate that the string is a valid number
    if (isNaN(Number(cleanAmount))) {
      throw new Error('Invalid number format');
    }

    const decimalPlaces = 18;

    const amountBN = new BN(
      (parseFloat(cleanAmount) * Math.pow(10, decimalPlaces)).toFixed(0)
    );

    return amountBN;
  } catch (error) {
    console.error('Error converting to smallest unit:', error);
    throw new Error(`Unable to convert amount: ${amount}`);
  }
}
