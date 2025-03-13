'use client';

import React from 'react';
import { useWallet } from '@/hooks/useWallet';
import { formatBalance } from '@/lib/network/avail-connection';

export default function WalletConnect() {
  const {
    account,
    wallet,
    balance,
    status,
    error,
    isLoading,
    connectWallet,
    disconnectWallet,
  } = useWallet();

  return (
    <div className='p-6 max-w-lg mx-auto bg-white rounded-lg shadow-md mt-20'>
      <h1 className='text-2xl font-bold mb-4 text-blue-600'>
        Wallet Connection
      </h1>

      <div className='mb-6'>
        {!wallet ? (
          <button
            onClick={connectWallet}
            disabled={isLoading}
            className='w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300'
          >
            {isLoading ? 'Connecting...' : 'Connect SubWallet'}
          </button>
        ) : (
          <button
            onClick={disconnectWallet}
            className='w-full py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700'
          >
            Disconnect Wallet
          </button>
        )}
      </div>

      {wallet && account && (
        <div className='mb-6 p-4 border border-gray-200 rounded-md'>
          <h2 className='text-lg font-semibold mb-2'>Wallet Information</h2>
          <div className='grid grid-cols-3 gap-2 mb-2'>
            <span className='font-medium'>Wallet Type:</span>
            <span className='col-span-2'>{wallet.type}</span>
          </div>
          <div className='grid grid-cols-3 gap-2 mb-2'>
            <span className='font-medium'>Account Name:</span>
            <span className='col-span-2'>{account.uns?.name || 'Unnamed'}</span>
          </div>
          <div className='grid grid-cols-3 gap-2'>
            <span className='font-medium'>Address:</span>
            <span className='col-span-2 break-all text-xs'>
              {account.address}
            </span>
          </div>
        </div>
      )}

      {balance && (
        <div className='p-4 border border-gray-200 rounded-md'>
          <h2 className='text-lg font-semibold mb-2'>Balance Information</h2>
          <div className='grid grid-cols-3 gap-2 mb-2'>
            <span className='font-medium'>Free:</span>
            <span className='col-span-2'>
              {formatBalance(balance.free)} AVL
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
