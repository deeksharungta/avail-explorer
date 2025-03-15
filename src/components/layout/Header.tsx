'use client';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import WalletConnect from '../wallet/WalletConnect';

export default function Header() {
  const pathname = usePathname();

  return (
    <nav className='bg-background text-white py-4'>
      <div className='container mx-auto px-4 flex justify-between items-center'>
        <div className='md:flex space-x-6 items-center gap-2'>
          <Link href='/'>
            <Image src='/logo.svg' alt='Logo' width={100} height={100} />
          </Link>
          <Link
            href='/'
            className={`transition-opacity duration-200 ${
              pathname === '/' ? 'opacity-100' : 'opacity-60 hover:opacity-100'
            }`}
          >
            Actions
          </Link>
          <Link
            href='/explorer'
            className={`transition-opacity duration-200 ${
              pathname === '/explorer'
                ? 'opacity-100'
                : 'opacity-60 hover:opacity-100'
            }`}
          >
            Explorer
          </Link>
        </div>
        <WalletConnect />
      </div>
    </nav>
  );
}
