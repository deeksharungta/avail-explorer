import type { Signer } from '@polkadot/types/types/extrinsic';
import { Account } from '@subwallet-connect/core/dist/types';

export interface WalletBalance {
  free: string;
}

export interface WalletInterface {
  signer?: Signer | undefined;
  accounts?: Account[];
  type?: string;
}
