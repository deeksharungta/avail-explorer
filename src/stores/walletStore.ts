import { create } from 'zustand';
import { ApiPromise } from '@polkadot/api';
import { WalletBalance, WalletInterface } from '@/types/wallet';
import { initOnboard } from '@/lib/wallet/onboard';
import {
  connectToAvail,
  fetchBalance,
  formatBalance as formatBalanceUtil,
} from '@/lib/wallet/avail-connection';
import { Account } from '@subwallet-connect/core/dist/types';
import { useEffect } from 'react';
import { useActionsStore } from './actionStore';

interface WalletState {
  wallet: WalletInterface | null;
  account: Account | null;
  api: ApiPromise | null;
  balance: WalletBalance | null;
  isLoading: boolean;
  error: string | null;
  status: string;

  // Actions
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  formatBalance: (balance: string) => string;
}

export const useWalletStore = create<WalletState>((set, get) => ({
  wallet: null,
  account: null,
  api: null,
  balance: null,
  isLoading: false,
  error: null,
  status: 'Disconnected',

  connectWallet: async () => {
    set({ isLoading: true, error: null, status: 'Connecting...' });

    try {
      const onboard = initOnboard();
      const wallets = await onboard.connectWallet();

      if (!wallets || wallets.length === 0) {
        set({
          isLoading: false,
          error: 'No wallet connected',
          status: 'Connection failed',
        });
        return;
      }

      const connectedWallet = wallets[0];

      if (connectedWallet.type !== 'substrate') {
        set({
          isLoading: false,
          error:
            'Please connect a Substrate compatible wallet for Avail Network',
          status: 'Connection failed',
        });
        return;
      }

      // Connect to Avail network
      const { api } = await connectToAvail();

      // Fetch balance
      const connectedAccount = connectedWallet.accounts[0];
      const accountBalance = connectedAccount?.address
        ? await fetchBalance(api, connectedAccount.address)
        : null;

      set({
        wallet: connectedWallet,
        account: connectedAccount,
        api,
        balance: accountBalance,
        isLoading: false,
        status: 'Connected to Avail Network',
      });

      // Ensure actions are loaded for this account
      if (connectedAccount?.address) {
        const { loadWalletActions } = useActionsStore.getState();
        loadWalletActions(connectedAccount.address);
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : String(error),
        status: 'Connection failed',
      });
    }
  },

  disconnectWallet: () => {
    const { api } = get();

    if (api) {
      api.disconnect();
    }

    // Clear actions when wallet disconnects
    const { loadWalletActions } = useActionsStore.getState();
    loadWalletActions('');

    set({
      wallet: null,
      account: null,
      api: null,
      balance: null,
      status: 'Disconnected',
      error: null,
    });
  },

  formatBalance: (balance: string) => formatBalanceUtil(balance),
}));

export const useWalletInit = () => {
  const { account } = useWalletStore();
  const { loadWalletActions } = useActionsStore();

  // Load actions whenever this component mounts and account is available
  useEffect(() => {
    if (account?.address) {
      // Use a small timeout to ensure this runs after wallet store is updated
      setTimeout(() => {
        loadWalletActions(account.address);
      }, 100);
    }
  }, [account, loadWalletActions]);

  return null;
};
