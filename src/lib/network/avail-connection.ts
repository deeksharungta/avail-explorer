import { ApiPromise, WsProvider } from '@polkadot/api';
import { WalletBalance } from '@/types/wallet';
import { AVAIL_NODE_ENDPOINT } from '../config/endpoints';
import Big from 'big.js';

export const connectToAvail = async (): Promise<{
  api: ApiPromise;
}> => {
  const provider = new WsProvider(AVAIL_NODE_ENDPOINT);

  const api = await ApiPromise.create({ provider });
  await api.isReady;

  return { api };
};

export const fetchBalance = async (
  api: ApiPromise,
  address: string
): Promise<WalletBalance> => {
  try {
    const { data: balance } = await api.query.system.account(address);

    console.log(` balance of ${balance.free}`);
    console.log(`hey, ${balance.free}`);
    return {
      free: balance.free.toString(),
    };
  } catch (err) {
    console.error('Error fetching balance:', err);
    throw err;
  }
};

export const formatBalance = (
  balanceStr: string,
  decimal: number = 18
): string => {
  if (!balanceStr) return '0';
  const avlValue = Number(balanceStr) / Math.pow(10, decimal);
  return Big(avlValue).toFixed(4, 0).toString();
};
