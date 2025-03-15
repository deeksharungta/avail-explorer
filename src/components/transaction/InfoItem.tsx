import React from 'react';
import { Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { copyToClipboard } from '@/lib/utils';

interface InfoItemProps {
  label: string;
  value: string | number;
  copyable?: boolean;
  tooltip?: string;
  icon?: React.ComponentType<{ className?: string }>;
  iconClassName?: string;
}

const InfoItem: React.FC<InfoItemProps> = ({
  label,
  value,
  copyable = false,
  tooltip,
  icon: Icon,
  iconClassName = 'text-white/60',
}) => (
  <div className='flex items-center space-x-3 bg-white/5 rounded-lg p-3 hover:bg-white/10 transition-all duration-300'>
    {Icon && (
      <div className='flex-shrink-0'>
        <Icon className={`h-5 w-5 ${iconClassName}`} />
      </div>
    )}
    <div className='flex-grow'>
      <span className='block text-white/60 text-xs font-medium uppercase tracking-wider mb-1'>
        {label}
      </span>
      <div className='flex items-center'>
        {tooltip ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className='text-white font-medium break-all cursor-help'>
                  {value?.toString()}
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>{tooltip}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <span className='text-white font-medium break-all'>
            {value?.toString()}
          </span>
        )}

        {copyable && (
          <Button
            variant='ghost'
            size='sm'
            className='ml-2 h-6 w-6 p-0 hover:bg-white/20 cursor-pointer opacity-70 hover:opacity-100 transition-all'
            onClick={() => copyToClipboard(tooltip || value?.toString())}
          >
            <Copy className='h-3 w-3 text-white' />
          </Button>
        )}
      </div>
    </div>
  </div>
);

export default InfoItem;
