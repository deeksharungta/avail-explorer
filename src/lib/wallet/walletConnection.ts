import { ApiPromise, WsProvider } from '@polkadot/api';
import { WalletBalance } from '@/types/wallet';
import Big from 'big.js';
import { AccountInfo } from 'avail-js-sdk/sdk/account';
import { AVAIL_WS_RPC } from '../config/endpoints';

export const connectToAvail = async (): Promise<{
  api: ApiPromise;
}> => {
  const provider = new WsProvider(AVAIL_WS_RPC);

  const api = await ApiPromise.create({ provider });
  await api.isReady;

  return { api };
};

export const fetchBalance = async (
  api: ApiPromise,
  address: string
): Promise<WalletBalance> => {
  try {
    const { data: balance } = (await api.query.system.account(
      address
    )) as unknown as AccountInfo;

    return {
      free: balance.free.toString(),
    };
  } catch (err) {
    console.error('Error fetching balance:', err);
    return {
      free: '0',
    };
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
