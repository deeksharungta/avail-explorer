import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { formatDate } from '@/lib/utils';
import { Extrinsic } from '@/types/graphql';
import InfoItem from './InfoItem';

const ExtrinsicOverview: React.FC<{ extrinsic: Extrinsic }> = ({
  extrinsic,
}) => (
  <Card className='bg-secondary border-white/10 mb-6'>
    <CardContent>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <InfoItem label='EXTRINSIC HASH' value={extrinsic.hash} copyable />
        <InfoItem
          label='STATUS'
          value={extrinsic.success ? 'Completed' : 'Failed'}
        />
        <InfoItem label='BLOCK' value={extrinsic.blockHeight} />
        <InfoItem label='TIMESTAMP' value={formatDate(extrinsic.timestamp)} />
        <InfoItem label='SIGNER' value={extrinsic.signer} copyable />
        <InfoItem label='MODULE' value={extrinsic.module} />
        <InfoItem label='CALL' value={extrinsic.call} />
        <InfoItem label='FEES' value={extrinsic.fees || '0'} />
      </div>
    </CardContent>
  </Card>
);

export default ExtrinsicOverview;
