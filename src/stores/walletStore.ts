import { create } from 'zustand';
import { ApiPromise } from '@polkadot/api';
import { WalletBalance, WalletInterface } from '@/types/wallet';
import { initOnboard } from '@/lib/wallet/onboard';
import {
  connectToAvail,
  fetchBalance,
  formatBalance as formatBalanceUtil,
} from '@/lib/network/avail-connection';
import { Account } from '@subwallet-connect/core/dist/types';

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
        throw new Error('No wallet connected');
      }

      const connectedWallet = wallets[0];

      if (connectedWallet.type !== 'substrate') {
        throw new Error(
          'Please connect a Substrate compatible wallet for Avail Network'
        );
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
