import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Extrinsic } from '@/types/graphql';
import InfoItem from './InfoItem';
import CodeBlock from './CodeBlock';

const ExtrinsicDetailsTab: React.FC<{ extrinsic: Extrinsic }> = ({
  extrinsic,
}) => (
  <Card className='bg-secondary border-white/10'>
    <CardContent>
      <div className='space-y-4'>
        <div>
          <h3 className='text-lg font-medium text-white mb-2'>
            Call Information
          </h3>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <InfoItem label='MODULE' value={extrinsic.module} />
            <InfoItem label='CALL' value={extrinsic.call} />
            <InfoItem
              label='EXTRINSIC INDEX'
              value={extrinsic.extrinsicIndex}
            />
            <InfoItem label='NONCE' value={extrinsic.nonce} />
            <InfoItem
              label='IS SIGNED'
              value={extrinsic.isSigned ? 'Yes' : 'No'}
            />
          </div>
        </div>

        <Separator className='border-white/10' />

        <div>
          <h3 className='text-lg font-medium text-white mb-2'>Arguments</h3>
          <CodeBlock content={JSON.stringify(extrinsic.argsValue, null, 2)} />
        </div>

        <Separator className='border-white/10' />

        <div>
          <h3 className='text-lg font-medium text-white mb-2'>Signature</h3>
          <CodeBlock content={extrinsic.signature} />
        </div>
      </div>
    </CardContent>
  </Card>
);

export default ExtrinsicDetailsTab;
