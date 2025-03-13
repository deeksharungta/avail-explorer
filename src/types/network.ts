export type NetworkNamespace = 'substrate' | 'evm';

export interface AvailNetworkConfig {
  id: string;
  namespace: NetworkNamespace;
  token: string;
  label: string;
  rpcUrl: string;
  decimal: number;
}
