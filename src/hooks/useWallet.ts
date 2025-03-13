'use client';

import { useWalletStore } from '@/stores/walletStore';
import { useMemo } from 'react';

export const useWallet = () => {
  const store = useWalletStore();

  // Memoize derived values and methods
  return useMemo(
    () => ({
      ...store,
      isConnected: !!store.account,
      hasBalance: !!store.balance,
    }),
    [store]
  );
};
