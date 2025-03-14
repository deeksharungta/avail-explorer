import { Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { copyToClipboard } from '@/lib/utils';

const InfoItem: React.FC<{
  label: string;
  value: string | number;
  copyable?: boolean;
}> = ({ label, value, copyable = false }) => (
  <div className='flex flex-col space-y-1 py-2'>
    <span className='text-white/60 text-sm'>{label}</span>
    <div className='flex items-center'>
      <span className='text-white font-medium break-all'>
        {value.toString()}
      </span>
      {copyable && (
        <Button
          variant='ghost'
          size='sm'
          className='ml-2 h-6 w-6 p-0 hover:bg-white/10 cursor-pointer'
          onClick={() => copyToClipboard(value.toString())}
        >
          <Copy className='h-3 w-3 text-white' />
        </Button>
      )}
    </div>
  </div>
);

export default InfoItem;
