'use client';
import React from 'react';
import { formatBalance } from '@/lib/wallet/walletConnection';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, Copy, LogOut } from 'lucide-react';
import { copyToClipboard, formatAddress } from '@/lib/utils';
import { useWalletStore } from '@/stores/walletStore';

export default function WalletConnect() {
  const {
    account,
    balance,
    wallet,
    isLoading,
    connectWallet,
    disconnectWallet,
  } = useWalletStore();

  const handleConnect = () => {
    connectWallet(true);
  };

  return (
    <div className='relative'>
      {!wallet ? (
        <button
          onClick={handleConnect}
          disabled={isLoading}
          className='bg-background text-primary hover:bg-muted px-4 py-2 rounded-md font-normal transition-all duration-200 cursor-pointer m-[1px] border-primary border h-12'
        >
          {isLoading ? 'Connecting...' : 'Connect Wallet'}
        </button>
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger className='bg-background text-primary hover:bg-muted px-4 py-2 rounded-md font-normal transition-all duration-200 cursor-pointer m-[1px] border-primary border flex items-center space-x-2 focus:outline-none'>
            <span>
              {account ? formatAddress(account.address) : 'Connected'}
            </span>
            <ChevronDown className='h-4 w-4 ml-2' />
          </DropdownMenuTrigger>
          <DropdownMenuContent className='w-56 bg-black border border-gray-800 p-0 rounded-lg text-white'>
            <DropdownMenuItem
              onClick={() => {
                copyToClipboard(account?.address || '');
              }}
              className='text-white hover:text-blue-300 hover:bg-gray-900 cursor-pointer px-5 py-3 flex items-center text-md justify-between w-full focus:bg-transparent focus:text-white'
            >
              <span className='text-white'>Copy Address</span>

              <Copy className='h-4 w-4 text-white' />
            </DropdownMenuItem>
            {balance && (
              <div className='px-5 py-3 border-b border-gray-800 flex items-center justify-between'>
                <span className='text-gray-400 font-medium'>Balance</span>
                <span className='text-white text-sm font-normal whitespace-nowrap'>
                  {formatBalance(balance.free)} AVL
                </span>
              </div>
            )}

            <DropdownMenuItem
              onClick={disconnectWallet}
              className='text-red-500 hover:text-red-400 hover:bg-black cursor-pointer px-5 py-3 flex items-center text-md justify-between w-full focus:bg-transparent focus:text-red-500'
            >
              <span>Disconnect</span>
              <LogOut className='h-4 w-4 text-red-500' />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
