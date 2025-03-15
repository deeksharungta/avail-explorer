import { XCircle, RefreshCw } from 'lucide-react';
import { Button } from '../ui/button';

const NoTransactionFound: React.FC<{ hash: string }> = ({ hash }) => {
  return (
    <div className='w-full mx-auto px-4 py-16 max-w-5xl text-center'>
      <div className='bg-secondary border-white/10 rounded-md p-8 flex flex-col items-center justify-center'>
        <div className=' mb-6'>
          <XCircle className='h-16 w-16 text-red-500' />
        </div>
        <h2 className='text-2xl font-bold text-white mb-2'>
          Transaction Not Found
        </h2>
        <p className='text-white/60 mb-6 max-w-md mx-auto'>
          We couldn&apos;t find a transaction with the hash:
        </p>
        <div className='bg-black/50 rounded-md p-3 font-mono text-white mb-6 break-all max-w-md mx-auto'>
          {hash}
        </div>
        <p className='text-white/60 mb-8'>
          The transaction may not exist or could still be processing.
        </p>
      </div>
    </div>
  );
};

export default NoTransactionFound;
