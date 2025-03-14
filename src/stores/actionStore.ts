import { create } from 'zustand';
import { useWalletStore } from '@/stores/walletStore';
import {
  convertToSmallestUnit,
  performBalanceTransfer,
} from '@/lib/services/actions/transferBalance';
import { postData } from '@/lib/services/actions/postData';
import { validateTransfer } from '@/lib/validators/transferValidation';
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
  walletAddress?: string; // Add wallet address to track which wallet performed the action
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
  } catch (error) {
    console.error('Failed to load actions from localStorage:', error);
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
  } catch (error) {
    console.error('Failed to save actions to localStorage:', error);
  }
};

interface ActionsStore {
  isProcessing: boolean;
  error: string | null;
  actions: ActionRecord[];
  currentWalletAddress: string | undefined;
  transferAvail: (
    recipient: string,
    amount: string
  ) => Promise<ActionRecord | void>;
  submitData: (data: string) => Promise<ActionRecord | void>;
  updateActionStatus: (id: string, updates: Partial<ActionRecord>) => void;
  clearActions: () => void;
  removeAction: (id: string) => void;
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

    const actions = loadActionsFromStorage(walletAddress);
    set({ actions, currentWalletAddress: walletAddress });
  },

  updateActionStatus: (id, updates) => {
    const { currentWalletAddress } = get();

    set((state) => {
      const updatedActions = state.actions.map((action) =>
        action.id === id ? { ...action, ...updates } : action
      );
      saveActionsToStorage(currentWalletAddress, updatedActions);
      return { actions: updatedActions };
    });
  },

  transferAvail: async (recipient, amount) => {
    const { wallet, account, balance } = useWalletStore.getState();
    const { currentWalletAddress, loadWalletActions } = get();
    const address = account?.address;

    // If wallet has changed, load actions for the current wallet
    if (address && address !== currentWalletAddress) {
      loadWalletActions(address);
    }

    set({ error: null, isProcessing: true });

    try {
      const { value: amountBN } = convertToSmallestUnit(amount);
      if (!amountBN) return;
      const validationErrors = validateTransfer(
        recipient,
        amountBN.toString(),
        balance?.free || ''
      );

      if (Object.keys(validationErrors).length > 0) {
        const error = JSON.stringify(validationErrors);
        const failedAction: ActionRecord = {
          id: `action-${Date.now()}`,
          type: 'transfer',
          details: { recipient, amount },
          timestamp: Date.now(),
          status: 'failed',
          error,
          walletAddress: address,
        };

        set((state) => {
          const updatedActions = [failedAction, ...state.actions];
          saveActionsToStorage(address, updatedActions);
          return {
            error,
            actions: updatedActions,
            currentWalletAddress: address,
          };
        });
        return;
      }

      if (!wallet || !account || !address) {
        const error = 'Wallet not connected';
        const failedAction: ActionRecord = {
          id: `action-${Date.now()}`,
          type: 'transfer',
          details: { recipient, amount },
          timestamp: Date.now(),
          status: 'failed',
          error,
        };

        set((state) => {
          const updatedActions = [failedAction, ...state.actions];
          saveActionsToStorage(address, updatedActions);
          return {
            error,
            actions: updatedActions,
          };
        });
        return;
      }

      // First create a pending action
      const pendingAction: ActionRecord = {
        id: `action-${Date.now()}`,
        type: 'transfer',
        details: { recipient, amount },
        timestamp: Date.now(),
        status: 'pending',
        walletAddress: address,
      };

      set((state) => {
        const updatedActions = [pendingAction, ...state.actions];
        saveActionsToStorage(address, updatedActions);
        return {
          actions: updatedActions,
          currentWalletAddress: address,
        };
      });

      // Start the transaction and immediately update to processing
      const result = await performBalanceTransfer(
        account,
        wallet,
        recipient,
        amountBN,
        pendingAction.id
      );

      // First update to processing when transaction starts
      if (result.status === 'processing') {
        get().updateActionStatus(pendingAction.id, {
          status: 'processing',
          transactionHash: result.txHash,
        });
      } else {
        // Handle immediate success or failure
        get().updateActionStatus(pendingAction.id, {
          status: result.status,
          transactionHash: result.txHash,
          blockHash: result.blockHash,
          error:
            result.error ||
            (result.status !== 'success' ? 'Transfer failed' : undefined),
        });
      }
    } catch (err) {
      const { account } = useWalletStore.getState();
      const address = account?.address;
      const error = err instanceof Error ? err.message : 'Transfer failed';
      const failedAction: ActionRecord = {
        id: `action-${Date.now()}`,
        type: 'transfer',
        details: { recipient, amount },
        timestamp: Date.now(),
        status: 'failed',
        error,
        walletAddress: address,
      };

      set((state) => {
        const updatedActions = [failedAction, ...state.actions];
        saveActionsToStorage(address, updatedActions);
        return {
          error,
          actions: updatedActions,
          currentWalletAddress: address,
        };
      });
    } finally {
      set({ isProcessing: false });
    }
  },

  submitData: async (data) => {
    const { wallet, account } = useWalletStore.getState();
    const address = account?.address;
    const { currentWalletAddress, loadWalletActions } = get();

    // If wallet has changed, load actions for the current wallet
    if (address && address !== currentWalletAddress) {
      loadWalletActions(address);
    }

    set({ error: null, isProcessing: true });

    try {
      if (!data || data.trim().length === 0) {
        const error = 'Data is required';
        const failedAction: ActionRecord = {
          id: `action-${Date.now()}`,
          type: 'data-submit',
          details: { data },
          timestamp: Date.now(),
          status: 'failed',
          error,
          walletAddress: address,
        };

        set((state) => {
          const updatedActions = [failedAction, ...state.actions];
          saveActionsToStorage(address, updatedActions);
          return {
            error,
            actions: updatedActions,
            currentWalletAddress: address,
          };
        });
        return;
      }

      if (!wallet || !account || !address) {
        const error = 'Wallet not connected';
        const failedAction: ActionRecord = {
          id: `action-${Date.now()}`,
          type: 'data-submit',
          details: { data },
          timestamp: Date.now(),
          status: 'failed',
          error,
        };

        set((state) => {
          const updatedActions = [failedAction, ...state.actions];
          saveActionsToStorage(address, updatedActions);
          return {
            error,
            actions: updatedActions,
          };
        });
        return;
      }

      // First create a pending action
      const pendingAction: ActionRecord = {
        id: `action-${Date.now()}`,
        type: 'data-submit',
        details: { data },
        timestamp: Date.now(),
        status: 'pending',
        walletAddress: address,
      };

      set((state) => {
        const updatedActions = [pendingAction, ...state.actions];
        saveActionsToStorage(address, updatedActions);
        return {
          actions: updatedActions,
          currentWalletAddress: address,
        };
      });

      // Start the transaction
      const result = await postData(account, wallet, data, pendingAction.id);

      // First update to processing when transaction starts
      if (result.status === 'processing') {
        get().updateActionStatus(pendingAction.id, {
          status: 'processing',
          transactionHash: result.txHash,
        });
      } else {
        // Handle immediate success or failure
        get().updateActionStatus(pendingAction.id, {
          status: result.status,
          transactionHash: result.txHash,
          blockHash: result.blockHash,
          error:
            result.error ||
            (result.status !== 'success'
              ? 'Data submission failed'
              : undefined),
        });
      }
    } catch (err) {
      const { account } = useWalletStore.getState();
      const address = account?.address;
      const error =
        err instanceof Error ? err.message : 'Data submission failed';
      const failedAction: ActionRecord = {
        id: `action-${Date.now()}`,
        type: 'data-submit',
        details: { data },
        timestamp: Date.now(),
        status: 'failed',
        error,
        walletAddress: address,
      };

      set((state) => {
        const updatedActions = [failedAction, ...state.actions];
        saveActionsToStorage(address, updatedActions);
        return {
          error,
          actions: updatedActions,
          currentWalletAddress: address,
        };
      });
    } finally {
      set({ isProcessing: false });
    }
  },

  clearActions: () => {
    const { currentWalletAddress } = get();

    if (currentWalletAddress) {
      saveActionsToStorage(currentWalletAddress, []);
      set({ actions: [] });
    }
  },

  removeAction: (id) => {
    const { currentWalletAddress } = get();

    set((state) => {
      const updatedActions = state.actions.filter((action) => action.id !== id);
      saveActionsToStorage(currentWalletAddress, updatedActions);
      return { actions: updatedActions };
    });
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
  }, [address, loadWalletActions]);
};

// Create a hook to manually load actions
export const useLoadActions = () => {
  const { account } = useWalletStore();
  const { loadWalletActions } = useActionsStore();

  return () => {
    if (account?.address) {
      console.log(`Manual load triggered for ${account.address}`);
      loadWalletActions(account.address);
    }
  };
};
