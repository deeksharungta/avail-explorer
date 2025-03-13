import Onboard from '@subwallet-connect/core';
import injectedModule from '@subwallet-connect/injected-wallets';
import subwalletModule from '@subwallet-connect/subwallet';
import subwalletPolkadotModule from '@subwallet-connect/subwallet-polkadot';
import { AvailNetworkConfig } from '@/types/network';

export const AVAIL_NETWORK_CONFIG: AvailNetworkConfig = {
  id: '0xd43540ba6d3eb4897c28a66783d5cb5b27d651bd627adc952caef1bfd2a4b157',
  namespace: 'substrate',
  token: 'AVAIL',
  label: 'Avail Turing Testnet',
  rpcUrl: 'https://turing-rpc.avail.so/rpc',
  decimal: 18,
};

export const initOnboard = () => {
  const injected = injectedModule();
  const subwalletWallet = subwalletModule();
  const subwalletPolkadotWallet = subwalletPolkadotModule();

  return Onboard({
    wallets: [injected, subwalletWallet, subwalletPolkadotWallet],
    chains: [], // Empty for EVM chains
    chainsPolkadot: [AVAIL_NETWORK_CONFIG],
  });
};
