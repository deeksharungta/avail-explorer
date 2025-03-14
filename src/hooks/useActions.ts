'use client';

import { useState } from 'react';
import { useWalletStore } from '@/stores/walletStore';
import {
  convertToSmallestUnit,
  performBalanceTransfer,
} from '@/lib/services/actions/transferBalance';
import { postData } from '@/lib/services/actions/postData';
import { validateTransfer } from '@/lib/validators/transferValidation';

export interface ActionRecord {
  id: string;
  type: 'transfer' | 'data-submit';
  details: {
    recipient?: string;
    amount?: string;
    data?: string;
  };
  timestamp: number;
  status: 'pending' | 'success' | 'failed';
  transactionHash?: string;
  error?: string;
}

export function useActions() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actions, setActions] = useState<ActionRecord[]>([]);

  const { wallet, account, balance } = useWalletStore();

  const performTransfer = async (recipient: string, amount: string) => {
    const amountBN = convertToSmallestUnit(amount);
    // Validate inputs
    const validationErrors = validateTransfer(
      recipient,
      amountBN.toString(),
      balance?.free || ''
    );
    if (Object.keys(validationErrors).length > 0) {
      throw new Error(JSON.stringify(validationErrors));
    }

    // Ensure wallet and account are connected
    if (!wallet || !account) {
      throw new Error('Wallet not connected');
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Perform transfer
      const result = await performBalanceTransfer(
        account,
        wallet,
        recipient,
        amountBN
      );

      // Create action record
      const actionRecord: ActionRecord = {
        id: result.txHash,
        type: 'transfer',
        details: { recipient, amount },
        timestamp: Date.now(),
        status: 'success',
        transactionHash: result.txHash,
      };

      // Update actions
      setActions((prev) => [actionRecord, ...prev]);

      return actionRecord;
    } catch (err) {
      // Create failed action record
      const actionRecord: ActionRecord = {
        id: Date.now().toString(),
        type: 'transfer',
        details: { recipient, amount },
        timestamp: Date.now(),
        status: 'failed',
        error: err instanceof Error ? err.message : 'Unknown error',
      };

      // Update actions and set error
      setActions((prev) => [actionRecord, ...prev]);
      setError(err instanceof Error ? err.message : 'Transfer failed');

      throw err;
    } finally {
      setIsProcessing(false);
    }
  };

  const submitData = async (data: string) => {
    // Validate data
    if (!data || data.trim().length === 0) {
      throw new Error('Data is required');
    }

    // Ensure wallet and account are connected
    if (!wallet || !account) {
      throw new Error('Wallet not connected');
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Submit data
      const result = await postData(account, wallet, data);

      // Create action record
      const actionRecord: ActionRecord = {
        id: result.txHash || Date.now().toString(),
        type: 'data-submit',
        details: { data },
        timestamp: Date.now(),
        status: result.status === 'success' ? 'success' : 'failed',
        transactionHash: result.txHash,
        error: result.error,
      };

      // Update actions
      setActions((prev) => [actionRecord, ...prev]);

      return actionRecord;
    } catch (err) {
      // Create failed action record
      const actionRecord: ActionRecord = {
        id: Date.now().toString(),
        type: 'data-submit',
        details: { data },
        timestamp: Date.now(),
        status: 'failed',
        error: err instanceof Error ? err.message : 'Unknown error',
      };

      // Update actions and set error
      setActions((prev) => [actionRecord, ...prev]);
      setError(err instanceof Error ? err.message : 'Data submission failed');

      throw err;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    performTransfer,
    submitData,
    isProcessing,
    error,
    actions,
  };
}
