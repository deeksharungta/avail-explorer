import Onboard from '@subwallet-connect/core';
// import injectedModule from '@subwallet-connect/injected-wallets';
import subwalletPolkadotModule from '@subwallet-connect/subwallet-polkadot';
import { AvailNetworkConfig } from '@/types/network';
import talismanModule from '@subwallet-connect/talisman';
import polkadot_jsModule from '@subwallet-connect/polkadot-js';
import { AVAIL_HTTP_RPC } from '../config/endpoints';
import polkadotVaultModule from '@subwallet-connect/polkadot-vault';

export const AVAIL_NETWORK_CONFIG: AvailNetworkConfig = {
  id: '0x1',
  namespace: 'substrate',
  token: 'AVAIL',
  label: 'Avail Turing Testnet',
  rpcUrl: AVAIL_HTTP_RPC,
  decimal: 18,
};

export const initOnboard = () => {
  // // Initialize injected module with the filter
  // const injected = injectedModule({
  //   filter: {
  //     substrate: true,
  //     evm: false,
  //   },
  // });

  const subwalletPolkadotWallet = subwalletPolkadotModule();
  const polkadotWallet = polkadot_jsModule();
  const talismanWallet = talismanModule();
  const polkadotVaultWallet = polkadotVaultModule();

  const wallets = [
    subwalletPolkadotWallet,
    polkadotWallet,
    talismanWallet,
    polkadotVaultWallet,
  ];

  return Onboard({
    wallets: wallets,
    chains: [], // Empty for EVM chains
    chainsPolkadot: [AVAIL_NETWORK_CONFIG],
    appMetadata: {
      name: 'Avail Explorer',
      recommendedInjectedWallets: [
        { name: 'SubWallet', url: 'https://subwallet.app/' },
        { name: 'Polkadot{.js}', url: 'https://polkadot.js.org/extension/' },
      ],
    },
  });
};
