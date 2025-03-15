import React from 'react';
import {
  Settings,
  FileText,
  Layers,
  Repeat,
  ShieldCheck,
  Clock,
  Code,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ExtrinsicWithRelations } from '@/types/graphql';
import InfoItem from './InfoItem';
import CodeBlock from './CodeBlock';

interface ExtrinsicDetailsTabProps {
  extrinsic: ExtrinsicWithRelations;
}

const ExtrinsicDetailsTab: React.FC<ExtrinsicDetailsTabProps> = ({
  extrinsic,
}) => (
  <Card className='bg-secondary/70 border-white/20 shadow-lg'>
    <CardContent className='py-6 space-y-6'>
      <div>
        <h3 className='text-lg font-medium text-white mb-4 flex items-center'>
          <Settings className='h-5 w-5 mr-2 text-blue-400' />
          Call Information
        </h3>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <InfoItem
            label='MODULE'
            value={extrinsic.module}
            icon={Layers}
            iconClassName='text-indigo-400'
          />
          <InfoItem
            label='CALL'
            value={extrinsic.call}
            icon={FileText}
            iconClassName='text-cyan-400'
          />
          <InfoItem
            label='NONCE'
            value={extrinsic.nonce}
            icon={Repeat}
            iconClassName='text-purple-400'
          />
          <InfoItem
            label='IS SIGNED'
            value={extrinsic.isSigned ? 'Yes' : 'No'}
            icon={ShieldCheck}
            iconClassName={
              extrinsic.isSigned ? 'text-green-400' : 'text-red-400'
            }
          />
        </div>
      </div>

      <Separator className='border-white/10' />

      <div>
        <h3 className='text-lg font-medium text-white mb-4 flex items-center'>
          <Code className='h-5 w-5 mr-2 text-green-400' />
          Signature
        </h3>
        <CodeBlock
          content={extrinsic.signature}
          className='bg-white/5 rounded-lg'
        />
      </div>

      {extrinsic.block && (
        <>
          <Separator className='border-white/10' />
          <div>
            <h3 className='text-lg font-medium text-white mb-4 flex items-center'>
              <Layers className='h-5 w-5 mr-2 text-orange-400' />
              Block Information
            </h3>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <InfoItem
                label='BLOCK NUMBER'
                value={extrinsic.block.number}
                icon={Layers}
                iconClassName='text-amber-400'
              />
              <InfoItem
                label='BLOCK TIMESTAMP'
                value={extrinsic.block.timestamp}
                icon={Clock}
                iconClassName='text-teal-400'
              />
            </div>
          </div>
        </>
      )}

      {extrinsic.block?.headerExtensions?.nodes?.length > 0 && (
        <>
          <Separator className='border-white/10' />
          <div>
            <h3 className='text-lg font-medium text-white mb-4 flex items-center'>
              <ShieldCheck className='h-5 w-5 mr-2 text-pink-400' />
              Header Extensions
            </h3>
            {extrinsic.block.headerExtensions.nodes.map((extension, index) => (
              <div
                key={extension.id}
                className='mb-4 bg-white/5 rounded-lg p-4'
              >
                <h4 className='text-md font-medium text-white/80 mb-3 flex items-center'>
                  <FileText className='h-4 w-4 mr-2 text-blue-400' />
                  Extension {index + 1}: {extension.version}
                </h4>
                {extension.commitments?.nodes?.length > 0 && (
                  <div className='pl-4 border-l border-white/10'>
                    <h5 className='text-sm font-medium text-white/70 mb-3'>
                      Commitments
                    </h5>
                    {extension.commitments.nodes.map((commitment) => (
                      <div
                        key={commitment.id}
                        className='mb-3 bg-white/10 p-3 rounded-lg'
                      >
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                          <InfoItem
                            label='ROWS'
                            value={commitment.rows}
                            icon={Layers}
                            iconClassName='text-green-400'
                          />
                          <InfoItem
                            label='COLS'
                            value={commitment.cols}
                            icon={Layers}
                            iconClassName='text-red-400'
                          />
                          <InfoItem
                            label='DATA ROOT'
                            value={commitment.dataRoot.substring(0, 20) + '...'}
                            tooltip={commitment.dataRoot}
                            icon={Code}
                            iconClassName='text-purple-400'
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </CardContent>
  </Card>
);

export default ExtrinsicDetailsTab;
