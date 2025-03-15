import React from 'react';
import {
  Hash,
  CheckCircle,
  XCircle,
  Blocks,
  Clock,
  User,
  Settings,
  FileText,
  DollarSign,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { formatDate } from '@/lib/utils';
import { ExtrinsicWithRelations } from '@/types/graphql';
import InfoItem from './InfoItem';

// Color mapping for status and module icons
const STATUS_COLORS = {
  success: 'text-green-500',
  failed: 'text-red-500',
};

interface ExtrinsicOverviewProps {
  extrinsic: ExtrinsicWithRelations;
}

const ExtrinsicOverview: React.FC<ExtrinsicOverviewProps> = ({ extrinsic }) => {
  // Determine status icon and color
  const StatusIcon = extrinsic.success ? CheckCircle : XCircle;
  const statusColor = extrinsic.success
    ? STATUS_COLORS.success
    : STATUS_COLORS.failed;

  return (
    <Card className='bg-secondary/70 border-white/20 mb-6 shadow-lg'>
      <CardContent className='py-6'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <InfoItem
            label='EXTRINSIC HASH'
            value={extrinsic.txHash}
            copyable
            icon={Hash}
            iconClassName='text-blue-400'
          />
          <InfoItem
            label='STATUS'
            value={extrinsic.success ? 'Completed' : 'Failed'}
            icon={StatusIcon}
            iconClassName={statusColor}
          />
          <InfoItem
            label='BLOCK'
            value={extrinsic.blockHeight}
            icon={Blocks}
            iconClassName='text-purple-400'
          />
          <InfoItem
            label='TIMESTAMP'
            value={formatDate(extrinsic.timestamp)}
            icon={Clock}
            iconClassName='text-orange-400'
          />
          <InfoItem
            label='SIGNER'
            value={extrinsic.signer}
            copyable
            icon={User}
            iconClassName='text-teal-400'
          />
          <InfoItem
            label='MODULE'
            value={extrinsic.module}
            icon={Settings}
            iconClassName='text-indigo-400'
          />
          <InfoItem
            label='CALL'
            value={extrinsic.call}
            icon={FileText}
            iconClassName='text-cyan-400'
          />
          <InfoItem
            label='FEES'
            value={
              extrinsic.feesRounded ? `${extrinsic.feesRounded} AVAIL` : '0'
            }
            icon={DollarSign}
            iconClassName='text-green-400'
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default ExtrinsicOverview;
