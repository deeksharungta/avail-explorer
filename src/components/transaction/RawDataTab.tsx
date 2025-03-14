import { copyToClipboard } from '@/lib/utils';
import { Extrinsic } from '@/types/graphql';
import { Copy } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import CodeBlock from './CodeBlock';

const RawDataTab: React.FC<{ extrinsic: Extrinsic }> = ({ extrinsic }) => {
  const rawData = `{
  "id": "${extrinsic.id}",
  "blockId": "${extrinsic.blockId}",
  "module": "${extrinsic.module}",
  "call": "${extrinsic.call}",
  "timestamp": "${extrinsic.timestamp}",
  "txHash": "${extrinsic.txHash}",
  "blockHeight": ${extrinsic.blockHeight},
  "success": ${extrinsic.success},
  "isSigned": ${extrinsic.isSigned},
  "extrinsicIndex": ${extrinsic.extrinsicIndex},
  "hash": "${extrinsic.hash}",
  "signer": "${extrinsic.signer}",
  "signature": "${extrinsic.signature}",
  "fees": "${extrinsic.fees}",
  "feesRounded": ${extrinsic.feesRounded},
  "nonce": ${extrinsic.nonce},
  "argsName": ${JSON.stringify(extrinsic.argsName)},
  "argsValue": ${JSON.stringify(extrinsic.argsValue)},
  "nbEvents": ${extrinsic.nbEvents}
}`;

  return (
    <Card className='bg-secondary border-white/10'>
      <CardContent>
        <CodeBlock content={rawData} className='mb-4' />
        <Button
          variant='outline'
          size='sm'
          className='flex items-center border-white/10 bg-secondary text-white hover:bg-white/10 cursor-pointer hover:text-white'
          onClick={() => copyToClipboard(JSON.stringify(extrinsic, null, 2))}
        >
          <Copy className='mr-1 h-4 w-4' />
          Copy Raw Data
        </Button>
      </CardContent>
    </Card>
  );
};

export default RawDataTab;
