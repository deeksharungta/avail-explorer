import { create } from 'zustand';
import { useWalletStore } from '@/stores/walletStore';
import { performBalanceTransfer } from '@/lib/services/actions/transferBalance';
import { postData } from '@/lib/services/actions/postData';
import {
  validateTransfer,
  validateDataSubmission,
  convertToSmallestUnit,
} from '@/lib/validators/formValidation';
import { useEffect } from 'react';

export interface ActionRecord {
  id: string;
  type: 'transfer' | 'data-submit';
  details: {
    recipient?: string;
    amount?: string;
    data?: string;
  };
  timestamp: number;
  status: 'pending' | 'processing' | 'success' | 'failed';
  transactionHash?: string;
  blockHash?: string;
  error?: string;
  walletAddress?: string;
}

// Helper functions for localStorage
const STORAGE_KEY_PREFIX = 'wallet-actions-';

const getStorageKey = (walletAddress: string): string => {
  return `${STORAGE_KEY_PREFIX}${walletAddress}`;
};

const loadActionsFromStorage = (
  walletAddress: string | undefined
): ActionRecord[] => {
  if (typeof window === 'undefined' || !walletAddress) return [];

  try {
    const storageKey = getStorageKey(walletAddress);
    const storedActions = localStorage.getItem(storageKey);

    return storedActions ? JSON.parse(storedActions) : [];
  } catch {
    return [];
  }
};

const saveActionsToStorage = (
  walletAddress: string | undefined,
  actions: ActionRecord[]
): void => {
  if (typeof window === 'undefined' || !walletAddress) return;

  try {
    const storageKey = getStorageKey(walletAddress);
    localStorage.setItem(storageKey, JSON.stringify(actions));
  } catch {}
};

// Error handling helper function
export const handleTransactionError = (error: Error | unknown): string => {
  if (!error) return 'Unknown error occurred';

  const errorMsg = error instanceof Error ? error.message : String(error);

  // User rejection errors
  if (
    errorMsg.includes('Rejected by user') ||
    errorMsg.includes('User rejected') ||
    errorMsg.includes('User denied') ||
    errorMsg.includes('Cancelled')
  ) {
    return 'Transaction was rejected in wallet';
  }

  // Network errors
  if (
    errorMsg.includes('network') ||
    errorMsg.includes('connection') ||
    errorMsg.includes('timeout')
  ) {
    return 'Network error. Please check your connection and try again';
  }

  // Insufficient balance
  if (
    errorMsg.includes('balance') ||
    errorMsg.includes('fund') ||
    errorMsg.includes('insufficient')
  ) {
    return 'Insufficient balance for this transaction';
  }

  // Return the original error if no specific handling
  return errorMsg;
};

interface ActionsStore {
  isProcessing: boolean;
  error: string | null;
  actions: ActionRecord[];
  currentWalletAddress: string | undefined;
  transferAvail: (recipient: string, amount: string) => Promise<void>;
  submitData: (data: string) => Promise<void>;
  updateActionStatus: (id: string, updates: Partial<ActionRecord>) => void;
  loadWalletActions: (walletAddress: string) => void;
}

export const useActionsStore = create<ActionsStore>((set, get) => ({
  isProcessing: false,
  error: null,
  actions: [],
  currentWalletAddress: undefined,

  loadWalletActions: (walletAddress) => {
    if (!walletAddress) {
      set({ actions: [], currentWalletAddress: undefined });
      return;
    }

    try {
      const actions = loadActionsFromStorage(walletAddress);
      set({ actions, currentWalletAddress: walletAddress });
    } catch {
      // Still set the wallet address even on error
      set({ actions: [], currentWalletAddress: walletAddress });
    }
  },

  updateActionStatus: (id, updates) => {
    const { currentWalletAddress } = get();

    set((state) => {
      try {
        const updatedActions = state.actions.map((action) =>
          action.id === id ? { ...action, ...updates } : action
        );
        saveActionsToStorage(currentWalletAddress, updatedActions);
        return { actions: updatedActions };
      } catch {
        // Return unchanged state on error
        return state;
      }
    });
  },

  transferAvail: async (recipient, amount) => {
    const { wallet, account, balance } = useWalletStore.getState();
    const { currentWalletAddress, loadWalletActions } = get();
    const address = account?.address;

    // Basic input validation
    if (!recipient || recipient.trim() === '') {
      set({ error: 'Recipient address cannot be empty', isProcessing: false });
      return;
    }

    if (!amount || amount.trim() === '') {
      set({ error: 'Amount cannot be empty', isProcessing: false });
      return;
    }

    // If wallet has changed, load actions for the current wallet
    if (address && address !== currentWalletAddress) {
      loadWalletActions(address);
    }

    set({ error: null, isProcessing: true });

    try {
      const { value: amountBN, success } = convertToSmallestUnit(amount);

      if (!success || !amountBN) {
        set({ error: 'Invalid amount format', isProcessing: false });
        return;
      }

      // Validate the transfer
      const validationErrors = validateTransfer(
        recipient,
        amountBN.toString(),
        balance?.free || '0'
      );

      if (Object.keys(validationErrors).length > 0) {
        const errorMessage = Object.values(validationErrors).join(', ');
        set({
          error: errorMessage,
          isProcessing: false,
        });
        return;
      }

      if (!wallet || !account || !address) {
        set({ error: 'Wallet not connected', isProcessing: false });
        return;
      }

      // Perform the transaction and add the transaction to actions
      const result = await performBalanceTransfer(
        account,
        wallet,
        recipient,
        amountBN,
        amount
      );

      // Check for transaction errors
      if (result.status === 'failed') {
        set({
          error: result.error || 'Transfer failed',
          isProcessing: false,
        });
      }
    } catch (err) {
      const errorMessage = handleTransactionError(err);
      set({
        error: errorMessage,
        isProcessing: false,
      });
    } finally {
      set({ isProcessing: false });
    }
  },

  submitData: async (data) => {
    const { wallet, account } = useWalletStore.getState();
    const address = account?.address;
    const { currentWalletAddress, loadWalletActions } = get();

    // Basic input validation
    if (!data || data.trim() === '') {
      set({ error: 'Data cannot be empty', isProcessing: false });
      return;
    }

    // If wallet has changed, load actions for the current wallet
    if (address && address !== currentWalletAddress) {
      loadWalletActions(address);
    }

    set({ error: null, isProcessing: true });

    try {
      // Validate data submission
      const validationErrors = validateDataSubmission(data);

      if (Object.keys(validationErrors).length > 0) {
        const errorMessage = Object.values(validationErrors).join(', ');
        set({
          error: errorMessage,
          isProcessing: false,
        });
        return;
      }

      if (!wallet || !account || !address) {
        set({ error: 'Wallet not connected', isProcessing: false });
        return;
      }

      // Post data and add the transaction to actions
      const result = await postData(account, wallet, data);

      // Check for transaction errors
      if (result.status === 'failed') {
        set({
          error: result.error || 'Data submission failed',
          isProcessing: false,
        });
      }
    } catch (err) {
      const errorMessage = handleTransactionError(err);
      set({
        error: errorMessage,
        isProcessing: false,
      });
    } finally {
      set({ isProcessing: false });
    }
  },
}));

// Hook to initialize and sync wallet address when component mounts
export const useInitActionsStore = () => {
  const { account } = useWalletStore();
  const address = account?.address;
  const { loadWalletActions, currentWalletAddress } = useActionsStore();

  // Force load wallet actions whenever the account or wallet connection changes
  useEffect(() => {
    if (address) {
      loadWalletActions(address);
    } else if (!address && currentWalletAddress) {
      loadWalletActions('');
    }
  }, [address, loadWalletActions, currentWalletAddress]);
};

// Create a hook to manually load actions
export const useLoadActions = () => {
  const { account } = useWalletStore();
  const { loadWalletActions } = useActionsStore();

  return () => {
    if (account?.address) {
      loadWalletActions(account.address);
    }
  };
};
