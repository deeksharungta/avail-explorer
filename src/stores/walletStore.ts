import { create } from 'zustand';
import { ApiPromise } from '@polkadot/api';
import { WalletBalance, WalletInterface } from '@/types/wallet';
import { initOnboard } from '@/lib/wallet/onboard';
import { connectToAvail, fetchBalance } from '@/lib/wallet/walletConnection';
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
  connectWallet: (showPopup?: boolean) => Promise<boolean>;
  disconnectWallet: () => void;
}

export const useWalletStore = create<WalletState>((set, get) => ({
  wallet: null,
  account: null,
  api: null,
  balance: null,
  isLoading: false,
  error: null,
  status: 'Disconnected',

  connectWallet: async (showPopup = true) => {
    set({ isLoading: true, error: null, status: 'Connecting...' });

    try {
      const onboard = initOnboard();
      const savedWallet = localStorage.getItem('avail-wallet-info');
      let wallets;

      set({ status: 'Initializing wallet connection...' });

      if (savedWallet) {
        // If we have a saved wallet, try to connect
        const { walletName } = JSON.parse(savedWallet);
        wallets = await onboard.connectWallet({
          autoSelect: {
            label: walletName,
            disableModals: !showPopup,
            type: 'substrate',
          },
        });
      } else if (showPopup) {
        // Only show the wallet connect popup if explicitly requested
        wallets = await onboard.connectWallet();
      } else {
        // First-time visitor with no popup requested
        set({
          isLoading: false,
          status: 'Disconnected',
        });
        return false;
      }

      if (!wallets || wallets.length === 0) {
        set({
          isLoading: false,
          error: showPopup ? 'No wallet connected' : null,
          status: 'Disconnected',
        });
        return false;
      }

      const connectedWallet = wallets[0];

      if (connectedWallet.type !== 'substrate') {
        set({
          isLoading: false,
          error:
            'Please connect a Substrate compatible wallet for Avail Network',
          status: 'Connection failed',
        });
        return false;
      }

      set({ status: 'Connecting to Avail network...' });
      // Connect to Avail network
      const { api } = await connectToAvail();

      // Get the connected account
      const connectedAccount = connectedWallet.accounts[0];

      if (!connectedAccount?.address) {
        set({
          isLoading: false,
          error: 'No account address found in the connected wallet',
          status: 'Connection failed',
        });
        return false;
      }

      set({ status: 'Fetching account balance...' });
      // Fetch balance
      const accountBalance = await fetchBalance(api, connectedAccount.address);

      set({
        wallet: connectedWallet,
        account: connectedAccount,
        api,
        balance: accountBalance,
        isLoading: false,
        status: 'Connected to Avail Network',
      });

      // Ensure actions are loaded for this account
      const { loadWalletActions } = useActionsStore.getState();
      loadWalletActions(connectedAccount.address);

      localStorage.setItem(
        'avail-wallet-info',
        JSON.stringify({
          walletName: connectedWallet.label,
          accountAddress: connectedAccount.address,
        })
      );

      return true;
    } catch (error) {
      console.error('Error connecting wallet:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : String(error),
        status: 'Connection failed',
      });
      return false;
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

    // Remove saved wallet info
    localStorage.removeItem('avail-wallet-info');

    set({
      wallet: null,
      account: null,
      api: null,
      balance: null,
      status: 'Disconnected',
      error: null,
    });
  },
}));

export const useWalletInit = () => {
  const { account } = useWalletStore();
  const { loadWalletActions } = useActionsStore();

  // Load actions whenever this component mounts and account is available
  useEffect(() => {
    if (account?.address) {
      loadWalletActions(account.address);
    }
  }, [account, loadWalletActions]);

  return null;
};

export const WalletInitializer = () => {
  const { connectWallet } = useWalletStore();

  useEffect(() => {
    const initWallet = async () => {
      // Pass false to prevent showing popups on initial load
      await connectWallet(false);
    };

    initWallet();
  }, [connectWallet]);

  return null;
};
