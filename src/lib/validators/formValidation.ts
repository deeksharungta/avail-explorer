import BigNumber from 'bignumber.js';
import { decodeAddress, encodeAddress } from '@polkadot/keyring';
import { hexToU8a, isHex } from '@polkadot/util';
import { WalletBalance } from '@/types/wallet';
import { BN } from 'avail-js-sdk';

export interface ValidationErrors {
  recipient?: string;
  amount?: string;
  data?: string;
  balance?: string;
}

export interface ConversionResult {
  success: boolean;
  value?: BN;
  error?: string;
}

// Validates if a string is a valid Substrate address
export const isValidSubstrateAddress = (address: string): boolean => {
  if (!address) return false;

  // Check if address starts with correct prefix for Substrate (usually '5')
  if (!address.startsWith('5')) return false;

  try {
    // Attempt to decode the address
    const decoded = isHex(address) ? hexToU8a(address) : decodeAddress(address);

    if (decoded.length < 32 || decoded.length > 33) {
      return false;
    }

    encodeAddress(decoded);

    return true;
  } catch {
    return false;
  }
};

// Validates a recipient address
export const validateRecipient = (value: string): string | undefined => {
  if (!value) return 'Recipient address is required';
  if (!isValidSubstrateAddress(value)) return 'Invalid address';
  return undefined;
};

// Validates an amount with balance check
export const validateAmount = (
  value: string,
  balance: WalletBalance | null
): string | undefined => {
  if (!value) return 'Amount is required';

  const amountNum = parseFloat(value);
  if (isNaN(amountNum) || amountNum <= 0)
    return 'Amount must be a positive number';

  if (balance?.free) {
    try {
      // First convert to a string with the decimal point
      const amountStr = amountNum.toString();

      // Handle the decimal places correctly
      const [whole, decimalPart] = amountStr.includes('.')
        ? amountStr.split('.')
        : [amountStr, ''];

      // Pad the decimal part to 18 places or truncate if longer
      const decimal = decimalPart.padEnd(18, '0').slice(0, 18);

      // Create the string representation without decimal point
      const amountInSmallestUnit = whole + decimal;

      if (BigInt(amountInSmallestUnit) > BigInt(balance.free)) {
        return 'Insufficient balance';
      }
    } catch (e) {
      console.error('Error comparing balance:', e);
      return 'Error validating amount';
    }
  }

  return undefined;
};

// Validates data submission
export const validateData = (value: string): string | undefined => {
  if (!value) return 'Data is required';
  if (value.length > 1024) return 'Data must be less than 1024 characters';
  return undefined;
};

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

// Validates balance transfer
export const validateTransfer = (
  recipientAddress: string,
  amount: string,
  availableBalance: string
): ValidationErrors => {
  const errors: ValidationErrors = {};

  // Validate recipient address
  const recipientError = validateRecipient(recipientAddress);
  if (recipientError) {
    errors.recipient = recipientError;
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

// Validation for data submission
export const validateDataSubmission = (data: string): ValidationErrors => {
  const errors: ValidationErrors = {};

  const dataError = validateData(data);
  if (dataError) {
    errors.data = dataError;
  }

  return errors;
};

// Form validators object for use in form components
export const validators = {
  recipient: validateRecipient,
  amount: validateAmount,
  data: validateData,
};
