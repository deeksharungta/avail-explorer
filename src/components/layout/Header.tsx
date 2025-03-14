'use client';
import Image from 'next/image';
import Link from 'next/link';
import WalletConnect from '../wallet/WalletConnect';

export default function Header() {
  return (
    <nav className='bg-background text-white py-4'>
      <div className='container mx-auto px-4 flex justify-between items-center'>
        <div className='md:flex space-x-6 items-center gap-2'>
          <div className='flex items-center'>
            <Image src='/logo.svg' alt='Logo' width={100} height={100} />
          </div>
          <Link href='/'>Actions</Link>
          <Link href='/transaction'>Transactions</Link>
        </div>
        <WalletConnect />
      </div>
    </nav>
  );
}
