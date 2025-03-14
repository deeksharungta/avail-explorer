import BigNumber from 'bignumber.js';
import { decodeAddress, encodeAddress } from '@polkadot/keyring';
import { hexToU8a, isHex } from '@polkadot/util';

export interface TransferValidationErrors {
  recipient?: string;
  amount?: string;
  balance?: string;
}

// Validate transfer details
export const validateTransfer = (
  recipientAddress: string,
  amount: string,
  availableBalance: string
): TransferValidationErrors => {
  const errors: TransferValidationErrors = {};

  // Validate recipient address
  if (!recipientAddress) {
    errors.recipient = 'Recipient address is required';
  } else if (!isValidSubstrateAddress(recipientAddress)) {
    errors.recipient = 'Invalid recipient address';
  }

  // Validate amount
  if (!amount) {
    errors.amount = 'Amount is required';
  } else {
    const amountBN = new BigNumber(amount);
    const balanceBN = new BigNumber(availableBalance);

    if (amountBN.isLessThanOrEqualTo(0)) {
      errors.amount = 'Amount must be greater than zero';
    } else if (amountBN.isGreaterThan(balanceBN)) {
      errors.balance = 'Insufficient balance for transfer';
    }
  }

  return errors;
};

//Validate recepient address
export const isValidSubstrateAddress = (address: string): boolean => {
  try {
    // Attempt to decode the address
    const decoded = isHex(address) ? hexToU8a(address) : decodeAddress(address);

    // Attempt to encode back to ensure validity
    encodeAddress(decoded);

    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};
